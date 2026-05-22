"""
Render public/logo.svg to PWA icon PNGs using a pure-Python SVG subset rasterizer.
Handles: filled polygons, stroked bezier paths, ellipses — with 4× supersampling.
"""
import math, struct, zlib, os

# ── Colours ──────────────────────────────────────────────────────────────────
BG   = (245, 240, 232)   # warm paper  #f5f0e8
DARK = (45, 31, 18)      # dark brown  #2D1F12
AMBE = (181, 101, 29)    # amber       #B5651D
AMB2 = (212, 128, 58)    # light amber #D4803A  (highlight)
BEAN = (122, 61, 16)     # bean groove #7A3D10
SPIN = (26, 13, 5)       # spine       #1A0D05

# ── PNG writer ────────────────────────────────────────────────────────────────
def write_png(pixels, w, h, path):
    def chunk(t, d):
        c = struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
        return struct.pack('>I', len(d)) + t + d + c
    rows = b''.join(b'\x00' + bytes([c for px in pixels[y*w:(y+1)*w] for c in px])
                    for y in range(h))
    data = (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(rows, 9))
            + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(data)

# ── Math helpers ──────────────────────────────────────────────────────────────
def lerp(a, b, t): return a + (b - a) * t
def blend(bg, fg, a):
    a = max(0.0, min(1.0, a))
    return tuple(int(bg[i]*(1-a) + fg[i]*a) for i in range(3))

# ── Rasterizer (operates on a flat pixel list) ────────────────────────────────
class Canvas:
    def __init__(self, w, h, bg=BG):
        self.w = w
        self.h = h
        self.px = [bg] * (w * h)

    def _set(self, x, y, color, alpha=1.0):
        if 0 <= x < self.w and 0 <= y < self.h:
            idx = y * self.w + x
            self.px[idx] = blend(self.px[idx], color, alpha)

    # ── Filled convex/concave polygon (scanline) ──────────────────────────────
    def fill_poly(self, pts, color):
        if len(pts) < 3: return
        min_y = max(0, int(min(p[1] for p in pts)))
        max_y = min(self.h - 1, int(max(p[1] for p in pts)) + 1)
        n = len(pts)
        for y in range(min_y, max_y + 1):
            xs = []
            for i in range(n):
                x0, y0 = pts[i]
                x1, y1 = pts[(i + 1) % n]
                if y0 == y1: continue
                if min(y0, y1) <= y <= max(y0, y1):
                    t = (y - y0) / (y1 - y0)
                    xs.append(x0 + t * (x1 - x0))
            xs.sort()
            for i in range(0, len(xs) - 1, 2):
                for x in range(int(xs[i]), int(xs[i+1]) + 1):
                    self._set(x, y, color)

    # ── Filled ellipse (axis-aligned or rotated) ──────────────────────────────
    def fill_ellipse(self, cx, cy, rx, ry, angle_deg=0, color=DARK, alpha=1.0):
        a = math.radians(angle_deg)
        ca, sa = math.cos(a), math.sin(a)
        mr = max(rx, ry)
        for dy in range(-int(mr) - 2, int(mr) + 3):
            for dx in range(-int(mr) - 2, int(mr) + 3):
                lx =  dx * ca + dy * sa
                ly = -dx * sa + dy * ca
                if (lx/rx)**2 + (ly/ry)**2 <= 1.0:
                    self._set(int(cx + dx), int(cy + dy), color, alpha)

    # ── Thick stroked polyline (round caps via circle stamps) ─────────────────
    def stroke_poly(self, pts, color, width):
        r = width / 2.0
        for i in range(len(pts) - 1):
            x0, y0 = pts[i]
            x1, y1 = pts[i + 1]
            dist = math.hypot(x1 - x0, y1 - y0)
            steps = max(int(dist * 2), 4)
            for j in range(steps + 1):
                t = j / steps
                mx = lerp(x0, x1, t)
                my = lerp(y0, y1, t)
                ir = int(r) + 2
                for dy in range(-ir, ir + 1):
                    for dx in range(-ir, ir + 1):
                        if dx*dx + dy*dy <= r*r:
                            self._set(int(mx + dx), int(my + dy), color)

    # ── Bezier curve → polyline approximation ─────────────────────────────────
    @staticmethod
    def cubic_bezier(p0, p1, p2, p3, steps=40):
        pts = []
        for i in range(steps + 1):
            t = i / steps
            u = 1 - t
            x = u**3*p0[0] + 3*u**2*t*p1[0] + 3*u*t**2*p2[0] + t**3*p3[0]
            y = u**3*p0[1] + 3*u**2*t*p1[1] + 3*u*t**2*p2[1] + t**3*p3[1]
            pts.append((x, y))
        return pts

    @staticmethod
    def quad_bezier(p0, p1, p2, steps=40):
        pts = []
        for i in range(steps + 1):
            t = i / steps
            u = 1 - t
            x = u**2*p0[0] + 2*u*t*p1[0] + t**2*p2[0]
            y = u**2*p0[1] + 2*u*t*p1[1] + t**2*p2[1]
            pts.append((x, y))
        return pts

    # ── Line segment ─────────────────────────────────────────────────────────
    def stroke_line(self, x0, y0, x1, y1, color, width):
        self.stroke_poly([(x0, y0), (x1, y1)], color, width)


# ── Draw the logo on a canvas of given size ────────────────────────────────────
def draw_logo(size):
    # All design coordinates are in a 200×210 space (matching logo.svg viewBox)
    S = size / 210.0   # uniform scale (use height as reference so book isn't clipped)

    def sc(pts):
        """Scale a list of (x,y) tuples from design space to pixel space."""
        if isinstance(pts[0], (int, float)):
            return (pts[0] * S, pts[1] * S)
        return [(x * S, y * S) for x, y in pts]

    def se(cx, cy, rx, ry): return cx*S, cy*S, rx*S, ry*S

    c = Canvas(size, size)

    # ── Book left page ────────────────────────────────────────────────────────
    c.fill_poly(sc([(8,155),(95,142),(95,198),(8,205)]), DARK)
    # ── Book right page ───────────────────────────────────────────────────────
    c.fill_poly(sc([(105,142),(192,155),(192,205),(105,198)]), DARK)
    # ── Spine ─────────────────────────────────────────────────────────────────
    c.fill_poly(sc([(95,142),(105,142),(105,205),(95,205)]), SPIN)
    # ── Amber page-edge lines ─────────────────────────────────────────────────
    c.stroke_line(*sc((14,193)), *sc((94,182)), AMBE, 3*S)
    c.stroke_line(*sc((14,198)), *sc((94,187)), SPIN, 2*S)
    c.stroke_line(*sc((106,182)), *sc((186,193)), AMBE, 3*S)
    c.stroke_line(*sc((106,187)), *sc((186,198)), SPIN, 2*S)

    # ── Cup body (trapezoid) ──────────────────────────────────────────────────
    c.fill_poly(sc([(55,68),(60,140),(140,140),(145,68)]), DARK)
    # ── Flat bottom rectangle of cup ─────────────────────────────────────────
    c.fill_poly(sc([(60,136),(140,136),(140,142),(60,142)]), DARK)
    # ── Cup rim (dark ellipse) ────────────────────────────────────────────────
    cx, cy, rx, ry = se(100, 68, 45, 10)
    c.fill_ellipse(cx, cy, rx, ry, color=DARK)
    # ── Coffee surface (amber) ────────────────────────────────────────────────
    cx, cy, rx, ry = se(100, 68, 40, 8)
    c.fill_ellipse(cx, cy, rx, ry, color=AMBE)
    # ── Surface highlight ─────────────────────────────────────────────────────
    cx, cy, rx, ry = se(90, 66, 15, 3)
    c.fill_ellipse(cx, cy, rx, ry, color=AMB2, alpha=0.7)

    # ── Handle (quadratic bezier stroke, outer then inner gap) ───────────────
    outer = Canvas.quad_bezier(sc((55,80)), sc((22,100)), sc((55,120)), steps=60)
    c.stroke_poly(outer, DARK, 13*S)
    inner = Canvas.quad_bezier(sc((55,85)), sc((30,100)), sc((55,115)), steps=60)
    c.stroke_poly(inner, BG, 7*S)

    # ── Coffee bean ───────────────────────────────────────────────────────────
    cx, cy, rx, ry = se(120, 108, 18, 13)
    c.fill_ellipse(cx, cy, rx, ry, angle_deg=-20, color=AMBE)
    bean_line = Canvas.quad_bezier(sc((112,102)), sc((120,108)), sc((128,114)), steps=30)
    c.stroke_poly(bean_line, BEAN, 2.5*S)

    # ── Steam wisps (cubic bezier strokes) ───────────────────────────────────
    for ox in [0, 20, 40]:  # left, mid, right wisp (offset from x=80)
        bx = 80 + ox
        pts = Canvas.cubic_bezier(
            sc((bx,    52)),
            sc((bx-4,  36)),
            sc((bx,    22)),
            sc((bx-4,   4)),
            steps=50
        )
        c.stroke_poly(pts, DARK, 4.5*S)

    return c.px


# ── 4× supersampled render ────────────────────────────────────────────────────
def render_icon(size):
    SS = 4  # supersampling factor
    big_px = draw_logo(size * SS)
    big_w = size * SS

    pixels = []
    for y in range(size):
        for x in range(size):
            rs = gs = bs = 0
            for dy in range(SS):
                for dx in range(SS):
                    r, g, b = big_px[(y*SS + dy)*big_w + (x*SS + dx)]
                    rs += r; gs += g; bs += b
            n = SS * SS
            pixels.append((rs//n, gs//n, bs//n))
    return pixels


def save_icon(size, path):
    px = render_icon(size)
    write_png(px, size, size, path)
    print(f'  ✓ {size}×{size}  →  {path}')


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
    os.makedirs(out, exist_ok=True)

    # Large sizes first (slower) — skip supersampling overhead for tiny ones
    for sz in [512, 384, 192, 152, 144, 128, 96, 72]:
        save_icon(sz, os.path.join(out, f'icon-{sz}x{sz}.png'))

    print('Done.')
