'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function isProtectedTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.closest('[data-protect-content="true"]')
}

export default function ContentProtection() {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.remove('content-protected')
      return
    }

    document.body.classList.add('content-protected')

    function handleCopy(event: ClipboardEvent) {
      if (!isProtectedTarget(event.target)) return
      event.preventDefault()
    }

    function handleCut(event: ClipboardEvent) {
      if (!isProtectedTarget(event.target)) return
      event.preventDefault()
    }

    function handleContextMenu(event: MouseEvent) {
      if (!isProtectedTarget(event.target)) return
      event.preventDefault()
    }

    function handleDragStart(event: DragEvent) {
      if (!isProtectedTarget(event.target)) return
      event.preventDefault()
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('dragstart', handleDragStart)

    return () => {
      document.body.classList.remove('content-protected')
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [isAdminRoute])

  return null
}
