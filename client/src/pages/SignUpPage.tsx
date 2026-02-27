import { SignUp } from "@clerk/clerk-react";
import { Link } from "wouter";

export default function SignUpPage() {
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  if (!clerkEnabled) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md border rounded-xl p-6 bg-card text-card-foreground">
          <h1 className="text-2xl font-bold mb-2">Sign Up Unavailable</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Add `VITE_CLERK_PUBLISHABLE_KEY` in your `.env` file to enable Clerk authentication.
          </p>
          <Link href="/" className="text-sm underline underline-offset-2">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="text-sm underline underline-offset-2">
          Back to Home
        </Link>
      </div>
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
