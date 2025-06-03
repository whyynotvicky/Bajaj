"use client"

import { useState } from "react"
import { ArrowLeft, Home, Package, Star, User, Bell, Gift, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Notification {
  id: string
  type: "reward" | "withdrawal" | "system" | "promotion"
  title: string
  message: string
  time: string
  read: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Uncomment these to show sample notifications
    // {
    //   id: '1',
    //   type: 'reward',
    //   title: 'Daily Check-in Reward',
    //   message: 'You have received ₹50 for daily check-in!',
    //   time: '2 hours ago',
    //   read: false
    // },
    // {
    //   id: '2',
    //   type: 'withdrawal',
    //   title: 'Withdrawal Successful',
    //   message: 'Your withdrawal of ₹5000 has been processed successfully.',
    //   time: '1 day ago',
    //   read: true
    // },
    // {
    //   id: '3',
    //   type: 'system',
    //   title: 'System Maintenance',
    //   message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM.',
    //   time: '2 days ago',
    //   read: true
    // }
  ])

  const [activeTab, setActiveTab] = useState("notifications")

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reward":
        return <Gift className="text-green-500" size={20} />
      case "withdrawal":
        return <CreditCard className="text-blue-500" size={20} />
      case "system":
        return <AlertCircle className="text-orange-500" size={20} />
      case "promotion":
        return <Bell className="text-purple-500" size={20} />
      default:
        return <Bell className="text-gray-500" size={20} />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/home">
            <ArrowLeft className="text-gray-600 mr-3" size={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="ghost" className="text-blue-500 text-sm">
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {notifications.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-gray-400 mb-4">
              <Bell size={64} />
            </div>
            <p className="text-gray-500 text-lg">No notifications found</p>
          </div>
        ) : (
          // Notifications List
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-all ${
                  !notification.read ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center py-2">
            <Home className="text-gray-400" size={24} />
            <span className="text-xs mt-1 text-gray-400">Home</span>
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
