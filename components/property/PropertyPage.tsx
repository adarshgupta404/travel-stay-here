"use client"

import { bookProperty } from "@/app/actions/bookProperty"
import type { IProperty } from "@/app/models/Property"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { CalendarIcon, MapPin, Star, Home, Check, AlertCircle, Minus, Plus, UserRound, BedDouble, Baby, Wifi, PocketIcon as Pool, Wind, Car, Clock, Phone, User, MapIcon, CalendarIcon as CalendarIconFull } from 'lucide-react'
import Image from "next/image"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Navbar from "../Navbar"
import { useAuthContext } from "@/app/components/AuthProvider"
import { Textarea } from "../ui/textarea"
import { checkAvailability } from "@/app/actions/availability"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "../date-range-picker"

const PropertyPageDetails = ({ property }: { property: IProperty }) => {
  const { user, signOut } = useAuthContext()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, startTransition] = useTransition()
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [formError, setFormError] = useState("")
  const [adults, setAdults] = useState(1) // Default is 1 adult
  const [children, setChildren] = useState(0) // Default is 0 children
  const [phone, setPhone] = useState("") // Default is empty phone
  const [rooms, setRooms] = useState(1) // Default is 1 room
  const [notes, setNotes] = useState("") // Default is empty notes
  const [available, setAvailable] = useState<any>(null) // Availability status

  // Calculate total guests
  const totalGuests = adults + children

  // Get amenity icons
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wi-fi":
        return <Wifi className="h-5 w-5" />
      case "swimming pool":
        return <Pool className="h-5 w-5" />
      case "air conditioning":
        return <Wind className="h-5 w-5" />
      case "parking":
        return <Car className="h-5 w-5" />
      default:
        return <Check className="h-5 w-5" />
    }
  }

  useEffect(() => {
    const checkPropertyAvailability = async () => {
      if (dateRange?.from && dateRange?.to) {
        const result = await checkAvailability(
          property._id,
          dateRange.from.toLocaleDateString(),
          dateRange.to.toLocaleDateString(),
        )
        setAvailable(result)

        // If available rooms is less than current selection, adjust rooms
        if (result.success && result.availableRooms && result.availableRooms < rooms) {
          setRooms(result.availableRooms > 0 ? result.availableRooms : 1)
          if (result.availableRooms === 0) {
            toast.error("No rooms available for selected dates")
          } else {
            toast.info(`Only ${result.availableRooms} rooms available for selected dates`)
          }
        }
      }
    }
    if (dateRange?.from && dateRange?.to) {
      checkPropertyAvailability()
    }
  }, [dateRange, property._id])

  // Calculate total nights and price
  const totalNights =
    dateRange?.from && dateRange?.to
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 0

  const totalPrice = totalNights * property.price * rooms
  const discountedPrice = property.discount ? totalPrice - totalPrice * (property.discount / 100) : totalPrice

  useEffect(() => {
    if (user) {
      setName(user.displayName ?? "")
      setEmail(user.email ?? "")
    }
    const loadRazorpayScript = () => {
      if (typeof window !== "undefined" && !window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => setRazorpayLoaded(true)
        document.body.appendChild(script)
      } else {
        setRazorpayLoaded(true)
      }
    }
    loadRazorpayScript()
  }, [user])

  const validateForm = () => {
    if (!dateRange?.from || !dateRange?.to) {
      setFormError("Please select check-in and check-out dates")
      return false
    }
    if (!name.trim()) {
      setFormError("Please enter your name")
      return false
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Please enter a valid email address")
      return false
    }
    if (!phone.trim() || !/^[0-9+\-\s]{10,15}$/.test(phone)) {
      setFormError("Please enter a valid phone number")
      return false
    }
    if (dateRange.from >= dateRange.to) {
      setFormError("Check-out date must be after check-in date")
      return false
    }
    if (totalGuests > property.maxGuests) {
      setFormError(`Maximum ${property.maxGuests} guests allowed`)
      return false
    }
    if (available && !available.success) {
      setFormError("No rooms available for selected dates")
      return false
    }
    if (available && available.availableRooms < rooms) {
      setFormError(`Only ${available.availableRooms} rooms available`)
      return false
    }
    setFormError("")
    return true
  }

  const handleBooking = async () => {
    if (!validateForm()) return
    if (!user) {
      toast.info("Please Log in before Booking!")
      return
    }
    startTransition(async () => {
      if (!property._id || !dateRange?.from || !dateRange?.to) return

      try {
        const capacity = {
          adults: adults,
          children: children,
          rooms: rooms,
        }
        const response = await bookProperty(
          property._id,
          format(dateRange.from, "yyyy-MM-dd"),
          format(dateRange.to, "yyyy-MM-dd"),
          email,
          name,
          phone,
          discountedPrice,
          capacity,
          notes,
        )

        if (!response.success) {
          toast.error(response.message)
          return
        }

        const options = {
          key: response.key,
          amount: discountedPrice * 100,
          currency: "INR",
          name: "Property Booking",
          description: `Booking for ${property.name}`,
          order_id: response.orderId,
          handler: async (paymentResponse: any) => {
            toast.success("Payment Successful!")

            await fetch("/api/razorpay/webhook", {
              method: "POST",
              body: JSON.stringify({
                bookingId: response.bookingId,
                orderId: response.orderId,
                paymentId: paymentResponse.razorpay_payment_id,
              }),
              headers: { "Content-Type": "application/json" },
            })
          },
          prefill: { email, name, contact: phone },
          theme: { color: "#3399cc" },
        }

        const razorpayInstance = new (window as any).Razorpay(options)
        razorpayInstance.open()
      } catch (error) {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))
  }

  // Helper functions for incrementing/decrementing values
  const incrementRooms = () => {
    if (available && available.success && rooms < available.availableRooms) {
      setRooms((prev) => Math.min(prev + 1, property.maxRooms || 10))
    } else if (!available) {
      setRooms((prev) => Math.min(prev + 1, property.maxRooms || 10))
    } else {
      toast.error(`Only ${available.availableRooms} rooms available`)
    }
  }

  const decrementRooms = () => setRooms((prev) => Math.max(prev - 1, 1))

  const incrementAdults = () => {
    if (adults + children < property.maxGuests) {
      setAdults((prev) => Math.min(prev + 1, 20))
    } else {
      toast.error(`Maximum ${property.maxGuests} guests allowed`)
    }
  }

  const decrementAdults = () => setAdults((prev) => Math.max(prev - 1, 1))

  const incrementChildren = () => {
    if (adults + children < property.maxGuests) {
      setChildren((prev) => Math.min(prev + 1, 10))
    } else {
      toast.error(`Maximum ${property.maxGuests} guests allowed`)
    }
  }

  const decrementChildren = () => setChildren((prev) => Math.max(prev - 1, 0))

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
                  <span className="ml-1 font-medium">{property.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({property.reviews} reviews)</span>
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
                    src={property.images[currentImageIndex] || "/placeholder.svg"}
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
                        className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
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
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">{property.discount}% OFF</Badge>
              )}
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {property.type}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <UserRound className="h-3 w-3" />
                  Max {property.maxGuests} guests
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" />
                  Max {property.maxRooms} rooms
                </Badge>
              </div>

              {available && available.success ? (
                <div className="p-3 px-4 bg-green-100 flex items-center gap-3 rounded-lg border border-green-300 text-green-800">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="text-base font-semibold">Available for your dates</h3>
                    <p className="text-sm">
                      {available.availableRooms} {available.availableRooms === 1 ? "room" : "rooms"} available
                    </p>
                  </div>
                </div>
              ) : (
                available !== null && (
                  <div className="p-3 px-4 bg-red-100 rounded-lg border border-red-300 text-red-800 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h3 className="text-base font-semibold">Booking Unavailable</h3>
                      <p className="text-sm">{available?.message}</p>
                    </div>
                  </div>
                )
              )}

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="policies">Policies</TabsTrigger>
                  <TabsTrigger value="host">Host</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">About this place</h2>
                    <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Location</h2>
                    <div className="bg-muted rounded-lg h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <MapIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">{property.location}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Coordinates: {property.coordinates?.latitude}, {property.coordinates?.longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.amenities?.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="policies" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Policies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <CalendarIconFull className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Check-in Time</h3>
                        <p className="text-muted-foreground">{property.policies?.checkInTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <CalendarIconFull className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Check-out Time</h3>
                        <p className="text-muted-foreground">{property.policies?.checkOutTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 border rounded-lg md:col-span-2">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Cancellation Policy</h3>
                        <p className="text-muted-foreground">{property.policies?.cancellation}</p>
                        {property.policies?.cancellation === "Moderate" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Full refund if cancelled 5 days before check-in, 50% refund until 24 hours before check-in.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="host" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Host Information</h2>
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{property.host?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">{property.host?.contact}</p>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Professional host managing this {property.type.toLowerCase()} with excellent service and
                        attention to detail.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-md border-primary/10">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle>Book this property</CardTitle>
                <CardDescription>Fill in the details to reserve your stay</CardDescription>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium text-lg">Rs.{property.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">per night</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Date Range Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">DATES</h3>
                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                              </>
                            ) : (
                              format(dateRange.from, "MMM d, yyyy")
                            )
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                {/* Guests & Rooms */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-muted-foreground">GUESTS & ROOMS</h3>
                    <span className="text-xs text-muted-foreground">
                      {totalGuests}/{property.maxGuests} guests max
                    </span>
                  </div>

                  {/* Rooms Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-5 w-5 text-primary" />
                      <Label htmlFor="rooms" className="font-medium">
                        Rooms
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={decrementRooms}
                        disabled={rooms <= 1}
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Decrease rooms</span>
                      </Button>
                      <span className="w-10 text-center font-medium">{rooms}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={incrementRooms}
                        disabled={
                          rooms >= (property.maxRooms || 10) ||
                          (available && available.success && rooms >= available.availableRooms)
                        }
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Increase rooms</span>
                      </Button>
                    </div>
                  </div>

                  {/* Adults Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-5 w-5 text-primary" />
                      <Label htmlFor="adults" className="font-medium">
                        Adults
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={decrementAdults}
                        disabled={adults <= 1}
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Decrease adults</span>
                      </Button>
                      <span className="w-10 text-center font-medium">{adults}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={incrementAdults}
                        disabled={adults + children >= property.maxGuests}
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Increase adults</span>
                      </Button>
                    </div>
                  </div>

                  {/* Children Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Baby className="h-5 w-5 text-primary" />
                      <Label htmlFor="children" className="font-medium">
                        Children
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={decrementChildren}
                        disabled={children <= 0}
                      >
                        <Minus className="h-3 w-3" />
                        <span className="sr-only">Decrease children</span>
                      </Button>
                      <span className="w-10 text-center font-medium">{children}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={incrementChildren}
                        disabled={adults + children >= property.maxGuests}
                      >
                        <Plus className="h-3 w-3" />
                        <span className="sr-only">Increase children</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Guest Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">GUEST INFORMATION</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className={formError && !name ? "border-red-500" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={formError && (!email || !/^\S+@\S+\.\S+$/.test(email)) ? "border-red-500" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className={formError && (!phone || !/^[0-9+\-\s]{10,15}$/.test(phone)) ? "border-red-500" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requests</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special requests or notes"
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium">Price Details</h3>
                  <div className="flex justify-between">
                    <span>
                      Rs.{property.price.toFixed(2)} × {rooms} {rooms > 1 ? "rooms" : "room"}
                    </span>
                    <span>Rs.{(property.price * rooms).toFixed(2)}</span>
                  </div>
                  {totalNights > 0 && (
                    <div className="flex justify-between">
                      <span>
                        × {totalNights} {totalNights > 1 ? "nights" : "night"}
                      </span>
                      <span>Rs.{totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {property.discount > 0 && totalNights > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({property.discount}%)</span>
                      <span>-Rs.{(totalPrice - discountedPrice).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rs.{totalNights > 0 ? discountedPrice.toFixed(2) : "0.00"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-primary/5 rounded-b-lg">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={
                    loading ||
                    !razorpayLoaded ||
                    (available && !available.success) ||
                    (available && available.availableRooms === 0)
                  }
                >
                  {loading ? "Processing..." : "Book Now"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default PropertyPageDetails
