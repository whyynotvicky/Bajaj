"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function PasswordManagerPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validatePassword = (password: string) => {
    // Password should be at least 8 characters long and contain letters, numbers, and special characters
    const minLength = password.length >= 8
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: minLength && hasLetter && hasNumber && hasSpecial,
      minLength,
      hasLetter,
      hasNumber,
      hasSpecial,
    }
  }

  const handleUpdatePassword = async () => {
    // Validate all fields are filled
    if (!formData.oldPassword.trim()) {
      alert("Please enter your old password")
      return
    }

    if (!formData.newPassword.trim()) {
      alert("Please enter a new password")
      return
    }

    if (!formData.confirmPassword.trim()) {
      alert("Please confirm your new password")
      return
    }

    // Check if new passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password do not match")
      return
    }

    // Check if old and new passwords are different
    if (formData.oldPassword === formData.newPassword) {
      alert("New password must be different from old password")
      return
    }

    // Validate new password strength
    const passwordValidation = validatePassword(formData.newPassword)
    if (!passwordValidation.isValid) {
      let errorMessage = "Password must contain:\n"
      if (!passwordValidation.minLength) errorMessage += "- At least 8 characters\n"
      if (!passwordValidation.hasLetter) errorMessage += "- At least one letter\n"
      if (!passwordValidation.hasNumber) errorMessage += "- At least one number\n"
      if (!passwordValidation.hasSpecial) errorMessage += "- At least one special character\n"
      alert(errorMessage)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call for password update
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real app: send to API to verify old password and update new password
      // const response = await fetch('/api/update-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     oldPassword: formData.oldPassword,
      //     newPassword: formData.newPassword
      //   })
      // })

      alert("Password updated successfully!")

      // Clear form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Redirect back to profile
      window.location.href = "/profile"
    } catch (error) {
      alert("Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerService = () => {
    alert("Connecting to customer service for password assistance...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center p-4 pt-12">
        <Link href="/profile" className="mr-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
            <ArrowLeft className="text-white" size={24} />
          </div>
        </Link>
        <h1 className="text-white text-2xl font-bold">Password Manager</h1>
      </div>

      {/* Password Form */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-6">
          <div className="space-y-6">
            {/* Old Password */}
            <div>
              <label htmlFor="oldPassword" className="block text-gray-800 font-semibold text-lg mb-3">
                Old Password
              </label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPasswords.old ? "text" : "password"}
                  placeholder="Enter old password"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("old")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-gray-800 font-semibold text-lg mb-3">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-800 font-semibold text-lg mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Update Button */}
            <Button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-4 font-semibold text-lg disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Explain Section */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-4">
          <div className="border-l-4 border-yellow-400 pl-3 mb-4">
            <h3 className="font-semibold text-gray-800">Explain</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold">1.</span> The password is an important credential for you to login, add
              bank accounts, and delete bank accounts. Please ensure proper storage.
            </p>
            <p>
              <span className="font-semibold">2.</span> Always keep your password long, then you will not face any
              problem example - VIP2485@X.
            </p>
            <p>
              <span className="font-semibold">3.</span> If you have forgotten your password, please message Customer
              Care
            </p>
          </div>
        </Card>
      </div>

      {/* Floating Customer Service Buttons */}
      <div className="fixed right-4 bottom-6 space-y-3">
        <button onClick={handleCustomerService} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <Headphones className="text-white" size={20} />
        </button>
        <button onClick={handleCustomerService} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <Headphones className="text-white" size={20} />
        </button>
      </div>
    </div>
  )
}
