import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/login`,
            {
              method: 'POST',
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              headers: { 'Content-Type': 'application/json' },
            }
          );

          const data = await res.json();
          if (res.ok && data.user && data.accessToken) {
            return {
              id: data.user._id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              accessToken: data.accessToken,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as any).role ?? 'customer';
        token.accessToken = (user as any).accessToken;
      }
      // Google OAuth — fetch role from backend
      if (account?.provider === 'google' && token.email) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google-role?email=${token.email}`
          );
          const data = await res.json();
          token.role = data.role ?? 'customer';
        } catch {
          token.role = 'customer';
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
});
