import { useEffect, useRef, useState } from 'react'

const W = 246
const H = 92

/**
 * An RGB histogram computed from the actual image, drawn the way Photoshop
 * composites its channels — each one filled, screened over the others.
 */
export default function Histogram({ src }) {
  const ref = useRef(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setState('loading')

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      try {
        // Sample a reduced copy — a 3000px image gives the same shape and
        // costs a fraction of the time.
        const scale = Math.min(1, 220 / Math.max(img.width, img.height))
        const sw = Math.max(1, Math.round(img.width * scale))
        const sh = Math.max(1, Math.round(img.height * scale))
        const off = document.createElement('canvas')
        off.width = sw
        off.height = sh
        const octx = off.getContext('2d', { willReadFrequently: true })
        octx.drawImage(img, 0, 0, sw, sh)
        const { data } = octx.getImageData(0, 0, sw, sh)

        const bins = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)]
        for (let i = 0; i < data.length; i += 4) {
          bins[0][data[i]]++
          bins[1][data[i + 1]]++
          bins[2][data[i + 2]]++
        }

        // Ignore the very top of the peak so one flat colour doesn't crush
        // the rest of the curve.
        const all = [...bins[0], ...bins[1], ...bins[2]].sort((a, b) => a - b)
        const peak = all[Math.floor(all.length * 0.999)] || 1

        const cv = ref.current
        if (!cv) return
        const dpr = Math.min(devicePixelRatio || 1, 2)
        cv.width = W * dpr
        cv.height = H * dpr
        const ctx = cv.getContext('2d')
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, H)

        ctx.globalCompositeOperation = 'lighter'
        const colors = ['rgba(255,64,64,.72)', 'rgba(64,255,96,.72)', 'rgba(64,128,255,.72)']
        bins.forEach((bin, c) => {
          ctx.beginPath()
          ctx.moveTo(0, H)
          for (let v = 0; v < 256; v++) {
            const x = (v / 255) * W
            const y = H - Math.min(1, bin[v] / peak) * (H - 2)
            ctx.lineTo(x, y)
          }
          ctx.lineTo(W, H)
          ctx.closePath()
          ctx.fillStyle = colors[c]
          ctx.fill()
        })
        ctx.globalCompositeOperation = 'source-over'
        setState('ready')
      } catch {
        setState('blocked')   // canvas tainted by a cross-origin image
      }
    }
    img.onerror = () => !cancelled && setState('blocked')
    img.src = src

    return () => { cancelled = true }
  }, [src])

  return (
    <div className="histo">
      <canvas ref={ref} width={W} height={H} aria-label="Image histogram" />
      {state !== 'ready' && (
        <span className="histo-msg">
          {state === 'loading' ? 'Reading levels…' : 'Unavailable'}
        </span>
      )}
      <div className="histo-axis"><span>0</span><span>128</span><span>255</span></div>
    </div>
  )
}
