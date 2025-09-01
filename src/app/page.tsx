
import { GasOrderForm } from '@/components/gas-order-form';
import { AuthButtons } from '@/components/auth-buttons';

export default function Home() {
  return (
    <>
      <header className="absolute top-0 right-0 p-4 sm:p-6 md:p-8 z-10">
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

