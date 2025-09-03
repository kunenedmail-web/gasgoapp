
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, MapPin, Flame, CreditCard, FileText, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { addOrder, OrderItem } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const gasOptions = [
  { id: 'gas9', label: '9kg', price: 320 },
  { id: 'gas12', label: '12kg', price: 430 },
  { id: 'gas14', label: '14kg', price: 490 },
  { id: 'gas19', label: '19kg', price: 665 },
  { id: 'gas48', label: '48kg', price: 1680 },
];

type GasQuantities = {
  [key: string]: number;
};

const GOOGLE_MAPS_API_KEY = "AIzaSyAJPu4f5oOsfxbxk0NaYAKhcgZrq58kGys";

export function GasOrderForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState<string>('Waiting for location...');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isAddressReadOnly, setIsAddressReadOnly] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAuthWall, setShowAuthWall] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  const getMapSrc = () => {
    const apiKey = GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Maps API key is missing.");
        return `https://www.google.com/maps/embed/v1/view?center=0,0&zoom=2`;
    }
    if (latitude && longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=15`;
    }
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=0,0&zoom=2`;
  }
  
  const [entityType, setEntityType] = useState<string>('Household');
  const [companyName, setCompanyName] = useState<string>('');

  const [gasSelection, setGasSelection] = useState<string[]>([]);
  const [gasQuantities, setGasQuantities] = useState<GasQuantities>(
    gasOptions.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {})
  );
  const [totalCost, setTotalCost] = useState<number>(0);

  const [paymentType, setPaymentType] = useState<string>('');

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
      });
      setAddress('Geolocation not supported.');
      return;
    }

    setIsLocating(true);
    setAddress('Locating...');
    setIsAddressReadOnly(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Unable to retrieve your location. Please allow location access in your browser settings.",
        });
        setAddress('Could not retrieve location.');
        setIsLocating(false);
      }
    );
  };
  
  useEffect(() => {
    if (latitude && longitude) {
      const fetchAddress = async () => {
        const apiKey = GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setAddress('API key missing');
          setIsLocating(false);
          return;
        }

        try {
          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
          const data = await response.json();
          if (data.status === 'OK' && data.results[0]) {
            setAddress(data.results[0].formatted_address);
          } else {
            setAddress('Could not find address for your location.');
            toast({
              variant: "destructive",
              title: "Geocoding Error",
              description: data.error_message || 'An error occurred while fetching the address.',
            });
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setAddress('Error fetching address.');
        } finally {
          setIsLocating(false);
          setIsAddressReadOnly(false);
        }
      };
      
      fetchAddress();
    }
  }, [latitude, longitude, toast]);

  useEffect(() => {
    let total = 0;
    gasSelection.forEach(id => {
      const option = gasOptions.find(o => o.id === id);
      const quantity = gasQuantities[id];
      if (option && quantity > 0) {
        total += option.price * quantity;
      }
    });
    setTotalCost(total);
  }, [gasSelection, gasQuantities]);


  const handleGasSelectionChange = (id: string, checked: boolean) => {
    setGasSelection(prev => 
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
    if (!checked) {
        handleQuantityChange(id, '0');
    }
  };

  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    setGasQuantities(prev => ({ ...prev, [id]: quantity }));
    if(quantity > 0 && !gasSelection.includes(id)) {
        setGasSelection(prev => [...prev, id]);
    }
  };

  const handlePaymentAction = async () => {
    if (!user) {
      setShowAuthWall(true);
      return;
    }

    setIsSubmitting(true);

    const items: OrderItem[] = gasSelection.map(id => {
        const option = gasOptions.find(o => o.id === id)!;
        return {
            id: option.id,
            label: option.label,
            quantity: gasQuantities[id],
            price: option.price
        }
    }).filter(item => item.quantity > 0);

    if (items.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Empty Order',
            description: 'Please select at least one gas cylinder.',
        });
        setIsSubmitting(false);
        return;
    }

    try {
      await addOrder({
        userId: user.uid,
        address,
        entityType,
        companyName: entityType === 'Business' ? companyName : '',
        items,
        totalCost,
        paymentMethod: paymentType,
      });

      toast({
        title: 'Order Submitted',
        description: 'Your order has been submitted successfully!',
      });
      
      // Reset form
      setGasSelection([]);
      setGasQuantities(gasOptions.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {}));
      setPaymentType('');
      setEntityType('Household');
      setCompanyName('');
      
      router.push('/orders');

    } catch (error: any) {
      console.error("Order submission error:", error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.message || 'There was a problem submitting your order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setShowAuthWall(false);
    }
  }, [user]);

  const isSubmitDisabled = isSubmitting || totalCost === 0 || !paymentType || (!user && showAuthWall);

  return (
    <Card className="w-full shadow-2xl overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border-primary/10 mt-20">
      <div className="md:grid md:grid-cols-2">
        <div className="relative h-64 md:h-full min-h-[300px]">
           <iframe
            title="Location Map"
            id="mapFrame"
            className="absolute top-0 left-0 w-full h-full border-0"
            src={getMapSrc()}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className="p-6 sm:p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-bold text-primary">Place Your Order</CardTitle>
            <CardDescription>Select your gas, set your location, and choose a payment method.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="space-y-2">
              <Button onClick={handleGetUserLocation} disabled={isLocating} className="w-full">
                {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                Use My Current Location
              </Button>
              <Label htmlFor="current" className="text-xs text-muted-foreground">Current Location (can be edited)</Label>
              <Input 
                id="current" 
                value={address}
                onChange={(e) => setAddress(e.target.value)} 
                readOnly={isAddressReadOnly}
                className="text-sm bg-muted/50" 
              />
            </div>

            <RadioGroup value={entityType} onValueChange={setEntityType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Household" id="household" />
                <Label htmlFor="household">Household</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Business" id="business" />
                <Label htmlFor="business">Business</Label>
              </div>
            </RadioGroup>

            {entityType === 'Business' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Enter your company name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="font-semibold text-lg">Select Gas Cylinders</Label>
              </div>
              {gasOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={option.id} 
                      onCheckedChange={(checked) => handleGasSelectionChange(option.id, checked as boolean)}
                      checked={gasSelection.includes(option.id)}
                    />
                    <Label htmlFor={option.id} className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                      <Flame className="h-5 w-5 text-primary/70"/>
                      {option.label} - R{option.price.toFixed(2)}
                    </Label>
                  </div>
                  <Select
                    value={gasQuantities[option.id].toString()}
                    onValueChange={(value) => handleQuantityChange(option.id, value)}
                  >
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue placeholder="Qty" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10).keys()].map(i => (
                        <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="text-right text-2xl font-bold text-primary">
              Total: R{totalCost.toFixed(2)}
            </div>

            <Separator />
            
            <div>
              <Label className="font-semibold">Payment Method</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Card" id="card" />
                  <Label htmlFor="card">Card</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-6">
            <div className="w-full">
               <div className="w-full">
                {showAuthWall ? (
                    <div className="text-center w-full space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Lock className="h-4 w-4" />
                            <span>Please sign in or create an account to continue.</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {paymentType === 'Card' && (
                            <Button onClick={handlePaymentAction} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 animate-in fade-in duration-300" disabled={isSubmitDisabled}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />} Pay Now
                            </Button>
                        )}
                        {paymentType === 'Cash' && (
                            <Button onClick={handlePaymentAction} className="w-full animate-in fade-in duration-300" disabled={isSubmitDisabled}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} Submit Order
                            </Button>
                        )}
                    </>
                )}
            </div>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
