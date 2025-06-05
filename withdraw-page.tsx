"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calculator, Edit, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface WithdrawalTransaction {
  id: string
  amount: number
  date: string
  status: "pending" | "completed" | "failed"
  taxAmount: number
  netAmount: number
}

export default function WithdrawPage() {
  const [user, setUser] = useState<any | null>(null)
  const [accountBalance, setAccountBalance] = useState(0)
  const [bankAccount, setBankAccount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transactions] = useState<WithdrawalTransaction[]>([])

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setAccountBalance(userData.balance || 0)
            if (userData.bankCard) {
              setBankAccount(userData.bankCard.accountNumber)
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    })
    return () => unsubscribe()
  }, [])

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
    if (!user) {
      alert("Please login to withdraw")
      return
    }

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
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      const currentBalance = userDoc.data().balance || 0
      if (currentBalance < amount) {
        throw new Error("Insufficient balance")
      }

      // Update user's balance
      await updateDoc(userRef, {
        balance: currentBalance - amount
      })

      // Create withdrawal record
      const withdrawalRef = doc(db, 'withdrawals', `${user.uid}_${Date.now()}`)
      await setDoc(withdrawalRef, {
        userId: user.uid,
        amount: amount,
        taxAmount: taxAmount,
        netAmount: netAmount,
        bankAccount: bankAccount,
        status: "pending",
        createdAt: serverTimestamp()
      })

      alert(`Withdrawal request submitted successfully!
Amount: Rs ${amount}
Tax: Rs ${taxAmount.toFixed(2)}
Net Amount: Rs ${netAmount.toFixed(2)}

Your request will be processed within 24 hours.`)

      setWithdrawAmount("")
      setAccountBalance(currentBalance - amount)
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      alert("Failed to process withdrawal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditBankAccount = () => {
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
        <Link href="/profile" className="mr-4">
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
            <div className="text-blue-500 text-2xl font-bold">₹{accountBalance.toFixed(2)}</div>
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
                  <span className="text-gray-700">{bankAccount ? `${bankAccount} *****` : "No bank account added"}</span>
                  <button onClick={handleEditBankAccount} className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg">
                    <Edit className="text-white" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Withdraw Button */}
            <Button
              onClick={handleWithdraw}
              disabled={isLoading || !withdrawAmount || !bankAccount}
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
            <p>• Minimum withdrawal amount: ₹{MIN_WITHDRAWAL}</p>
            <p>• Maximum withdrawal amount: ₹{MAX_WITHDRAWAL}</p>
            <p>• Withdrawal time: 09:00:00 to 16:30:00</p>
            <p>• Processing time: Within 24 hours</p>
            <p>• Tax rate: {TAX_RATE * 100}%</p>
          </div>
        </Card>
      </div>

      {/* Customer Service */}
      <div className="mx-4 mb-6">
        <Button
          onClick={handleCustomerService}
          className="w-full bg-white/20 backdrop-blur-sm text-white rounded-xl py-4 font-semibold text-lg border border-white/30"
        >
          <Headphones className="inline-block mr-2" size={20} />
          Contact Customer Service
        </Button>
      </div>
    </div>
  )
}
