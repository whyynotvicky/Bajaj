"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AddBankPage() {
  const [user, setUser] = useState<any | null>(null)
  const [holderName, setHolderName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [ifscCode, setIfscCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.bankCard) {
              setHolderName(userData.bankCard.holderName || "")
              setAccountNumber(userData.bankCard.accountNumber || "")
              setIfscCode(userData.bankCard.ifscCode || "")
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    if (!user) {
      alert("Please login to add bank details")
      return
    }

    if (!holderName || !accountNumber || !ifscCode) {
      alert("Please fill in all bank details")
      return
    }

    setSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      console.log("Attempting to save bank details for user:", user.uid);
      console.log("Saving bankCard data:", { holderName, accountNumber, ifscCode });
      await updateDoc(userRef, {
        bankCard: {
          holderName,
          accountNumber,
          ifscCode
        }
      })
      console.log("Bank details saved successfully!");
      alert("Bank details saved successfully!")
      window.location.href = "/profile"
    } catch (error) {
      console.error('Error saving bank details:', error)
      alert("Failed to save bank details. Please try again.")
    } finally {
      setSaving(false)
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
        <h1 className="text-white text-2xl font-bold">Bank Details</h1>
        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-6">
          <div className="space-y-6">
            {/* Account Holder Name */}
            <div>
              <label htmlFor="holderName" className="block text-gray-700 font-medium mb-2">
                Account Holder Name
              </label>
              <Input
                id="holderName"
                type="text"
                placeholder="Enter account holder name"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                className="w-full h-12 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-gray-700 font-medium mb-2">
                Account Number
              </label>
              <Input
                id="accountNumber"
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full h-12 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label htmlFor="ifscCode" className="block text-gray-700 font-medium mb-2">
                IFSC Code
              </label>
              <Input
                id="ifscCode"
                type="text"
                placeholder="Enter IFSC code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="w-full h-12 bg-gray-100 border-2 border-gray-300 rounded-xl px-4 text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 font-semibold text-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Bank Details"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
