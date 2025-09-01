
import { GasOrderForm } from '@/components/gas-order-form';
import { AuthButtons } from '@/components/auth-buttons';
import { ImageCarousel } from '@/components/image-carousel';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="relative z-10 flex justify-end items-center py-4">
            <div className="flex-shrink-0">
              <AuthButtons />
            </div>
        </header>
        <div className="mb-10 -mt-16">
            <ImageCarousel />
        </div>
        <GasOrderForm />
      </div>
    </main>
  );
}

