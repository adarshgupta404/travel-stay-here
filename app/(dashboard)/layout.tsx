"use client";
import { Sidebar } from "@/components/dashboard/sidebar";
import type React from "react";
import { useAuthContext } from "../components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className=" animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 max-h-[100dvh] overflow-y-auto p-6 md:p-8 pt-6">
        {children}
      </div>
    </div>
  );
}
