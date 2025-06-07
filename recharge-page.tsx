"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { startFastzixPayment } from "@/lib/fastzix"
import { getAuth } from "firebase/auth"

export default function RechargePage() {
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userPhone, setUserPhone] = useState("")

  const quickAmounts = [210, 310, 420, 700, 900, 1200, 1400, 2100, 6000]

  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user && user.phoneNumber && /^\d{10,15}$/.test(user.phoneNumber)) {
      setUserPhone(user.phoneNumber)
      localStorage.setItem('userPhone', user.phoneNumber)
    } else {
      // Try to get from localStorage if previously saved
      const storedPhone = localStorage.getItem('userPhone')
      if (storedPhone && /^\d{10,15}$/.test(storedPhone)) setUserPhone(storedPhone)
    }
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPhone(e.target.value)
    localStorage.setItem('userPhone', e.target.value)
  }

  const handleQuickAmount = (amount: number) => {
    setRechargeAmount(amount.toString())
  }

  const handleRechargeNow = async () => {
    setError("")
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      setError("Please enter or select a valid recharge amount")
      return
    }
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      setError("Please log in first.")
      return
    }
    if (!userPhone || !/^\d{10,15}$/.test(userPhone)) {
      setError("Please enter a valid phone number (10-15 digits) to recharge.")
      return
    }
    setLoading(true)
    try {
      await startFastzixPayment({ 
        amount: Number(rechargeAmount), 
        userId: user.uid, 
        userPhone, 
        onError: (msg) => setError(msg || 'Payment failed. Please try again.') 
      })
    } catch (e: any) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/wallet" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Recharge Wallet</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                type="tel"
                value={userPhone}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full mb-4"
              />
              
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => handleQuickAmount(amount)}
                    className={rechargeAmount === amount.toString() ? "bg-primary text-primary-foreground" : ""}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              onClick={handleRechargeNow}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Processing..." : "Recharge Now"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Need help? Contact our support team
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
