'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [yesButtonStyle, setYesButtonStyle] = useState<React.CSSProperties>({})
  const [isActive, setIsActive] = useState(false)
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

        // Trigger zone: within 150px of the No button
        if (distance < 150) {
          setIsActive(true)
          
          // Calculate position to place Yes button (between touch/mouse and No button)
          const angle = Math.atan2(
            y - noButtonCenter.y,
            x - noButtonCenter.x
          )
          
          // Position Yes button to block access to No button
          const offsetX = Math.cos(angle) * 80
          const offsetY = Math.sin(angle) * 80
          
          const scale = Math.max(1.6, 2.2 - distance / 100)
          
          setYesButtonStyle({
            position: 'fixed',
            left: `${x + offsetX}px`,
            top: `${y + offsetY}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            zIndex: 1000,
            animation: 'quiver 0.25s ease-in-out infinite',
            transition: 'left 0.08s ease-out, top 0.08s ease-out, transform 0.1s ease-out',
          })
        } else {
          setIsActive(false)
          setYesButtonStyle({})
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
  }, [])

  const handleYesClick = () => {
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
        <div className="w-full aspect-square max-w-md border-4 border-pink-300 border-dashed rounded-lg bg-pink-50 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Valentine's Day" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-pink-400 text-lg mb-4">Add your picture here</p>
              <input
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
          )}
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

