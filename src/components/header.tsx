
"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HardHat } from 'lucide-react';
import { AuthButtons } from './auth-buttons';

export function Header() {
    const { user } = useAuth();

    return (
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-10 flex justify-between items-center">
            <div>
                {!user && (
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/drivers/login">
                                <HardHat className="mr-2 h-4 w-4" />
                                Driver Login
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
            <AuthButtons />
      </header>
    )
}
