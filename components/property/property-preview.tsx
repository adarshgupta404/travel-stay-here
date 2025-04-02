"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BedDouble, Calendar, Check, Clock, DollarSign, Home, MapPin, Users } from "lucide-react"

interface PropertyPreviewProps {
  property: {
    name: string
    price: number
    discount: number
    type: string
    location: string
    description: string
    images: string[]
    maxGuests: number
    maxRooms: number
    amenities?: string[]
    cancellationPolicy: string
    checkInTime: string
    checkOutTime: string
  }
}

export function PropertyPreview({ property }: PropertyPreviewProps) {
  const discountedPrice = property.price - property.price * (property.discount / 100)

  // Map amenity IDs to readable labels
  const amenityLabels: Record<string, string> = {
    wifi: "WiFi",
    parking: "Parking",
    pool: "Swimming Pool",
    ac: "Air Conditioning",
    heating: "Heating",
    tv: "TV",
    kitchen: "Kitchen",
    washer: "Washer",
    dryer: "Dryer",
    gym: "Gym",
    spa: "Spa",
    bbq: "BBQ",
  }

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      {property.images.length > 0 ? (
        <div className="aspect-[16/9] overflow-hidden rounded-lg relative">
          <Image src={property.images[0] || "/placeholder.svg"} alt={property.name} fill className="object-cover" />

          {property.images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {property.images.slice(0, 4).map((_, index) => (
                <div key={index} className={`w-2 h-2 rounded-full ${index === 0 ? "bg-white" : "bg-white/50"}`} />
              ))}
              {property.images.length > 4 && <div className="w-2 h-2 rounded-full bg-white/50" />}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">No images available</p>
        </div>
      )}

      {/* Property Details */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{property.name || "Property Name"}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location || "Location"}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center">
              {/* <DollarSign className="h-4 w-4" /> */}
              <span>Rs.</span>
              <span className="text-2xl font-bold">
                {property.discount > 0 ? (
                  <>
                    {discountedPrice.toFixed(2)}
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      Rs.{Number(property.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                    Number(property.price).toFixed(2)
                )}
              </span>
              <span className="text-sm text-muted-foreground ml-1">/ night</span>
            </div>

            {property.discount > 0 && (
              <Badge variant="destructive" className="mt-1">
                {property.discount}% OFF
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center">
            <Home className="h-3 w-3 mr-1" />
            {property.type || "Property Type"}
          </Badge>

          <Badge variant="outline" className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {property.maxGuests} {property.maxGuests === 1 ? "Guest" : "Guests"}
          </Badge>

          <Badge variant="outline" className="flex items-center">
            <BedDouble className="h-3 w-3 mr-1" />
            {property.maxRooms} {property.maxRooms === 1 ? "Room" : "Rooms"}
          </Badge>
        </div>

        <Separator />

        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground">{property.description || "No description provided."}</p>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <>
            <Separator />

            <div>
              <h3 className="font-medium mb-2">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>{amenityLabels[amenity] || amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div>
          <h3 className="font-medium mb-2">Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cancellation</p>
                  <p className="text-sm text-muted-foreground">{property.cancellationPolicy}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Check-in</p>
                  <p className="text-sm text-muted-foreground">{property.checkInTime}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Check-out</p>
                  <p className="text-sm text-muted-foreground">{property.checkOutTime}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

