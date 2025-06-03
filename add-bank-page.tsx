"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AddBankPage() {
  const [accountBalance] = useState(12.0)
  const [formData, setFormData] = useState({
    holderName: "",
    accountNumber: "",
    ifscCode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddBank = () => {
    // Validate form
    if (!formData.holderName.trim()) {
      alert("Please enter account holder name")
      return
    }
    if (!formData.accountNumber.trim()) {
      alert("Please enter account number")
      return
    }
    if (!formData.ifscCode.trim()) {
      alert("Please enter IFSC code")
      return
    }

    // Validate account number (numbers only)
    if (!/^\d+$/.test(formData.accountNumber)) {
      alert("Bank card number cannot contain letters and symbols")
      return
    }

    // Validate IFSC code (first 4 letters, 5th digit is 0, total 11 chars)
    const ifscRegex = /^[A-Z]{4}0\d{6}$/
    if (!ifscRegex.test(formData.ifscCode)) {
      alert("IFSC code should be 11 digits, first 4 digits are letters, 5th digit = 0")
      return
    }

    alert("Bank account added successfully!")
    // In real app: send to API, update user profile
    window.location.href = "/profile"
  }

  const handleCustomerService = () => {
    alert("Connecting to customer service...")
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
        <h1 className="text-white text-2xl font-bold">Add bank</h1>
      </div>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-6">
          {/* Balance Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-blue-500 text-2xl font-bold">Rs{accountBalance.toFixed(2)}</div>
              <div className="text-gray-500">Account balance</div>
            </div>
            <div className="w-16 h-16">
              <img src="/placeholder.svg?height=64&width=64" alt="Gift" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Bank Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="holderName" className="block text-gray-600 mb-2">
                Holder Name
              </label>
              <Input
                id="holderName"
                name="holderName"
                placeholder="Account Holder Name"
                value={formData.holderName}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-gray-600 mb-2">
                Account Number
              </label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div>
              <label htmlFor="ifscCode" className="block text-gray-600 mb-2">
                IFSC Code
              </label>
              <Input
                id="ifscCode"
                name="ifscCode"
                placeholder="IFSC Code"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <Button
              onClick={handleAddBank}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-medium"
            >
              Add bank
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
              <span className="font-semibold">1.</span> Bank card number cannot contain letters and symbols
            </p>
            <p>
              <span className="font-semibold">2.</span> IFSC is 11 digits, the first 4 digits are letters, representing
              the bank number, the 5th digit = 0
            </p>
            <p>
              <span className="font-semibold">3.</span> Bank card number cannot contain letters and symbols
            </p>
            <p>
              <span className="font-semibold">4.</span> If you are facing any problem in adding bank then message
              customer care now
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
