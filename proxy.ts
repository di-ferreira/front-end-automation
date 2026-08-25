import NextAuth from "next-auth";

import { authConfig } from "./auth.config";

/**
 * Proxy do Next 16 (antigo middleware): roda antes de todas as rotas
 * e redireciona usuários não autenticados para /login.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
