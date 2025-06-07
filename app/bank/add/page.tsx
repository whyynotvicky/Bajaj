"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import { getAuth } from 'firebase/auth'

export default function AddBankPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) {
        alert('Please login to add bank details')
        setLoading(false);
        return
      }

      const idToken = await user.getIdToken();

      const response = await fetch('/api/bank-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save bank details')
      }
      
      alert('Bank details saved successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Error saving bank details:', error)
      alert('Failed to save bank details. Please try again.')
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
        <h1 className="text-white text-2xl font-bold">Add Bank Account</h1>
      </div>

      {/* Form */}
      <div className="mx-4 mt-6">
        <Card className="bg-white rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accountHolderName" className="block text-gray-700 font-medium mb-2">
                Account Holder Name
              </label>
              <Input
                id="accountHolderName"
                name="accountHolderName"
                type="text"
                required
                placeholder="Enter account holder name"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-gray-700 font-medium mb-2">
                Account Number
              </label>
              <Input
                id="accountNumber"
                name="accountNumber"
                type="text"
                required
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div>
              <label htmlFor="ifscCode" className="block text-gray-700 font-medium mb-2">
                IFSC Code
              </label>
              <Input
                id="ifscCode"
                name="ifscCode"
                type="text"
                required
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <div>
              <label htmlFor="bankName" className="block text-gray-700 font-medium mb-2">
                Bank Name
              </label>
              <Input
                id="bankName"
                name="bankName"
                type="text"
                required
                placeholder="Enter bank name"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full h-12 border-2 border-gray-200 rounded-xl px-4"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-medium"
            >
              {loading ? 'Saving...' : 'Save Bank Details'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
} 