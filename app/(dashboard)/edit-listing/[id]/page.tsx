"use client";

import { useAuthContext } from "@/app/components/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { IProperty } from "@/app/models/Property";
import { toast } from "sonner";
import { getPropertyById } from "@/app/actions/property";
import { EditListingForm } from "@/components/property/edit-listing-form";

export default function EditListing({ params }: { params: { id: string } }) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [property, setProperty] = useState<IProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user?._id) return;

      try {
        const data = await getPropertyById(params.id);

        // Check if the property belongs to the current user
        if (data.data.userId.toString() !== user._id.toString()) {
          setError("You do not have permission to edit this property");
          toast.error("You do not have permission to edit this property");
          setTimeout(() => router.push("/listings"), 2000);
          return;
        }

        setProperty(data.data);
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to load property details");
        toast.error("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, user, router]);

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to edit a listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link
            href="/listings"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link
            href="/listings"
            className="flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Property not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/listings">
              <Button>Return to Listings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          href="/listings"
          className="flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Property: {property.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Update the details of your property listing.
          </p>
        </div>

        {user._id && (
          <EditListingForm
            property={property}
            userId={user._id}
            hostName={user.displayName || property.host.name}
            hostContact={user.email || property.host.contact}
          />
        )}
      </div>
    </div>
  );
}
