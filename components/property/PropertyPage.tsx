"use client";
import { bookProperty } from "@/app/actions/bookProperty";
import type { IProperty } from "@/app/models/Property";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  MapPin,
  Star,
  Home,
  Check,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Navbar from "../Navbar";
import { useAuthContext } from "@/app/components/AuthProvider";
import { Textarea } from "../ui/textarea";

const PropertyPageDetails = ({ property }: { property: IProperty }) => {
  const { user, signOut } = useAuthContext();
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, startTransition] = useTransition();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formError, setFormError] = useState("");
  const [adults, setAdults] = useState(1); // Default is 1 adult
  const [children, setChildren] = useState(0); // Default is 0 children
  const [rooms, setRooms] = useState(1); // Default is 1 room
  const [notes, setNotes] = useState(""); // Default is empty notes

  // Calculate total nights and price
  const totalNights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = totalNights * property.price;
  const discountedPrice = property.discount
    ? totalPrice - totalPrice * (property.discount / 100)
    : totalPrice;

  useEffect(() => {
    if (user) {
      setName(user.displayName ?? "");
      setEmail(user.email ?? "");
    }
    const loadRazorpayScript = () => {
      if (typeof window !== "undefined" && !window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);
      } else {
        setRazorpayLoaded(true);
      }
    };
    loadRazorpayScript();
  }, [user]);

  const validateForm = () => {
    if (!checkIn || !checkOut) {
      setFormError("Please select check-in and check-out dates");
      return false;
    }
    if (!name.trim()) {
      setFormError("Please enter your name");
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Please enter a valid email address");
      return false;
    }
    if (checkIn >= checkOut) {
      setFormError("Check-out date must be after check-in date");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;
    if (!user) {
      toast.info("Please Log in before Booking!");
      return;
    }
    startTransition(async () => {
      if (!property._id) return;

      try {
        const response = await bookProperty(
          property._id,
          checkIn ? format(checkIn, "yyyy-MM-dd") : "",
          checkOut ? format(checkOut, "yyyy-MM-dd") : "",
          email,
          name,
          discountedPrice
        );

        if (!response.success) {
          toast.error(response.message);
          return;
        }

        const options = {
          key: response.key,
          amount: discountedPrice * 100,
          currency: "INR",
          name: "Property Booking",
          description: `Booking for Rs.{property.name}`,
          order_id: response.orderId,
          handler: async (paymentResponse: any) => {
            toast.success("Payment Successful!");

            await fetch("/api/razorpay/webhook", {
              method: "POST",
              body: JSON.stringify({
                bookingId: response.bookingId,
                orderId: response.orderId,
                paymentId: paymentResponse.razorpay_payment_id,
              }),
              headers: { "Content-Type": "application/json" },
            });
          },
          prefill: { email, name },
          theme: { color: "#3399cc" },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Title and Rating */}
            <div>
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold">{property.name}</h1>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">
                    {property.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ({property.reviews} reviews)
                  </span>
                </div>
              </div>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="relative rounded-xl overflow-hidden h-[400px] group">
              {property.images && property.images.length > 0 ? (
                <>
                  <Image
                    src={
                      property.images[currentImageIndex] || "/placeholder.svg"
                    }
                    alt={`${property.name} - image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 w-2 rounded-full ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Home className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {property.discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                  {property.discount}% OFF
                </Badge>
              )}
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {property.type}
                </Badge>
                {property.available ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Available
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Not Available
                  </Badge>
                )}
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-2">About this place</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Property highlights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Prime location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Free cancellation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Top rated property</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book this property</CardTitle>
                <CardDescription>
                  Fill in the details to reserve your stay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">Check-in</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check-out">Check-out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            initialFocus
                            disabled={(date) =>
                              date < new Date() ||
                              (checkIn ? date <= checkIn : false)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adults">Number of Adults</Label>
                  <Input
                    id="adults"
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    placeholder="Enter number of adults"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children">Number of Children</Label>
                  <Input
                    id="children"
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    placeholder="Enter number of children"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min={1}
                    value={rooms}
                    onChange={(e) => setRooms(Number(e.target.value))}
                    placeholder="Enter number of rooms"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special requests or notes"
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {formError}
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Price per night</span>
                    <span>Rs.{property.price.toFixed(2)}</span>
                  </div>
                  {totalNights > 0 && (
                    <div className="flex justify-between">
                      <span>× {totalNights} nights</span>
                      <span>Rs.{totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {property.discount > 0 && totalNights > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({property.discount}%)</span>
                      <span>-${(totalPrice - discountedPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      Rs.{totalNights > 0 ? discountedPrice.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={loading || !razorpayLoaded || !property.available}
                >
                  {loading ? "Processing..." : "Book Now"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyPageDetails;
