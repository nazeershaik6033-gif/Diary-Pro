"""
Generate PWA icon PNGs — coffee-cup-on-book silhouette on a warm-paper background.
Pure stdlib: struct + zlib. No external dependencies.
"""
import os, struct, zlib, math

BG   = (245, 240, 232)   # #f5f0e8 warm paper
DARK = (45, 31, 18)      # #2D1F12 dark brown
AMBE = (181, 101, 29)    # #B5651D amber

def png_bytes(pixels, w, h):
    """Encode pixel list (flat list of (r,g,b) tuples, row-major) as PNG bytes."""
    def chunk(ctype, data):
        crc = struct.pack('>I', zlib.crc32(ctype + data) & 0xffffffff)
        return struct.pack('>I', len(data)) + ctype + data + crc

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    rows = b''
    for y in range(h):
        rows += b'\x00'
        for x in range(w):
            r, g, b = pixels[y * w + x]
            rows += bytes([r, g, b])
    idat = zlib.compress(rows, 9)

    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', idat)
            + chunk(b'IEND', b''))

def lerp(a, b, t):
    return int(a + (b - a) * t)

def lerp_color(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))

def blend(bg, fg, alpha):
    """Alpha-blend fg over bg (alpha 0-1)."""
    return tuple(int(bg[i] * (1 - alpha) + fg[i] * alpha) for i in range(3))

def draw_icon(size):
    pixels = [BG] * (size * size)

    s = size / 200.0  # scale factor (design is on a 200px canvas)

    def px(x, y):
        xi, yi = int(x * s), int(y * s)
        if 0 <= xi < size and 0 <= yi < size:
            return yi * size + xi
        return None

    def fill_circle(cx, cy, r, color):
        for dy in range(-int(r * s) - 2, int(r * s) + 2):
            for dx in range(-int(r * s) - 2, int(r * s) + 2):
                dist = math.sqrt(dx*dx + dy*dy)
                if dist <= r * s:
                    idx = px(cx + dx / s, cy + dy / s)
                    if idx is not None:
                        pixels[idx] = color

    def fill_ellipse(cx, cy, rx, ry, angle_deg, color, alpha=1.0):
        """Draw a filled rotated ellipse."""
        a = math.radians(angle_deg)
        cos_a, sin_a = math.cos(a), math.sin(a)
        max_r = max(rx, ry)
        for dy in range(-int((max_r + 2) * s), int((max_r + 2) * s)):
            for dx in range(-int((max_r + 2) * s), int((max_r + 2) * s)):
                # Rotate point back
                lx = (dx * cos_a + dy * sin_a) / s
                ly = (-dx * sin_a + dy * cos_a) / s
                if (lx / rx) ** 2 + (ly / ry) ** 2 <= 1.0:
                    idx = px(cx + dx / s, cy + dy / s)
                    if idx is not None:
                        if alpha < 1.0:
                            pixels[idx] = blend(pixels[idx], color, alpha)
                        else:
                            pixels[idx] = color

    def fill_quad(pts, color):
        """Fill a quadrilateral given as 4 (x,y) points in order."""
        # Convert to pixel coords
        ppx = [(int(p[0] * s), int(p[1] * s)) for p in pts]
        min_y = max(0, min(p[1] for p in ppx))
        max_y = min(size - 1, max(p[1] for p in ppx))
        edges = [ppx[i] for i in range(4)] + [ppx[0]]
        for y in range(min_y, max_y + 1):
            xs = []
            for i in range(4):
                x0, y0 = edges[i]
                x1, y1 = edges[i + 1]
                if y0 == y1:
                    continue
                if min(y0, y1) <= y <= max(y0, y1):
                    t = (y - y0) / (y1 - y0)
                    xs.append(int(x0 + t * (x1 - x0)))
            if len(xs) >= 2:
                xs.sort()
                for x in range(xs[0], xs[-1] + 1):
                    if 0 <= x < size:
                        pixels[y * size + x] = color

    def fill_rect(x1, y1, x2, y2, color):
        for y in range(max(0, int(y1 * s)), min(size, int(y2 * s) + 1)):
            for x in range(max(0, int(x1 * s)), min(size, int(x2 * s) + 1)):
                pixels[y * size + x] = color

    def draw_thick_curve(pts, color, thick):
        """Draw a polyline approximating a curve."""
        for i in range(len(pts) - 1):
            x0, y0 = pts[i][0] * s, pts[i][1] * s
            x1, y1 = pts[i + 1][0] * s, pts[i + 1][1] * s
            steps = max(int(math.sqrt((x1-x0)**2 + (y1-y0)**2)) * 3, 30)
            for j in range(steps + 1):
                t = j / steps
                mx = x0 + (x1 - x0) * t
                my = y0 + (y1 - y0) * t
                r = int(thick * s / 2) + 1
                for dy in range(-r, r + 1):
                    for dx in range(-r, r + 1):
                        if dx*dx + dy*dy <= r*r:
                            xi, yi = int(mx + dx), int(my + dy)
                            if 0 <= xi < size and 0 <= yi < size:
                                pixels[yi * size + xi] = color

    # ── Book (bottom) ──────────────────────────────────────────────────────
    # Left page
    fill_quad([(8,155),(95,142),(95,198),(8,205)], DARK)
    # Right page
    fill_quad([(105,142),(192,155),(192,205),(105,198)], DARK)
    # Spine
    fill_rect(95, 142, 105, 205, (26,13,5))
    # Amber line left page
    draw_thick_curve([(14,193),(94,182)], AMBE, 3)
    # Amber line right page
    draw_thick_curve([(106,182),(186,193)], AMBE, 3)

    # ── Cup body ────────────────────────────────────────────────────────────
    fill_quad([(55,68),(60,140),(140,140),(145,68)], DARK)
    # Top ellipse of cup (dark rim)
    fill_ellipse(100, 68, 45, 10, 0, DARK)
    # Coffee surface amber
    fill_ellipse(100, 68, 40, 8, 0, AMBE)
    # Highlight
    fill_ellipse(90, 66, 15, 3, 0, (212, 128, 58), alpha=0.7)

    # ── Handle ───────────────────────────────────────────────────────────────
    # Approximate handle with thick curved line (outer)
    handle_pts = [(55,80),(38,80),(28,90),(28,100),(28,110),(38,120),(55,120)]
    draw_thick_curve(handle_pts, DARK, 13)
    # Inner gap (bg color)
    handle_inner = [(55,85),(42,85),(35,90),(35,100),(35,110),(42,115),(55,115)]
    draw_thick_curve(handle_inner, BG, 7)

    # ── Coffee bean ─────────────────────────────────────────────────────────
    fill_ellipse(120, 108, 18, 13, -20, AMBE)
    # Bean groove
    draw_thick_curve([(112,102),(120,108),(128,114)], (122,61,16), 2)

    # ── Steam wisps ─────────────────────────────────────────────────────────
    for cx in [80, 100, 120]:
        pts = [
            (cx, 52), (cx - 4, 40), (cx, 30), (cx - 4, 20), (cx, 10), (cx - 4, 2)
        ]
        draw_thick_curve(pts, DARK, 4)

    return pixels

def save_icon(size, path):
    pixels = draw_icon(size)
    data = png_bytes(pixels, size, size)
    with open(path, 'wb') as f:
        f.write(data)
    print(f'  ✓ {path}  ({len(data)//1024}kB)')

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
    os.makedirs(out, exist_ok=True)
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    for sz in sizes:
        save_icon(sz, os.path.join(out, f'icon-{sz}x{sz}.png'))
    print('Done.')
