import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Kakao from 'next-auth/providers/kakao';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      nickname: string;
      email: string;
      isNewUser: boolean;
      hasCompletedOnboarding: boolean;
    };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moneyrun-backend.onrender.com';

export const authConfig: NextAuthConfig = {
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || 'no-secret',
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 로그인/로그아웃 후 리다이렉트
      // / 또는 루트면 /home으로 강제
      if (url === baseUrl || url === `${baseUrl}/` || url === '/') {
        return `${baseUrl}/home`;
      }
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/home`;
    },
    async jwt({ token, account }) {
      // 카카오 토큰만 저장 — 백엔드 JWT 교환은 클라이언트에서 처리
      if (account?.access_token) {
        token.kakaoAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as Record<string, unknown>;
      session.accessToken = (t.kakaoAccessToken as string) ?? undefined;
      Object.assign(session.user, {
        id: (t.sub as string) ?? '',
        nickname: (t.name as string) ?? '',
        email: (t.email as string) ?? '',
        isNewUser: true,
        hasCompletedOnboarding: false,
      });
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
