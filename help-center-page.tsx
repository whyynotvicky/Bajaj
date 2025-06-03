"use client"

import { ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function HelpCenterPage() {
  const handleTelegramJoin = () => {
    // Open Telegram channel in new tab
    window.open("https://t.me/bajajhelpline99", "_blank")
  }

  const handleCustomerCare = () => {
    alert("Connecting to customer care chat...")
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
        <h1 className="text-white text-2xl font-bold">Help Center</h1>
      </div>

      {/* Main Content */}
      <div className="mx-4 mt-8">
        <Card className="bg-white rounded-3xl p-6">
          <h2 className="text-gray-800 text-2xl font-bold mb-6">Contact Us</h2>

          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-4">
              {/* Customer Care */}
              <div className="bg-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center mr-4">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <MessageCircle className="text-white" size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold text-lg">CustomerCare</h3>
                    <p className="text-gray-600 text-sm">Online - 9am to 7pm</p>
                  </div>
                </div>
                <Button
                  onClick={handleCustomerCare}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium"
                >
                  Chat
                </Button>
              </div>

              {/* Telegram Channel */}
              <div className="bg-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.54-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.49.24l.17-2.43 4.47-4.03c.19-.17-.04-.27-.3-.1L9.39 13.17l-2.43-.76c-.53-.17-.54-.53.11-.78l9.49-3.66c.44-.17.83.11.68.78z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold text-lg">Telegram Channel</h3>
                    <p className="text-gray-600 text-sm">Join For Updates</p>
                  </div>
                </div>
                <Button
                  onClick={handleTelegramJoin}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium"
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
