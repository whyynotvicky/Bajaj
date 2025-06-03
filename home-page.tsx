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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"
import { app } from "./lib/firebase/config"

export default function HomePage() {
  const [notifications, setNotifications] = useState(3)
  const [todayEarning, setTodayEarning] = useState(0)
  const [yesterdayEarning, setYesterdayEarning] = useState(0)
  const [totalEarning, setTotalEarning] = useState(0)

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
        // Daily earnings for active plans
        if (order.revenueEnd && new Date(order.revenueEnd) > now) {
          today += order.dailyEarnings || 0
          // If order started yesterday, count for yesterday's earning
          if (order.purchaseDate && order.purchaseDate.slice(0, 10) === yesterdayDateStr) {
            yesterday += order.dailyEarnings || 0
          }
        }
        // Total spent on all plans
        total += order.amount || 0
      })
      setTodayEarning(today)
      setYesterdayEarning(yesterday)
      setTotalEarning(total)
    }
    fetchEarnings()
  }, [])

  const handleCheckIn = () => {
    alert("Check In completed! Daily bonus added.")
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

  const transactions = [
    { id: "9080", amount: "4400", date: "2025-05-17 15:11", masked: "**** 94" },
    { id: "2837", amount: "9753", date: "2025-05-10 15:11", masked: "**** 64" },
    { id: "7828", amount: "4579", date: "2025-05-13 15:11", masked: "**** 96" },
    { id: "8291", amount: "5963", date: "2025-05-04 15:11", masked: "**** 38" },
  ]

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
        <button onClick={handleNotification} className="relative p-2">
          <Bell className="text-white" size={24} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>
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

      {/* Complete Tasks Section */}
      <div className="mx-4 mb-6 mt-12">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Complete tasks to get rewards</h3>
          <Button
            onClick={handleCompleteTask}
            className="bg-blue-400 hover:bg-blue-300 text-white rounded-full px-6 py-2"
          >
            To Complete <ChevronRight size={16} className="ml-1" />
          </Button>
        </Card>
      </div>

      {/* Transaction History */}
      <div className="mx-4 space-y-3">
        {transactions.map((transaction, index) => (
          <Card key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full p-2 mr-3">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    User {transaction.id} {transaction.masked}
                  </div>
                  <div className="text-green-600 text-sm">Withdraw {transaction.amount}₹ successfully</div>
                </div>
              </div>
              <div className="text-gray-500 text-sm">{transaction.date}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Complete Tasks Section */}
      <div className="mx-4 my-6 pb-20">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Complete tasks to get rewards</h3>
          <Button
            onClick={handleCompleteTask}
            className="bg-blue-400 hover:bg-blue-300 text-white rounded-full px-6 py-2"
          >
            To Complete <ChevronRight size={16} className="ml-1" />
          </Button>
        </Card>
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
