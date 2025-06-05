"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  Clock,
  Users,
  RefreshCw,
  Download,
  Headphones,
  ChevronRight,
  User,
  Home,
  Package,
  Star,
  Calendar,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs, orderBy, limit, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { app } from "./lib/firebase/config"
import TransactionTicker from "@/components/TransactionTicker"

interface Transaction {
  id: string
  userId: string
  amount: number
  timestamp: any
}

export default function HomePage() {
  const [notifications, setNotifications] = useState(3)
  const [todayEarning, setTodayEarning] = useState(0)
  const [yesterdayEarning, setYesterdayEarning] = useState(0)
  const [totalEarning, setTotalEarning] = useState(0)
  const [showCheckInNotification, setShowCheckInNotification] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0)
  const [checkInStreak, setCheckInStreak] = useState(0)

  useEffect(() => {
    const fetchEarnings = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      const db = getFirestore(app)
      const q = query(collection(db, "orders"), where("userId", "==", user.uid), where("status", "==", "success"))
      const querySnapshot = await getDocs(q)
      let today = 0
      let yesterday = 0
      let total = 0
      const now = new Date()
      const todayDate = now.toISOString().slice(0, 10)
      const yesterdayDate = new Date(now)
      yesterdayDate.setDate(now.getDate() - 1)
      const yesterdayDateStr = yesterdayDate.toISOString().slice(0, 10)
      querySnapshot.forEach(doc => {
        const order = doc.data()
        if (order.revenueEnd && new Date(order.revenueEnd) > now) {
          today += order.dailyEarnings || 0
          if (order.purchaseDate && order.purchaseDate.slice(0, 10) === yesterdayDateStr) {
            yesterday += order.dailyEarnings || 0
          }
        }
        total += order.amount || 0
      })
      setTodayEarning(today)
      setYesterdayEarning(yesterday)
      setTotalEarning(total)
    }

    const fetchRecentTransactions = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      const db = getFirestore(app)
      const q = query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc"),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]
      setRecentTransactions(transactions)
    }

    const checkLastCheckIn = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      const db = getFirestore(app)
      const userDocRef = doc(db, "users", user.uid)
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        const lastCheckIn = userData.lastCheckIn?.toDate()
        setCheckInStreak(userData.checkInStreak || 0)
        if (lastCheckIn) {
          const today = new Date()
          const lastCheckInDate = new Date(lastCheckIn)
          if (lastCheckInDate.toDateString() !== today.toDateString()) {
            setShowCheckInNotification(true)
          }
        } else {
          setShowCheckInNotification(true)
        }
      }
    }

    fetchEarnings()
    fetchRecentTransactions()
    checkLastCheckIn()

    // Rotate through transactions
    const interval = setInterval(() => {
      setCurrentTransactionIndex(prev => 
        prev === recentTransactions.length - 1 ? 0 : prev + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    try {
      const db = getFirestore(app)
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) return

      const userData = userDoc.data()
      const lastCheckIn = userData.lastCheckIn?.toDate()
      const now = new Date()
      
      // Check if already checked in today
      if (lastCheckIn && lastCheckIn.toDateString() === now.toDateString()) {
        alert("You have already checked in today!")
        return
      }

      // Check if this is a consecutive day
      const isConsecutive = lastCheckIn && 
        (now.getTime() - lastCheckIn.getTime()) <= 24 * 60 * 60 * 1000

      const newStreak = isConsecutive ? (userData.checkInStreak || 0) + 1 : 1
      const reward = 7 // 7 rupees per check-in

      await updateDoc(userRef, {
        lastCheckIn: serverTimestamp(),
        checkInStreak: newStreak,
        balance: (userData.balance || 0) + reward
      })

      setCheckInStreak(newStreak)
      setShowCheckInNotification(false)
      alert(`Check-in successful! You earned ₹${reward}`)
    } catch (error) {
      console.error('Error during check-in:', error)
      alert('Failed to check in. Please try again.')
    }
  }

  const handleInvite = () => {
    window.location.href = "/invite"
  }

  const handleRecharge = () => {
    window.location.href = "/recharge"
  }

  const handleWithdraw = () => {
    window.location.href = "/withdraw"
  }

  const handleNotification = () => {
    window.location.href = "/notifications"
  }

  const handleCustomerCare = () => {
    alert("Connecting to customer support...")
  }

  const handleCompleteTask = () => {
    alert("Redirecting to tasks page...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
            <div className="absolute -right-1 top-0 w-0 h-0 border-l-[15px] border-l-blue-700 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
          </div>
          <div className="ml-2">
            <span className="text-orange-500 font-bold text-xl">BAJAJ</span>
            <p className="text-white text-xs italic">Inspiring Trust</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showCheckInNotification && (
            <button 
              onClick={handleCheckIn}
              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-green-600 transition-colors"
            >
              <Calendar size={16} />
              Check In (₹7)
            </button>
          )}
          <button onClick={handleNotification} className="relative p-2">
            <Bell className="text-white" size={24} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Banner */}
      <div className="mx-4 mb-6">
        <Image src="/images/banner.jpg" alt="Bajaj Banner" width={1200} height={350} className="w-full h-auto rounded-3xl object-cover shadow-xl" priority />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-4 mx-4 mb-6">
        <button onClick={handleCheckIn} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 border border-white/30">
            <Clock className="text-white" size={28} />
          </div>
          <span className="text-white text-sm font-medium">Check In</span>
          {checkInStreak > 0 && (
            <span className="text-green-300 text-xs">Streak: {checkInStreak}</span>
          )}
        </button>

        <button onClick={handleInvite} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 border border-white/30">
            <Users className="text-white" size={28} />
          </div>
          <span className="text-white text-sm font-medium">Invite</span>
        </button>

        <button onClick={handleRecharge} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 border border-white/30">
            <RefreshCw className="text-white" size={28} />
          </div>
          <span className="text-white text-sm font-medium">Recharge</span>
        </button>

        <button onClick={handleWithdraw} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-2 border border-white/30">
            <Download className="text-white" size={28} />
          </div>
          <span className="text-white text-sm font-medium">Withdraw</span>
        </button>
      </div>

      {/* Earnings Section */}
      <div className="mx-4 mb-6 relative">
        <Card className="bg-white rounded-3xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-blue-500 text-2xl font-bold">₹{todayEarning}</div>
              <div className="text-gray-500 text-sm">Today earning</div>
            </div>
            <div>
              <div className="text-blue-500 text-2xl font-bold">₹{yesterdayEarning}</div>
              <div className="text-gray-500 text-sm">Yesterday earning</div>
            </div>
            <div>
              <div className="text-blue-500 text-2xl font-bold">₹{totalEarning}</div>
              <div className="text-gray-500 text-sm">Total earning</div>
            </div>
          </div>
        </Card>

        {/* Customer Care Button */}
        <button
          onClick={handleCustomerCare}
          className="absolute -bottom-6 -right-2 bg-blue-500 rounded-full p-3 shadow-lg"
        >
          <Headphones className="text-white" size={20} />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-1">
            <span className="text-blue-500 text-xs font-bold">CUSTOMER CENTER</span>
          </div>
        </button>
      </div>

      {/* Transaction Ticker */}
      <div className="mx-4 mb-6">
        <TransactionTicker />
      </div>

      {/* Bottom Customer Care Button */}
      <div className="fixed bottom-6 right-6">
        <button onClick={handleCustomerCare} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <Headphones className="text-white" size={20} />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-1">
            <span className="text-blue-500 text-xs font-bold">CUSTOMER CENTER</span>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center py-2">
            <Home className="text-blue-600" size={24} />
            <span className="text-xs mt-1 text-blue-600">Home</span>
          </Link>

          <Link href="/products" className="flex flex-col items-center py-2">
            <Package className="text-gray-400" size={24} />
            <span className="text-xs mt-1 text-gray-400">Products</span>
          </Link>

          <Link href="/team" className="flex flex-col items-center py-2">
            <Star className="text-gray-400" size={24} />
            <span className="text-xs mt-1 text-gray-400">Team</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center py-2">
            <User className="text-gray-400" size={24} />
            <span className="text-xs mt-1 text-gray-400">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
