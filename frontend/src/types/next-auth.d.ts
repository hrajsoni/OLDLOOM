import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: import('./index').UserRole;
    };
    accessToken?: string;
  }

  interface User {
    role?: import('./index').UserRole;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: import('./index').UserRole;
    accessToken?: string;
  }
}
