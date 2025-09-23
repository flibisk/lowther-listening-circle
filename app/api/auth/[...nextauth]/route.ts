import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import bcrypt from "bcryptjs"

const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions = {
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
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          await resend.emails.send({
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
        } catch (error) {
          console.error("Failed to send email:", error)
          throw new Error("Failed to send email")
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Credentials received:', { email: credentials?.email, password: credentials?.password ? '***' : 'missing' })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // Check for admin credentials
        if (credentials.email === "peter@lowtherloudspeakers.com" && credentials.password === "warpwarp") {
          console.log('Admin credentials match, looking up user...')
          
          // Find or create admin user
          let user = await prisma.user.findUnique({
            where: { email: "admin@lowtherlisteningcircle.com" }
          })

          console.log('Found user:', user)

          if (!user) {
            console.log('Creating new admin user...')
            // Create admin user if doesn't exist
            user = await prisma.user.create({
              data: {
                email: "admin@lowtherlisteningcircle.com",
                name: "Peter",
                role: "ADMIN",
                tier: "AMBASSADOR",
                refCode: "LW-ADMIN"
              }
            })
          } else {
            // Update existing user to admin if needed
            if (user.role !== "ADMIN") {
              console.log('Updating user role to ADMIN...')
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN", tier: "AMBASSADOR" }
              })
            }
          }

          console.log('Returning user:', { id: user.id, email: user.email, role: user.role })

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tier: user.tier,
            refCode: user.refCode,
            discountCode: user.discountCode
          }
        }

        console.log('Credentials do not match admin credentials')
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.refCode = token.refCode as string
        session.user.discountCode = token.discountCode as string
        session.user.role = token.role as string
        session.user.tier = token.tier as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.refCode = user.refCode
        token.discountCode = user.discountCode
        token.role = user.role
        token.tier = user.tier
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

