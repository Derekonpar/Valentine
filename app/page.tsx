'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  // Image is stored in public folder and referenced directly
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [yesButtonStyle, setYesButtonStyle] = useState<React.CSSProperties>({})
  const [isActive, setIsActive] = useState(false)
  const activeTimeRef = useRef<number>(0)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const yesButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => {
    const updateButtonPosition = (x: number, y: number) => {
      setMousePosition({ x, y })

      if (noButtonRef.current) {
        const noButtonRect = noButtonRef.current.getBoundingClientRect()
        const noButtonCenter = {
          x: noButtonRect.left + noButtonRect.width / 2,
          y: noButtonRect.top + noButtonRect.height / 2,
        }

        const distance = Math.sqrt(
          Math.pow(x - noButtonCenter.x, 2) + 
          Math.pow(y - noButtonCenter.y, 2)
        )

        // Small trigger zone: within 50px of the No button
        if (!isActive && distance < 50) {
          setIsActive(true)
          activeTimeRef.current = Date.now()
        }

        // Once active, follow cursor everywhere on screen
        if (isActive) {
          // Calculate base scale based on distance from No button (bigger when closer)
          const baseScale = distance < 50 ? Math.max(3.0, 4.5 - distance / 50) : 3.0
          
          // Calculate time-based growth multiplier (grows gradually over time)
          const elapsedSeconds = activeTimeRef.current > 0 ? (Date.now() - activeTimeRef.current) / 1000 : 0
          
          // Simple linear growth: grows by 0.3 scale units per second
          // Starting from baseScale, growing to maxScale over time
          const maxScale = 25
          const growthPerSecond = 0.3 // Grows 0.3 scale units per second
          const totalGrowth = elapsedSeconds * growthPerSecond
          const currentScale = Math.min(baseScale + totalGrowth, maxScale)
          
          // Pulse animation scale (varies between 0.98 and 1.02 of current size when at max, more when growing)
          const pulsePhase = (elapsedSeconds % 1.5) / 1.5 // 1.5 second pulse cycle
          const isAtMax = currentScale >= maxScale
          const pulseRange = isAtMax ? 0.02 : 0.05 // Smaller pulse when at max size
          const pulseScale = 1 - pulseRange + (Math.sin(pulsePhase * Math.PI * 2) + 1) * pulseRange
          
          setYesButtonStyle({
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            transform: `translate(-50%, -50%) scale(${currentScale * pulseScale})`,
            zIndex: 1000,
            transition: 'none',
            pointerEvents: 'auto',
          })
        } else {
          setYesButtonStyle({})
          activeTimeRef.current = 0
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateButtonPosition(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        updateButtonPosition(touch.clientX, touch.clientY)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isActive])

  const handleYesClick = () => {
    setIsActive(false)
    router.push('/success')
  }

  const handleNoClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isActive) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24 relative overflow-hidden">
      {/* Image Area at Top */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="w-full max-w-2xl rounded-lg bg-pink-50 flex items-center justify-center overflow-hidden p-4">
          <img 
            src="/valentine-photo.jpg" 
            alt="Valentine's Day" 
            className="max-w-full max-h-[60vh] w-auto h-auto object-contain rounded-lg"
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = '<div class="text-center p-8 w-full"><p class="text-pink-400 text-lg">Please add your image as "valentine-photo.jpg" in the public folder</p></div>'
              }
            }}
          />
        </div>
      </div>

      {/* Question Text */}
      <div className="my-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-pink-600">
          Will You Be My Valentine?
        </h1>
      </div>

      {/* Button Area at Bottom */}
      <div className="flex gap-8 mb-8 md:mb-16 relative">
        <button
          ref={yesButtonRef}
          onClick={handleYesClick}
          className={`px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition-all duration-100 ${
            isActive ? '' : ''
          }`}
          style={isActive ? yesButtonStyle : {}}
        >
          Yes
        </button>
        <button
          ref={noButtonRef}
          onClick={handleNoClick}
          className="px-8 py-4 bg-red-500 text-white text-xl font-bold rounded-lg hover:bg-red-600 transition-colors relative z-10"
          style={{ pointerEvents: isActive ? 'none' : 'auto' }}
        >
          No
        </button>
      </div>
    </main>
  )
}

