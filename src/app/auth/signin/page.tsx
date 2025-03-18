"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignIn() {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Safe way to access searchParams after mounting
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");
  
  // Return a loading state or empty div before mounting
  if (!isMounted) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"></div>;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/mush.png" alt="MushFlow Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Sign in to MushFlow</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error === "CredentialsSignin" 
              ? "Invalid credentials" 
              : "An error occurred during sign in"}
          </div>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-md p-3 text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  );
} 