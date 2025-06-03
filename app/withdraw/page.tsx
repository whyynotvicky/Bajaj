"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'

export default function WithdrawPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load balance from localStorage
    const storedBalance = localStorage.getItem('balance')
    if (storedBalance) {
      setBalance(parseFloat(storedBalance))
    }
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const withdrawAmount = parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Please enter a valid amount')
      setLoading(false)
      return
    }

    if (withdrawAmount > balance) {
      alert('Insufficient balance')
      setLoading(false)
      return
    }

    try {
      // Here you would typically make an API call to process the withdrawal
      // For now, we'll just simulate a successful withdrawal
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update balance in localStorage
      const newBalance = balance - withdrawAmount
      localStorage.setItem('balance', newBalance.toString())
      
      alert('Withdrawal successful!')
      router.push('/profile')
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      alert('Failed to process withdrawal. Please try again.')
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-white text-2xl font-bold">Withdraw</h1>
      </div>

      {/* Main Content */}
      <div className="mx-4 mt-6">
        <Card className="bg-white rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-gray-500 text-sm mb-1">Available Balance</h2>
            <div className="text-blue-500 text-3xl font-bold">₹{balance.toLocaleString()}</div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
                Withdrawal Amount
              </label>
              <Input
                id="amount"
                type="number"
                required
                min="1"
                max={balance}
                step="0.01"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-medium"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
