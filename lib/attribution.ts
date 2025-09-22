import crypto from 'node:crypto'
export function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}
export function getClientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for') || ''
  return fwd.split(',')[0]?.trim() || ''
}
export function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
