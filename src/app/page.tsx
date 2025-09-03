
import { GasOrderForm } from '@/components/gas-order-form';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <Header />
      <div className="w-full max-w-5xl mx-auto">
        <div className="mt-8">
            <GasOrderForm />
        </div>
      </div>
    </main>
  );
}

