"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Calendar, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function CheckInPage() {
  const [user, setUser] = useState<any | null>(null)
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.lastCheckIn) {
              setLastCheckIn(userData.lastCheckIn.toDate())
            }
            setStreak(userData.checkInStreak || 0)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const canCheckIn = () => {
    if (!lastCheckIn) return true
    const now = new Date()
    const lastCheckInDate = new Date(lastCheckIn)
    return now.toDateString() !== lastCheckInDate.toDateString()
  }

  const handleCheckIn = async () => {
    if (!user || !canCheckIn()) return

    setCheckingIn(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      const now = new Date()
      const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn) : null
      
      // Check if this is a consecutive day
      const isConsecutive = lastCheckInDate && 
        (now.getTime() - lastCheckInDate.getTime()) <= 24 * 60 * 60 * 1000

      const newStreak = isConsecutive ? streak + 1 : 1
      const reward = 7 // 7 rupees per check-in

      await updateDoc(userRef, {
        lastCheckIn: serverTimestamp(),
        checkInStreak: newStreak,
        balance: (await getDoc(userRef)).data()?.balance + reward
      })

      setLastCheckIn(now)
      setStreak(newStreak)
      alert(`Check-in successful! You earned ₹${reward}`)
    } catch (error) {
      console.error('Error during check-in:', error)
      alert('Failed to check in. Please try again.')
    } finally {
      setCheckingIn(false)
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
        <h1 className="text-white text-2xl font-bold">Daily Check-in</h1>
        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <Calendar className="text-blue-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Check-in</h2>
            <p className="text-gray-600">Check in daily to earn ₹7!</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Current Streak</h3>
                  <p className="text-2xl font-bold text-blue-500">{streak} days</p>
                </div>
                <Gift className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Last Check-in</h3>
              <p className="text-gray-600">
                {lastCheckIn 
                  ? new Date(lastCheckIn).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'No check-ins yet'}
              </p>
            </div>

            <Button
              onClick={handleCheckIn}
              disabled={!canCheckIn() || checkingIn}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 font-semibold text-lg disabled:opacity-50"
            >
              {checkingIn 
                ? "Checking in..."
                : canCheckIn()
                  ? "Check in now"
                  : "Already checked in today"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
} 