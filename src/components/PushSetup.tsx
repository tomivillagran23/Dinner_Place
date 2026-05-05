'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

async function subscribeAndSave() {
  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    })
  }

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  })
}

export default function PushSetup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    console.log('[Push] serviceWorker:', 'serviceWorker' in navigator)
    console.log('[Push] PushManager:', 'PushManager' in window)
    console.log('[Push] Notification:', typeof Notification !== 'undefined' ? Notification.permission : 'unavailable')
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const permission = Notification.permission
    if (permission === 'granted') {
      subscribeAndSave().catch(console.error)
    } else if (permission === 'default') {
      const dismissed = localStorage.getItem('push_dismissed')
      if (!dismissed) setShow(true)
    }
  }, [])

  async function handleEnable() {
    const permission = await Notification.requestPermission()
    setShow(false)
    if (permission === 'granted') {
      subscribeAndSave().catch(console.error)
    } else {
      localStorage.setItem('push_dismissed', '1')
    }
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem('push_dismissed', '1')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 max-w-sm mx-auto">
      <div className="glass rounded-2xl p-4 border border-[rgba(255,255,255,0.1)] shadow-xl flex items-start gap-3 animate-slide-up">
        <div className="w-9 h-9 rounded-xl bg-[rgba(255,77,77,0.15)] flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-[#FF4D4D]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Activar notificaciones</p>
          <p className="text-xs text-[#737373] mt-0.5">Enterate cuando alguien agrega un restaurante nuevo</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              className="flex-1 py-1.5 rounded-lg bg-[#FF4D4D] hover:bg-[#FF3333] text-white text-xs font-semibold transition-all"
            >
              Activar
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-[#737373] hover:text-white transition-all"
            >
              Ahora no
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-[#4A4A4A] hover:text-white transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
