"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const { login, resetPassword, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      router.push('/')
    } catch (error: any) {
      setError(mapFirebaseError(error))
    }
  }

  const handleResetPassword = async () => {
    setResetLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (error: any) {
      setError(mapFirebaseError(error))
    } finally {
      setResetLoading(false)
    }
  }

  function mapFirebaseError(error: any) {
    if (!error || !error.code) return 'An error occurred.'
    switch (error.code) {
      case 'auth/user-not-found': return 'No user found with this email.'
      case 'auth/wrong-password': return 'Incorrect password.'
      case 'auth/invalid-email': return 'Invalid email address.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      default: return error.message || 'An error occurred.'
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="loader"></div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-blue-100 text-lg">Please sign in to your registered account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <img src="/images/logo.jpg" alt="Bajaj Logo" className="mx-auto h-16 mb-2 rounded-lg bg-white p-2" />
            <p className="text-gray-600 italic text-lg">Inspiring Trust</p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {resetSent && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">Password reset email sent!</span>
              </div>
            )}
            {/* Email Field */}
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="w-full h-14 bg-blue-50 border-2 border-blue-200 rounded-2xl px-4 text-gray-600 placeholder-gray-400 focus:border-blue-400 focus:bg-blue-50"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button type="button" className="text-blue-500 hover:underline text-sm" onClick={handleResetPassword} disabled={resetLoading || !email}>
                {resetLoading ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>

            {/* Login Button */}
            <Button 
              type="submit"
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-2xl mt-8 shadow-lg"
              disabled={resetLoading}
            >
              LOGIN NOW
            </Button>

            {/* Create Account Link */}
            <div className="text-center mt-6">
              <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
