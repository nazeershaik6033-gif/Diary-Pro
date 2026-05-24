const fs = require('fs')
const path = require('path')

async function generateIcons() {
  let Resvg
  try {
    Resvg = require('@resvg/resvg-js').Resvg
  } catch {
    console.error('⚠ @resvg/resvg-js not found — skipping icon generation')
    return
  }

  const svgPath = path.join(__dirname, '..', 'public', 'logo.svg')
  const iconsDir = path.join(__dirname, '..', 'public', 'icons')

  if (!fs.existsSync(svgPath)) {
    console.error('logo.svg not found at', svgPath)
    process.exit(1)
  }

  const svg = fs.readFileSync(svgPath, 'utf-8')
  fs.mkdirSync(iconsDir, { recursive: true })

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

  for (const size of sizes) {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: size },
      background: '#f5f0e8',
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()
    const outPath = path.join(iconsDir, `icon-${size}x${size}.png`)
    fs.writeFileSync(outPath, pngBuffer)
    console.log(`✓ icon-${size}x${size}.png (${pngBuffer.length} bytes)`)
  }

  console.log('Icons generated successfully.')
}

generateIcons().catch(e => { console.error(e); process.exit(1) })
