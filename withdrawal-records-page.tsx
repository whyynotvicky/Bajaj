"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Headphones } from "lucide-react"
import Link from "next/link"
import { getAuth } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"
import { app } from "./lib/firebase/config"

interface WithdrawalRecord {
  id: string
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
  accountNumber: string
}

export default function WithdrawalRecordsPage() {
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([])

  useEffect(() => {
    const fetchRecords = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return
      const db = getFirestore(app)
      const q = query(collection(db, "withdrawals"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)
      const records: WithdrawalRecord[] = querySnapshot.docs.map(doc => doc.data() as WithdrawalRecord)
      setWithdrawalRecords(records)
    }
    fetchRecords()
  }, [])

  const handleCustomerService = () => {
    alert("Connecting to customer service...")
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
        <h1 className="text-white text-2xl font-bold">Withdrawal Records</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-100px)]">
        {withdrawalRecords.length === 0 ? (
          // Empty State
          <p className="text-gray-400 text-xl">No Withdrawal Found</p>
        ) : (
          // Withdrawal Records List
          <div className="w-full px-4 space-y-4">
            {withdrawalRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium text-gray-800">₹{record.amount}</h3>
                  <p className="text-gray-500 text-sm">Acc: {record.accountNumber}</p>
                  <p className="text-gray-500 text-sm">Date: {record.date}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      record.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : record.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {record.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Customer Service Button */}
      <div className="fixed right-4 bottom-6">
        <button onClick={handleCustomerService} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <Headphones className="text-white" size={20} />
        </button>
      </div>
    </div>
  )
}
