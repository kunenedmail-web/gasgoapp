import { GasOrderForm } from '@/components/gas-order-form';
import { Header } from '@/components/header';

export default function Home() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <GasOrderForm apiKey={googleMapsApiKey} />
        </div>
      </main>
    </>
  );
}
