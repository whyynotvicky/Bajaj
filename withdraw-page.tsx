"use client"

import { useState } from "react"
import { ArrowLeft, Calculator, Edit, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface WithdrawalTransaction {
  id: string
  amount: number
  date: string
  status: "pending" | "completed" | "failed"
  taxAmount: number
  netAmount: number
}

export default function WithdrawPage() {
  const [accountBalance] = useState(17.0)
  const [bankAccount] = useState("40510017")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transactions] = useState<WithdrawalTransaction[]>([
    // Uncomment to show sample transactions
    // {
    //   id: "WD123456",
    //   amount: 1000,
    //   date: "2025-01-15 14:30",
    //   status: "completed",
    //   taxAmount: 100,
    //   netAmount: 900
    // }
  ])

  const TAX_RATE = 0.1 // 10%
  const MIN_WITHDRAWAL = 180
  const MAX_WITHDRAWAL = 100000

  const calculateWithdrawal = (amount: number) => {
    const taxAmount = amount * TAX_RATE
    const netAmount = amount - taxAmount
    return { taxAmount, netAmount }
  }

  const validateWithdrawal = (amount: string) => {
    const numAmount = Number.parseFloat(amount)

    if (!amount || isNaN(numAmount)) {
      return { isValid: false, message: "Please enter a valid amount" }
    }

    if (numAmount < MIN_WITHDRAWAL) {
      return { isValid: false, message: `Minimum withdrawal amount is Rs ${MIN_WITHDRAWAL}` }
    }

    if (numAmount > MAX_WITHDRAWAL) {
      return { isValid: false, message: `Maximum withdrawal amount is Rs ${MAX_WITHDRAWAL}` }
    }

    if (numAmount > accountBalance) {
      return { isValid: false, message: "Insufficient balance" }
    }

    return { isValid: true, message: "" }
  }

  const handleWithdraw = async () => {
    const validation = validateWithdrawal(withdrawAmount)

    if (!validation.isValid) {
      alert(validation.message)
      return
    }

    const amount = Number.parseFloat(withdrawAmount)
    const { taxAmount, netAmount } = calculateWithdrawal(amount)

    // Check current time for market hours (09:00 to 16:30)
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 100 + currentMinute

    if (currentTime < 900 || currentTime > 1630) {
      alert("Withdrawals are only allowed during market promotion time: 09:00:00 to 16:30:00")
      return
    }

    const confirmMessage = `Withdrawal Details:
Amount: Rs ${amount}
Tax (10%): Rs ${taxAmount.toFixed(2)}
Net Amount: Rs ${netAmount.toFixed(2)}
Bank Account: ${bankAccount} *****

Do you want to proceed?`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real app: send withdrawal request to API
      // const response = await fetch('/api/withdraw', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: amount,
      //     bankAccount: bankAccount,
      //     taxAmount: taxAmount,
      //     netAmount: netAmount
      //   })
      // })

      alert(`Withdrawal request submitted successfully!
Amount: Rs ${amount}
Tax: Rs ${taxAmount.toFixed(2)}
Net Amount: Rs ${netAmount.toFixed(2)}

Your request will be processed within 24 hours.`)

      setWithdrawAmount("")
    } catch (error) {
      alert("Failed to process withdrawal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBankAccount = () => {
    alert("Redirecting to bank account management...")
    window.location.href = "/bank/add"
  }

  const handleCustomerService = () => {
    alert("Connecting to customer service for withdrawal assistance...")
  }

  const handleCalculator = () => {
    if (withdrawAmount) {
      const amount = Number.parseFloat(withdrawAmount)
      if (!isNaN(amount)) {
        const { taxAmount, netAmount } = calculateWithdrawal(amount)
        alert(`Withdrawal Calculator:
Gross Amount: Rs ${amount}
Tax (10%): Rs ${taxAmount.toFixed(2)}
Net Amount: Rs ${netAmount.toFixed(2)}`)
      }
    } else {
      alert("Please enter an amount to calculate")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link href="/home" className="mr-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
            <ArrowLeft className="text-white" size={24} />
          </div>
        </Link>
        <h1 className="text-white text-2xl font-bold">Withdraw</h1>
        <button
          onClick={handleCalculator}
          className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30"
        >
          <Calculator className="text-white" size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <Card className="bg-gray-200 rounded-2xl p-6">
          {/* Account Balance */}
          <div className="mb-6">
            <div className="text-blue-500 text-2xl font-bold">Rs{accountBalance.toFixed(2)}</div>
            <div className="text-gray-600">Account balance</div>
          </div>

          {/* Withdrawal Form */}
          <div className="space-y-6">
            {/* Amount Field */}
            <div>
              <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={MIN_WITHDRAWAL}
                max={Math.min(MAX_WITHDRAWAL, accountBalance)}
                className="w-full h-12 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 text-gray-700 placeholder-gray-500"
              />
              {withdrawAmount && (
                <div className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const amount = Number.parseFloat(withdrawAmount)
                    if (!isNaN(amount)) {
                      const { taxAmount, netAmount } = calculateWithdrawal(amount)
                      return `Tax: Rs ${taxAmount.toFixed(2)} | Net: Rs ${netAmount.toFixed(2)}`
                    }
                    return ""
                  })()}
                </div>
              )}
            </div>

            {/* Bank Account Number */}
            <div>
              <label htmlFor="bankAccount" className="block text-gray-700 font-medium mb-2">
                Bank Account Number
              </label>
              <div className="relative">
                <div className="w-full h-12 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 flex items-center justify-between">
                  <span className="text-gray-700">{bankAccount} *****</span>
                  <button onClick={handleEditBankAccount} className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg">
                    <Edit className="text-white" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <Button
              onClick={handleWithdraw}
              disabled={isLoading || !withdrawAmount}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 font-semibold text-lg disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Withdraw Now"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Explain Section */}
      <div className="mx-4 mb-6">
        <Card className="bg-gray-200 rounded-2xl p-4">
          <div className="border-l-4 border-yellow-400 pl-3 mb-4">
            <h3 className="font-semibold text-gray-800">Explain</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold">1.</span> The daily market promotion time is from 09:00:00 to 16:30:00
            </p>
            <p>
              <span className="font-semibold">2.</span> Single withdrawal amount between {MIN_WITHDRAWAL} and{" "}
              {MAX_WITHDRAWAL.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">3.</span> For the convenience of financial settlement, you can only apply
              for withdrawal 1 times a day
            </p>
            <p>
              <span className="font-semibold">4.</span> Withdrawal tax rate: {(TAX_RATE * 100).toFixed(0)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="mx-4 mb-6">
        <Card className="bg-gray-200 rounded-2xl p-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No Transactions Found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Withdrawals</h3>
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">Rs {transaction.amount}</p>
                    <p className="text-sm text-gray-600">Net: Rs {transaction.netAmount}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
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
