"use client"

import { useState } from "react"
import { ArrowLeft, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function RechargePage() {
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [selectedChannel, setSelectedChannel] = useState("channelA")

  const quickAmounts = [210, 310, 420, 700, 900, 1200, 1400, 2100, 6000]

  const handleQuickAmount = (amount: number) => {
    setRechargeAmount(amount.toString())
  }

  const handleChannelChange = (channel: string) => {
    setSelectedChannel(channel)
  }

  const handleRechargeNow = () => {
    if (!rechargeAmount) {
      alert("Please enter or select a recharge amount")
      return
    }

    const channelName = selectedChannel === "channelA" ? "Channel A" : "Channel B"
    alert(`Processing recharge of Rs ${rechargeAmount} through ${channelName}...`)

    // In real app: integrate with payment gateway
    // Simulate payment processing
    setTimeout(() => {
      alert("Recharge successful! Your account has been credited.")
    }, 2000)
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
        <h1 className="text-white text-2xl font-bold">Recharge</h1>
      </div>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-6">
          {/* Recharge Amount Input */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">Recharge Amount</h3>
            <Input
              type="number"
              placeholder="Recharge Amount"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="w-full h-12 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 text-gray-700 placeholder-gray-400 focus:border-blue-400"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">Quick Amount</h3>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    rechargeAmount === amount.toString()
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-blue-200 text-blue-500 hover:border-blue-400"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Selection */}
          <div className="mb-6">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">Channel</h3>
            <div className="space-y-3">
              <div
                onClick={() => handleChannelChange("channelA")}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedChannel === "channelA"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="text-gray-700 font-medium">Channel A</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === "channelA" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}
                >
                  {selectedChannel === "channelA" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>

              <div
                onClick={() => handleChannelChange("channelB")}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedChannel === "channelB"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="text-gray-700 font-medium">Channel B</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChannel === "channelB" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}
                >
                  {selectedChannel === "channelB" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Image Placeholder */}
          <div className="mb-4">
            <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center">
              <img
                src="/placeholder.svg?height=40&width=64"
                alt="Payment Method"
                className="w-full h-full object-contain"
              />
            </div>
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
              <span className="font-semibold">1.</span> Please do not modify the deposit amount. Unauthorized
              modification of the deposit amount will result in the deposit not being credited
            </p>
            <p>
              <span className="font-semibold">2.</span> Each deposit requires payment to be initiated through this page,
              please do not save the payment
            </p>
            <p>
              <span className="font-semibold">3.</span> Deposit received within 5 minutes, if not received within 5
              minutes, please contact online customer service for processing
            </p>
            <p>
              <span className="font-semibold">4.</span> Due to too many deposit users, please try multiple times to
              obtain the deposit link or try again after a period of time
            </p>
          </div>
        </Card>
      </div>

      {/* Recharge Now Button */}
      <div className="mx-4 mb-20">
        <Button
          onClick={handleRechargeNow}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-semibold text-lg"
        >
          Recharge Now
        </Button>
      </div>

      {/* Floating Customer Service Buttons */}
      <div className="fixed right-4 bottom-6 space-y-3">
        <button onClick={handleCustomerService} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <Headphones className="text-white" size={20} />
        </button>
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
