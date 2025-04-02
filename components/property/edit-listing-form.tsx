"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateProperty } from "@/app/actions/property"
import type { IProperty } from "@/app/models/Property"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploadPreview } from "./image-upload-preview"
import { PropertyPreview } from "./property-preview"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const propertyTypes = [
  "Apartment",
  "House",
  "Condo",
  "Villa",
  "Cabin",
  "Cottage",
  "Farmhouse",
  "Mansion",
  "Castle",
  "Treehouse",
  "Boat",
  "Other",
]

const amenities = [
  { id: "wifi", label: "WiFi" },
  { id: "parking", label: "Parking" },
  { id: "pool", label: "Swimming Pool" },
  { id: "ac", label: "Air Conditioning" },
  { id: "heating", label: "Heating" },
  { id: "tv", label: "TV" },
  { id: "kitchen", label: "Kitchen" },
  { id: "washer", label: "Washer" },
  { id: "dryer", label: "Dryer" },
  { id: "gym", label: "Gym" },
  { id: "spa", label: "Spa" },
  { id: "bbq", label: "BBQ" },
]

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Property name must be at least 5 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  discount: z.coerce.number().min(0).max(100, {
    message: "Discount must be between 0 and 100.",
  }),
  type: z.string({
    required_error: "Please select a property type.",
  }),
  location: z.string().min(5, {
    message: "Location must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  images: z.array(z.string().url({ message: "Please enter a valid URL" })).min(1, {
    message: "At least one image is required.",
  }),
  available: z.boolean().default(true),
  maxGuests: z.coerce.number().positive({
    message: "Max guests must be a positive number.",
  }),
  maxRooms: z.coerce.number().positive({
    message: "Max rooms must be a positive number.",
  }),
  amenities: z.array(z.string()).optional(),
  hostName: z.string().min(2, {
    message: "Host name must be at least 2 characters.",
  }),
  hostContact: z.string().email({
    message: "Please enter a valid email address.",
  }),
  cancellationPolicy: z.string().default("Flexible"),
  checkInTime: z.string().default("3:00 PM"),
  checkOutTime: z.string().default("11:00 AM"),
  latitude: z.coerce.number().min(-90).max(90, {
    message: "Latitude must be between -90 and 90.",
  }),
  longitude: z.coerce.number().min(-180).max(180, {
    message: "Longitude must be between -180 and 180.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface EditListingFormProps {
  property: IProperty
  userId: string
  hostName: string
  hostContact: string
}

export function EditListingForm({ property, userId, hostName, hostContact }: EditListingFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: property.name,
      price: property.price,
      discount: property.discount,
      type: property.type,
      location: property.location,
      description: property.description,
      images: property.images,
      available: property.available,
      maxGuests: property.maxGuests,
      maxRooms: property.maxRooms,
      amenities: property.amenities,
      hostName: property.host.name,
      hostContact: property.host.contact,
      cancellationPolicy: property.policies.cancellation,
      checkInTime: property.policies.checkInTime,
      checkOutTime: property.policies.checkOutTime,
      latitude: property.coordinates.latitude,
      longitude: property.coordinates.longitude,
    },
  })

  const watchedValues = form.watch()

  const addImage = () => {
    if (!currentImageUrl) return

    try {
      // Basic URL validation
      new URL(currentImageUrl)

      const currentImages = form.getValues("images") || []
      form.setValue("images", [...currentImages, currentImageUrl])
      setCurrentImageUrl("")
    } catch (e) {
      toast.error("Please enter a valid URL")
    }
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || []
    form.setValue(
      "images",
      currentImages.filter((_, i) => i !== index),
    )
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      const result = await updateProperty({
        _id: property._id,
        ...data,
      })

      if (result.success) {
        toast.success("Property listing updated successfully!")
        router.push(`/property/${result.slug}`)
      } else {
        toast.error(result.error || "Failed to update property listing")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="details">Basic Details</TabsTrigger>
        <TabsTrigger value="features">Features & Amenities</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Cozy Mountain Retreat" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {propertyTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Night ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Mountain View Rd, Boulder, CO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property in detail..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={() => setActiveTab("features")}>
                    Next: Features & Amenities
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="maxGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Guests</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxRooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Rooms</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Availability</FormLabel>
                          <FormDescription>Is this property currently available for booking?</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="amenities"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Amenities</FormLabel>
                            <FormDescription>Select the amenities available at your property</FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {amenities.map((amenity) => (
                              <FormField
                                key={amenity.id}
                                control={form.control}
                                name="amenities"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={amenity.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(amenity.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), amenity.id])
                                              : field.onChange(field.value?.filter((value) => value !== amenity.id))
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">{amenity.label}</FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Location Coordinates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="any" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Policies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="cancellationPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cancellation Policy</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select policy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Flexible">Flexible</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Strict">Strict</SelectItem>
                              <SelectItem value="Non-refundable">Non-refundable</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Time</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Time</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("images")}>
                    Next: Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Property Images</h3>
                    <p className="text-muted-foreground text-sm">
                      Add high-quality images of your property. Good photos significantly increase booking rates.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                      />
                      <Button type="button" onClick={addImage}>
                        Add Image
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUploadPreview images={field.value || []} onRemove={removeImage} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("features")}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("preview")}>
                    Next: Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Preview Your Listing</h3>
                    <p className="text-muted-foreground text-sm">
                      Review how your property listing will appear to potential guests.
                    </p>
                  </div>

                  <PropertyPreview property={watchedValues} />
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("images")}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Listing"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  )
}

