"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { useAuthContext } from "@/app/components/AuthProvider";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Listings",
    href: "/listings",
    icon: Home,
  },
  {
    title: "Bookings",
    href: "/mybookings",
    icon: CalendarDays,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuthContext();
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-all md:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "h-[100dvh] inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <Home className="h-6 w-6" />
              <span>Travel.com</span>
            </Link>
          </div>

          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t p-4">
            <Link href="/listings/new">
              <Button className="w-full justify-start" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>

            <div className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                U
              </div>
              <div className="flex-1 truncate">
                <div className="text-sm font-medium">{user?.displayName??"User"}</div>
                <div className="text-xs text-muted-foreground truncate">
                {user?.email ?? "user@email.com"}
                </div>
              </div>
            </div>

            <Button
              onClick={signOut}
              variant="ghost"
              className="mt-2 w-full justify-start text-muted-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
