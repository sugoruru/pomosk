import NextAuth from 'next-auth';
import AuthOPTIONS from './options';

const handler = NextAuth(AuthOPTIONS);
export { handler as GET, handler as POST };
