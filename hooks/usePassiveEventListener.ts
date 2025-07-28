import { useEffect, useRef } from 'react'

interface UsePassiveEventListenerOptions {
  passive?: boolean
  capture?: boolean
}

// Type pour les options d'événement avec support de passive
type EventListenerOptionsWithPassive = {
  passive?: boolean
  capture?: boolean
}

export function usePassiveEventListener<T extends EventTarget>(
  target: T | null,
  eventType: string,
  listener: (event: Event) => void,
  options: UsePassiveEventListenerOptions = {}
) {
  const { passive = true, capture = false } = options
  const listenerRef = useRef(listener)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    if (!target) return

    const eventListener = (event: Event) => {
      listenerRef.current(event)
    }

    target.addEventListener(eventType, eventListener, { passive, capture } as EventListenerOptionsWithPassive)

    return () => {
      target.removeEventListener(eventType, eventListener, { passive, capture } as EventListenerOptionsWithPassive)
    }
  }, [target, eventType, passive, capture])
}

// Hook spécialisé pour les clics en dehors d'un élément
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener, { passive: true })
    document.addEventListener('touchstart', listener, { passive: true })

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// Hook spécialisé pour les touches clavier
export function useKeyDown(
  key: string,
  handler: (event: KeyboardEvent) => void,
  target: EventTarget = document
) {
  useEffect(() => {
    const listener = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent
      if (keyboardEvent.key === key) {
        handler(keyboardEvent)
      }
    }

    target.addEventListener('keydown', listener, { passive: true } as EventListenerOptionsWithPassive)

    return () => {
      target.removeEventListener('keydown', listener)
    }
  }, [key, handler, target])
} 