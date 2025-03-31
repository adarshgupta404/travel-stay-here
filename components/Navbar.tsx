"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuthContext } from "@/app/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const { user, signOut } = useAuthContext();
  const handleLogout = () => {
    if (typeof signOut === "function") {
      signOut();
    }
  };

  return (
    <header className="bg-blue-700 relative z-10 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold">
            Travel.com
          </Link>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm hover:underline hidden md:block">
              List your property
            </Link>
            <Link href="#" className="text-sm hover:underline hidden md:block">
              Deals
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0"
                  >
                    {user ? (
                      <Image
                        src={ "https://avatar.iran.liara.run/public/39"}
                        alt={user.displayName || "Anonymous"}
                        className="h-10 w-10 rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 text-white">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.displayName || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email || ""}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="cursor-pointer">
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button className="text-white border-white bg-transparent hover:bg-blue-600">
                  <Link href={"/login"}>Log In</Link>
                </Button>
                <Button className="bg-white text-blue-700 hover:bg-gray-100">
                  <Link href={"/signup"}>Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
