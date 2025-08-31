
import { GasOrderForm } from '@/components/gas-order-form';
import { AuthButtons } from '@/components/auth-buttons';
import { ImageCarousel } from '@/components/image-carousel';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-end items-center py-4">
            <div className="flex-shrink-0 mt-4 sm:mt-0">
              <AuthButtons />
            </div>
        </header>
        <div className="-mt-10 mb-10">
            <ImageCarousel />
        </div>
        <GasOrderForm />
      </div>
    </main>
  );
}
