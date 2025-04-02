"use client"

import { useAuthContext } from "@/app/components/AuthProvider"
import { useEffect, useState } from "react"
import type { IProperty } from "@/app/models/Property"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DollarSign, Edit, Home, MapPin, Plus, Search, Trash2, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { deleteProperty, getUserProperties } from "@/app/actions/property"

export default function Listings() {
  const { user } = useAuthContext()
  const [properties, setProperties] = useState<IProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?._id) return

      try {
        const data = await getUserProperties(user._id)
        setProperties(data)
      } catch (error) {
        console.error("Error fetching properties:", error)
        toast.error("Failed to load your properties")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [user])

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      setIsDeleting(true)
      await deleteProperty(propertyId)

      // Update local state
      setProperties(properties.filter((property) => property._id !== propertyId))
      toast.success("Property deleted successfully")
    } catch (error) {
      console.error("Error deleting property:", error)
      toast.error("Failed to delete property")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-high":
        return b.price - a.price
      case "price-low":
        return a.price - b.price
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to view your listings.</p>
          </CardContent>
          <CardFooter>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your property listings</p>
        </div>

        <Link href="/listings/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location or type..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : sortedProperties.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-center">No Properties Found</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "No properties match your search criteria. Try a different search term."
                : "You haven't created any property listings yet. Add your first property to get started."}
            </p>
            <Link href="/listings/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <Card key={property._id} className="overflow-hidden flex flex-col">
              <div className="aspect-video relative">
                <Image
                  src={property.images[0] || "/placeholder.svg?height=300&width=500"}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={property.available ? "default" : "secondary"}>
                    {property.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{property.name}</CardTitle>
                  <div className="flex items-center text-lg font-bold">
                    {/* <DollarSign className="h-4 w-4" /> */}
                    <span>Rs.</span>
                    {property.discount > 0 ? (
                      <span>
                        {(property.price - (property.price * property.discount) / 100).toFixed(2)}
                        <span className="text-sm text-muted-foreground line-through ml-1">Rs.{property.price}</span>
                      </span>
                    ) : (
                      property.price
                    )}
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{property.location}</span>
                </div>
              </CardHeader>

              <CardContent className="pb-2 flex-grow">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="flex items-center">
                    <Home className="h-3 w-3 mr-1" />
                    {property.type}
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {property.maxGuests} {property.maxGuests === 1 ? "Guest" : "Guests"}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2">{property.description}</p>
              </CardContent>

              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <Link href={`/edit-listing/${property._id}`} passHref>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your property listing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProperty(property._id)} disabled={isDeleting}>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

