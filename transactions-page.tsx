"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  type: "recharge" | "withdrawal" | "commission" | "bonus"
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
  description: string
}

export default function TransactionsPage() {
  // Sample transactions - in real app this would come from API
  const [transactions] = useState<Transaction[]>([
    // Uncomment to show sample transactions
    // {
    //   id: "TXN123456",
    //   type: "recharge",
    //   amount: 500,
    //   date: "2025-01-15 14:30",
    //   status: "completed",
    //   description: "Account recharge"
    // }
  ])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-b-3xl pb-12">
        <div className="flex items-center p-4 pt-12">
          <Link href="/profile" className="mr-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
              <ArrowLeft className="text-white" size={24} />
            </div>
          </Link>
          <h1 className="text-white text-2xl font-bold">Transactions</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6">
        {transactions.length === 0 ? (
          // Empty State
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <p className="text-gray-400 text-xl">No Transactions Found</p>
          </div>
        ) : (
          // Transactions List
          <div className="space-y-4 mt-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{transaction.description}</h3>
                  <p className="text-gray-500 text-sm">ID: {transaction.id}</p>
                  <p className="text-gray-500 text-sm">Date: {transaction.date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === "withdrawal"
                        ? "text-red-600"
                        : transaction.type === "recharge"
                          ? "text-blue-600"
                          : "text-green-600"
                    }`}
                  >
                    {transaction.type === "withdrawal" ? "-" : "+"}₹{transaction.amount}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : transaction.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {transaction.status.toUpperCase()}
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
