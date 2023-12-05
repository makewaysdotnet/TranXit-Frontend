import { AuthProvider } from '@/contexts/auth-context';
import { CookiesProvider } from 'next-client-cookies/server';

export function Provider({ children }: React.PropsWithChildren) {
  return (
    <CookiesProvider>
      <AuthProvider>{children}</AuthProvider>
    </CookiesProvider>
  );
}
