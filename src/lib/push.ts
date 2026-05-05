import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:villagrantomas124@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (err: unknown) {
    const code = (err as { statusCode?: number }).statusCode
    if (code === 410 || code === 404) {
      // Suscripción expirada — se puede limpiar de la DB si se quiere
      console.warn('Push subscription expired:', code)
    } else {
      console.error('Push error:', err)
    }
  }
}
