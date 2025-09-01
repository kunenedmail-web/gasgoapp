
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getUserOrders, Order } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { AuthButtons } from '@/components/auth-buttons';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const userOrders = await getUserOrders(user.uid);
        setOrders(userOrders);
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        if (err.code === 'failed-precondition') {
          setError('This query requires a special index. Please check the developer console (F12) for a link to create it in Firebase.');
        } else {
          setError(err.message || "An unknown error occurred while fetching orders.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Date not available';
    return timestamp.toDate().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="p-4 sm:p-6 md:p-8 flex justify-between items-center border-b">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-primary">My Orders</h1>
        <AuthButtons />
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {loading || authLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
          ) : !user ? (
            <Card className="text-center p-8">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription className="mt-2 mb-4">You must be logged in to view your orders.</CardDescription>
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </Card>
          ) : error ? (
            <Card className="text-center p-8 bg-destructive/10">
              <CardTitle className="text-destructive">Failed to Load Orders</CardTitle>
              <CardDescription className="mt-2 mb-4 text-destructive">
                {error}
              </CardDescription>
              <CardContent>
                <p className="text-sm text-muted-foreground">If the error mentions an index, please open the developer console (F12) to find a link to create it.</p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="text-center p-8">
              <CardTitle>No Orders Found</CardTitle>
              <CardDescription className="mt-2 mb-4">You haven&apos;t placed any orders yet.</CardDescription>
              <Button asChild>
                <Link href="/">Place Your First Order</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden shadow-lg">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl">Order #{order.id?.substring(0, 8)}</CardTitle>
                    <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Delivery Location</h4>
                      <p className="text-muted-foreground">{order.address}</p>
                      {order.entityType === 'Business' && order.companyName && (
                          <p className="text-sm text-muted-foreground">Company: {order.companyName}</p>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between">
                            <span>{item.quantity} x {item.label}</span>
                            <span>R{(item.quantity * item.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Payment Method</h4>
                      <span className="text-muted-foreground">{order.paymentMethod}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 p-6 flex justify-end">
                      <div className="text-2xl font-bold text-primary">
                          Total: R{order.totalCost.toFixed(2)}
                      </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
