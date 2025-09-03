
import { AuthProvider } from '@/context/auth-context';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
