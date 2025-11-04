import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    isNewUser?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isNewUser?: boolean
  }
} 