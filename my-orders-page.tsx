"use client"

import { useState } from "react"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  productName: string
  amount: number
  date: string
  status: "active" | "expired" | "pending"
}

export default function MyOrdersPage() {
  // Sample orders data - in real app this would come from API
  const [orders] = useState<Order[]>([
    // Uncomment to show sample orders
    // {
    //   id: "ORD123456",
    //   productName: "Normal Product",
    //   amount: 210,
    //   date: "2025-01-15",
    //   status: "active"
    // }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center p-4 pt-12">
        <Link href="/profile" className="mr-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
            <ArrowLeft className="text-white" size={24} />
          </div>
        </Link>
        <h1 className="text-white text-2xl font-bold">My Orders</h1>
      </div>

      {/* Content */}
      <div className="bg-gray-100 min-h-[calc(100vh-100px)] rounded-t-3xl pt-6 px-4">
        {orders.length === 0 ? (
          // Empty State
          <div className="flex items-center mt-4">
            <div className="bg-black rounded-full p-2 mr-3">
              <X className="text-white" size={16} />
            </div>
            <p className="text-gray-700 text-lg">No! You have no active subscriptions.</p>
          </div>
        ) : (
          // Orders List
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{order.productName}</h3>
                  <p className="text-gray-500 text-sm">Order ID: {order.id}</p>
                  <p className="text-gray-500 text-sm">Date: {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">₹{order.amount}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "active"
                        ? "bg-green-100 text-green-700"
                        : order.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
