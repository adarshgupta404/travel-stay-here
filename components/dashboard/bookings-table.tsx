"use client";
import { getUserBookings } from "@/app/actions/booking";
import { useAuthContext } from "@/app/components/AuthProvider";
import { IBooking } from "@/app/models/Bookings";
import { IProperty } from "@/app/models/Property";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Booking extends IBooking {
    _id: any;
    property: IProperty;
}
export async function BookingsTable() {
  const [bookings, setBooking] = useState<Booking[]>([]);
  const { user } = useAuthContext();
  useEffect(() => {
    const fetchBookings = async () => {
      if (user && user._id) {
        const data:any = await getUserBookings(user._id);
        setBooking(data)
      }
    };
    fetchBookings();
  }, [user]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell className="font-medium">
                {booking.paymentId}
              </TableCell>
              <TableCell>{booking.property.name}</TableCell>
              <TableCell>{booking.name}</TableCell>
              <TableCell>
                {new Date(booking.checkIn).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(booking.checkOut).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    booking.status === "Confirmed"
                      ? "default"
                      : booking.status === "Pending"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell>Rs.{booking.totalPrice}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/bookings/${booking._id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Update Status</DropdownMenuItem>
                    <DropdownMenuItem>Contact Guest</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
