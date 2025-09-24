import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import bcrypt from "bcryptjs"
import { checkRateLimit } from "@/lib/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY)
const isProd = process.env.NODE_ENV === 'production'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 587,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev', // Fallback sender
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          if (!isProd) console.log(`🔗 MAGIC LINK for ${email}: ${url}`)
          
          if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key-here') {
            const sendRes = await resend.emails.send({
              from: provider.from as string,
              to: email,
              subject: "Sign in to Lowther Listening Circle",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #333;">Sign in to Lowther Listening Circle</h1>
                  <p>Click the link below to sign in to your account:</p>
                  <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Sign in</a>
                  <p>If you didn't request this email, you can safely ignore it.</p>
                  <p>This link will expire in 24 hours.</p>
                </div>
              `,
            })
            if ((sendRes as any)?.error) {
              console.error('Resend send error:', (sendRes as any).error)
            } else {
              if (!isProd) console.log(`✅ Email sent to ${email}`)
            }
          } else {
            if (!isProd) console.log(`⚠️  Email not sent - Resend API key not configured. Check console for magic link.`)
          }
        } catch (error) {
          console.error("Failed to send magic link email:", error)
          if (!isProd) console.log(`🔗 MAGIC LINK for ${email}: ${url}`)
          // Don't throw error in development - just log the link
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!isProd) console.log('Credentials received:', { email: credentials?.email, password: credentials?.password ? '***' : 'missing' })
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Get client IP for rate limiting
        const clientIp = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
        const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp

        // Check rate limit (5 attempts per 15 minutes)
        if (!checkRateLimit(ip, 5, 15 * 60 * 1000)) {
          console.warn(`Rate limit exceeded for IP: ${ip}`)
          return null
        }

        // Check if this is admin login
        const adminEmail = process.env.ADMIN_EMAIL || 'peter@lowtherloudspeakers.com'
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
        
        if (!adminPasswordHash) {
          console.error('ADMIN_PASSWORD_HASH environment variable not set')
          return null
        }
        
        if (credentials.email === adminEmail) {
          // Verify password using bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, adminPasswordHash)
          
          if (isValidPassword) {
            if (!isProd) console.log('Admin credentials match, looking up user...')
            
            // Find or create admin user
            let user = await prisma.user.findUnique({
              where: { email: adminEmail }
            })

            if (!user) {
              if (!isProd) console.log('Creating new admin user...')
              user = await prisma.user.create({
                data: {
                  email: adminEmail,
                  name: 'Admin',
                  role: 'ADMIN',
                  tier: 'AMBASSADOR',
                  isApproved: true,
                  approvedAt: new Date(),
                  refCode: 'LW-PETER',
                }
              })
            } else if (user.role !== 'ADMIN') {
              if (!isProd) console.log('Updating user role to ADMIN and approving...')
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  role: 'ADMIN',
                  tier: 'AMBASSADOR',
                  isApproved: true,
                  approvedAt: new Date(),
                }
              })
            }

            if (!isProd) console.log('Returning user:', { id: user.id, email: user.email, role: user.role })
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              refCode: user.refCode,
              discountCode: user.discountCode,
              role: user.role,
              tier: user.tier,
            }
          }
        }

        if (!isProd) console.log('Credentials do not match admin credentials')
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (!isProd) {
        console.log('Session callback - token:', token)
        console.log('Session callback - session:', session)
      }
      if (token) {
        session.user.id = token.id as string
        session.user.refCode = token.refCode as string
        session.user.discountCode = token.discountCode as string
        session.user.role = token.role as string
        session.user.tier = token.tier as string
      }
      if (!isProd) console.log('Session callback - final session:', session)
      return session
    },
    async jwt({ token, user }) {
      if (!isProd) {
        console.log('JWT callback - user:', user)
        console.log('JWT callback - token:', token)
      }
      if (user) {
        const u: any = user
        token.id = u.id ?? token.id
        token.refCode = u.refCode ?? token.refCode
        token.discountCode = u.discountCode ?? token.discountCode
        token.role = u.role ?? token.role
        token.tier = u.tier ?? token.tier
      }
      if (!isProd) console.log('JWT callback - final token:', token)
      return token
    },
    async redirect({ url, baseUrl }) {
      if (!isProd) console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl)
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}
