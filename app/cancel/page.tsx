"use client";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-3xl font-bold text-red-600">Booking Canceled ❌</h1>
      <p className="mt-2 text-lg">It looks like you didn’t complete the booking.</p>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
        onClick={() => router.push("/")}
      >
        Try Again
      </button>
    </div>
  );
}
