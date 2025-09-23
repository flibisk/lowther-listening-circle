import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import bcrypt from "bcryptjs"

const resend = new Resend(process.env.RESEND_API_KEY)

const handler = NextAuth({
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check for admin credentials
        if (credentials.email === "peter@lowtherloudspeakers.com" && credentials.password === "warpwarp") {
          // Find or create admin user
          let user = await prisma.user.findUnique({
            where: { email: "admin@lowtherlisteningcircle.com" }
          })

          if (!user) {
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
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: "ADMIN", tier: "AMBASSADOR" }
              })
            }
          }

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

        return null
      }
    })
  ],
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
        session.user.refCode = user.refCode
        session.user.discountCode = user.discountCode
        session.user.role = user.role
        session.user.tier = user.tier
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
})
export { handler as GET, handler as POST }

