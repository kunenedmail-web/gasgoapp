
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getAllOrders, Order, acceptOrder } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { AuthButtons } from '@/components/auth-buttons';

export default function DriversPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      if (err.code === 'failed-precondition') {
        setError('This query requires a special index. Please check the developer console (F12) for a link to create it in Firebase.');
      } else if (err.code === 'permission-denied') {
        setError('You do not have permission to view these orders. Please contact an administrator.');
      }
      else {
        setError(err.message || "An unknown error occurred while fetching orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return; // Wait until auth state is determined
    }
    if (!user) {
      router.push('/drivers/login'); // Redirect to driver login if not authenticated
      return;
    }

    fetchOrders();
  }, [user, authLoading, router]);

  const handleAcceptOrder = async (orderId?: string) => {
    if (!orderId || !user) return;

    try {
      await acceptOrder(orderId, user.uid);
      toast({
        title: 'Order Accepted',
        description: `You have accepted order #${orderId?.substring(0, 8)}.`,
      });
      // Refresh the list of orders to remove the accepted one
      fetchOrders();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Accept',
        description: error.message || 'There was an issue accepting the order.',
      });
    }
  };

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

  if (authLoading || (!user && !error)) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 sm:p-6 md:p-8 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold text-primary">Driver Dashboard</h1>
        <AuthButtons />
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
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
              <CardTitle>No Active Orders</CardTitle>
              <CardDescription className="mt-2 mb-4">There are currently no new delivery requests.</CardDescription>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden shadow-lg flex flex-col">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Order #{order.id?.substring(0, 8)}</CardTitle>
                    <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 flex-grow">
                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Delivery Location</h4>
                      <p className="text-xs text-muted-foreground">{order.address}</p>
                      {order.entityType === 'Business' && order.companyName && (
                          <p className="text-xs text-muted-foreground">Company: {order.companyName}</p>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Items</h4>
                      <ul className="space-y-1 text-xs">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between">
                            <span>{item.quantity} x {item.label}</span>
                            <span>R{(item.quantity * item.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                      <h4 className="font-semibold">Payment</h4>
                      <span className="text-muted-foreground">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <h4 className="font-semibold">Total</h4>
                      <span className="text-primary">R{order.totalCost.toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 p-2">
                      <Button className="w-full" onClick={() => handleAcceptOrder(order.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept Order
                      </Button>
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
