import type { Role } from "./index"

declare module "next-auth" {
  interface User {
    role: string
    token: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
    }
    token: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    token: string
  }
}
