"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch {
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[360px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#1A1A2E] mb-2">Welcome back</h1>
        <p className="text-[#6B7280]">Welcome back! Please enter your details.</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[#344054] text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 border-[#D0D5DD] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[#344054] text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-[#D0D5DD] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/20 pr-11 transition-all"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#667085] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#D0D5DD] text-[#7C3AED] focus:ring-[#7C3AED]/20 focus:ring-offset-0"
            />
            <span className="text-sm text-[#344054]">Remember for 30 days</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-semibold transition-colors"
          >
            Forgot password
          </Link>
        </div>

        {/* Sign in button */}
        <Button
          type="submit"
          className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {/* Google button */}
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-semibold text-[#344054]">Sign in with Google</span>
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-[#667085] mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-[360px]">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#1A1A2E] mb-2">Welcome back</h1>
        <p className="text-[#6B7280]">Welcome back! Please enter your details.</p>
      </div>
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white px-8 lg:px-16">
        {/* Logo */}
        <header className="py-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
            <span className="text-base font-semibold text-[#1A1A2E]">
              Arquetype
            </span>
          </Link>
        </header>

        {/* Form centered */}
        <main className="flex-1 flex items-center justify-center">
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="py-8">
          <p className="text-sm text-[#667085]">
            &copy; Arquetype {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      {/* Right side - Minimal decoration */}
      <div className="hidden lg:flex lg:flex-1 bg-[#F9FAFB] items-center justify-center relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F3F4F6] via-[#EDE9FE]/30 to-[#F9FAFB]" />

        {/* Purple abstract shape */}
        <div className="relative">
          {/* Main semicircle */}
          <div className="w-72 h-36 bg-gradient-to-b from-[#7C3AED] to-[#6D28D9] rounded-t-full" />
          {/* Blur glow effect */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-56 h-20 bg-[#7C3AED]/30 blur-3xl rounded-full" />
        </div>
      </div>
    </div>
  );
}
