"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const { signup } = useAuthContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signup(email, password, displayName)
      router.push('/') // Redirect to home page after successful registration
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-100 text-lg">Join us and start your journey</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              {/* Bajaj Logo */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                  <div className="absolute -right-2 top-0 w-0 h-0 border-l-[20px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
                </div>
                <span className="ml-3 text-4xl font-bold">
                  <span className="text-orange-500">B</span>
                  <span className="text-orange-500">a</span>
                  <span className="text-orange-500">j</span>
                  <span className="text-orange-500">a</span>
                  <span className="text-orange-500">j</span>
                </span>
              </div>
            </div>
            <p className="text-gray-600 italic text-lg">Inspiring Trust</p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                className="w-full h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 text-gray-600 placeholder-gray-400 focus:border-blue-400 focus:bg-blue-50"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="w-full h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 text-gray-600 placeholder-gray-400 focus:border-blue-400 focus:bg-blue-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 pr-12 text-gray-600 placeholder-gray-400 focus:border-blue-400 focus:bg-blue-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Register Button */}
            <Button 
              type="submit"
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-2xl mt-8 shadow-lg"
            >
              CREATE ACCOUNT
            </Button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
