import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { webflowLeadSchema } from "@/lib/schemas"
import { daysAgo, getClientIp, sha256 } from "@/lib/attribution"
import { Prisma } from "@prisma/client"

function authorised(req: Request) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""
  return !!process.env.WEBFLOW_FORM_SECRET && token === process.env.WEBFLOW_FORM_SECRET
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  const json = await req.json().catch(()=>null)
  const parsed = webflowLeadSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 })
  const input = parsed.data

  const ip = getClientIp(req)
  const ipHash = ip ? sha256(ip) : undefined
  const userAgent = req.headers.get("user-agent") || undefined

  let refUser: { id: string } | null = null
  if (input.ref) {
    refUser = await prisma.user.findUnique({ where: { refCode: input.ref }, select: { id: true } })
  }
  if (!refUser && ipHash) {
    const recentClick = await prisma.click.findFirst({
      where: { ipHash, createdAt: { gte: daysAgo(30) } },
      orderBy: { createdAt: "desc" },
      select: { userId: true }
    })
    if (recentClick?.userId) refUser = { id: recentClick.userId }
  }

  let affSource: Prisma.LeadAffSource = "NONE"
  if (input.ref && refUser) affSource = "FORM"
  else if (!input.ref && refUser) affSource = "LINK"

  const lead = await prisma.lead.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      name: input.name,
      source: "webflow",
      referrerUserId: refUser?.id,
      refCode: input.ref,
      affSource,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_term: input.utm_term,
      utm_content: input.utm_content,
      ipHash,
      userAgent,
      lastTouchAt: new Date()
    },
    create: {
      email: input.email.toLowerCase(),
      name: input.name,
      source: "webflow",
      referrerUserId: refUser?.id,
      refCode: input.ref,
      affSource,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_term: input.utm_term,
      utm_content: input.utm_content,
      ipHash,
      userAgent,
      firstTouchAt: new Date(),
      lastTouchAt: new Date()
    }
  })

  if (process.env.AUTO_PROVISION_FROM_WEBFLOW === "true") {
    const existing = await prisma.user.findUnique({ where: { email: lead.email } })
    if (!existing) {
      const code = "LW-" + Math.random().toString(36).slice(2, 8).toUpperCase()
      await prisma.user.create({ data: { email: lead.email, name: lead.name ?? undefined, tier: "ADVOCATE", refCode: code } })
    }
  }

  return NextResponse.json({ status: "ok", leadId: lead.id, referrer: lead.refCode ?? null, affSource: lead.affSource })
}
