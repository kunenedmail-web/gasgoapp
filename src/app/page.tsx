
import { GasOrderForm } from '@/components/gas-order-form';
import { AuthButtons } from '@/components/auth-buttons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HardHat } from 'lucide-react';

export default function Home() {
  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/drivers">
            <HardHat className="mr-2 h-4 w-4" />
            Driver Login
          </Link>
        </Button>
        <AuthButtons />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <GasOrderForm />
        </div>
      </main>
    </>
  );
}

