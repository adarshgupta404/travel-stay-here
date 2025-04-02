"use client";

import { useAuthContext } from "@/app/components/AuthProvider";
import { NewListingForm } from "@/components/property/new-listing-form";
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

export default function NewListing() {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to create a new listing.
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

  return (
    <div className="container mx-auto py-6">
      {/* <div className="mb-6">
        <Link
          href="/dashboard"
          className="flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div> */}

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Property Listing
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to list your property on our platform.
          </p>
        </div>

        {(user._id) && (
          <NewListingForm
            userId={user._id}
            hostName={user.displayName || "Host"}
            hostContact={user.email || ""}
          />
        )}
      </div>
    </div>
  );
}
