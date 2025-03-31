"use client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-3xl font-bold text-green-600">Booking Successful! 🎉</h1>
      <p className="mt-2 text-lg">You will receive a confirmation email shortly.</p>
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
        onClick={() => router.push("/")}
      >
        Go to Home
      </button>
    </div>
  );
}
