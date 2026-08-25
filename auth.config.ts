import type { NextAuthConfig } from "next-auth";

/**
 * Configuração "edge-safe": sem acesso ao banco/drivers.
 * Usada pelo proxy.ts (que roda antes das rotas) para checar a sessão.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // preenchidos em auth.ts (Node runtime)
  callbacks: {
    authorized({ request, auth }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;

      const isLoginPage = pathname.startsWith("/login");
      const isAuthApi = pathname.startsWith("/api/auth");
      // Callback do N8N autentica por segredo próprio na rota
      const isN8nCallback =
        /^\/api\/executions\/[^/]+\/callback$/.test(pathname);

      if (isAuthApi || isN8nCallback) return true;

      // APIs protegidas respondem 401 JSON em vez de redirecionar
      if (pathname.startsWith("/api")) {
        if (!isLoggedIn) {
          return Response.json({ error: "Não autenticado" }, { status: 401 });
        }
        return true;
      }

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      return isLoggedIn; // qualquer outra rota exige sessão
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string | number }).id;
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const typedUser = session.user as { id?: string; role?: string };
        typedUser.id = token.id != null ? String(token.id) : undefined;
        typedUser.role =
          typeof token.role === "string" ? token.role : undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
