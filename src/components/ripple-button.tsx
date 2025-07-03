import React, { useRef, useCallback } from 'react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

interface RippleData {
  element: HTMLSpanElement
  animation: Animation
  startTime: number
  cancelled: boolean
}

export const RippleButton: React.FC<Props> = ({ children, className, ...props }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ripplesRef = useRef<Set<RippleData>>(new Set())

  const RIPPLE_OPACITY = 0.08
  const DURATION = 1200
  const RELEASE_DURATION = 600
  const FIXED_COMPLETED_FACTOR = 0.4

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return

    const startTime = Date.now()

    // Container yoksa oluştur
    if (!containerRef.current) {
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.inset = '0'
      container.style.overflow = 'hidden'
      container.style.borderRadius = 'inherit'
      container.style.pointerEvents = 'none'

      button.style.position = 'relative'
      button.appendChild(container)
      containerRef.current = container
    }

    const container = containerRef.current
    const rect = button.getBoundingClientRect()

    // Ripple elementini oluştur
    const ripple = document.createElement('span')

    // Pozisyon hesaplama
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // En uzak köşeye olan mesafeyi hesapla
    const sizeX = Math.max(x, rect.width - x)
    const sizeY = Math.max(y, rect.height - y)
    const size = Math.hypot(sizeX, sizeY) * 2

    // Ripple stillerini ayarla
    ripple.style.position = 'absolute'
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.transform = 'translate(-50%, -50%) scale(0)'
    ripple.style.borderRadius = '50%'
    ripple.style.backgroundColor = 'currentColor'
    ripple.style.opacity = String(RIPPLE_OPACITY)
    ripple.style.pointerEvents = 'none'
    ripple.style.willChange = 'transform, opacity'

    container.appendChild(ripple)

    // Giriş animasyonu
    const expandAnimation = ripple.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0)' },
        { transform: 'translate(-50%, -50%) scale(1)' },
      ],
      {
        duration: DURATION * 0.9,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'forwards',
      },
    )

    const rippleData: RippleData = {
      element: ripple,
      animation: expandAnimation,
      startTime,
      cancelled: false,
    }

    ripplesRef.current.add(rippleData)

    // Çıkış fonksiyonu
    const triggerExit = () => {
      if (rippleData.cancelled) return
      rippleData.cancelled = true

      const elapsed = Date.now() - startTime
      const minimumTime = DURATION * FIXED_COMPLETED_FACTOR

      // Minimum süreyi bekle
      const delay = Math.max(0, minimumTime - elapsed)

      setTimeout(() => {
        // Fade out animasyonu
        const fadeAnimation = ripple.animate(
          [{ opacity: String(RIPPLE_OPACITY) }, { opacity: '0' }],
          {
            duration: RELEASE_DURATION,
            easing: 'ease-out',
            fill: 'forwards',
          },
        )

        fadeAnimation.finished
          .then(() => {
            ripple.remove()
            ripplesRef.current.delete(rippleData)

            // Container'da başka ripple yoksa container'ı da kaldır
            if (container.children.length === 0 && containerRef.current) {
              container.remove()
              containerRef.current = null
            }
          })
          .catch(() => {
            // Animasyon iptal edilse bile temizle
            ripple.remove()
            ripplesRef.current.delete(rippleData)
          })
      }, delay)

      // Event listener'ları kaldır
      document.removeEventListener('pointerup', triggerExit)
      document.removeEventListener('pointercancel', triggerExit)
      button.removeEventListener('pointerleave', handlePointerLeave)
    }

    // Pointer leave için özel handler
    const handlePointerLeave = () => {
      triggerExit()
    }

    // Global event listener'lar (mouseup'ın button dışında da yakalanması için)
    document.addEventListener('pointerup', triggerExit, { once: true })
    document.addEventListener('pointercancel', triggerExit, { once: true })
    button.addEventListener('pointerleave', handlePointerLeave, { once: true })

    // Props'tan gelen onPointerDown'ı çağır
    props.onPointerDown?.(e)
  }, [])

  // Component unmount olduğunda temizlik
  React.useEffect(() => {
    return () => {
      // Tüm aktif ripple'ları temizle
      ripplesRef.current.forEach((rippleData) => {
        if (rippleData.element.parentNode) {
          rippleData.element.remove()
        }
      })
      ripplesRef.current.clear()

      // Container'ı temizle
      if (containerRef.current) {
        containerRef.current.remove()
        containerRef.current = null
      }
    }
  }, [])

  return (
    <button ref={buttonRef} className={className} onPointerDown={handlePointerDown} {...props}>
      {children}
    </button>
  )
}
