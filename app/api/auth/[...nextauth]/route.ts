import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: { host: process.env.EMAIL_SERVER_HOST, port: Number(process.env.EMAIL_SERVER_PORT), auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASS } },
      from: process.env.EMAIL_FROM
    })
  ],
  session: { strategy: 'jwt' },
  pages: {},
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    }
  }
})
export { handler as GET, handler as POST }
