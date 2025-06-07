"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getAuth } from "firebase/auth"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

interface WithdrawalRecord {
  id: string
  amount: number
  status: string
  createdAt: string
  bankDetails: {
    bankName: string
    accountHolderName: string
    accountNumber: string
    ifscCode: string
  }
}

export default function WithdrawalRecordsPage() {
  const router = useRouter()
  const [records, setRecords] = useState<WithdrawalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawalRecords = async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser
        
        if (!user) {
          router.push('/login')
          return
        }

        // Fetch withdrawal records
        const withdrawalsRef = collection(db, 'withdrawals')
        const q = query(
          withdrawalsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const withdrawalRecords: WithdrawalRecord[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          withdrawalRecords.push({
            id: doc.id,
            amount: data.amount,
            status: data.status,
            createdAt: data.createdAt,
            bankDetails: data.bankDetails
          })
        })
        
        setRecords(withdrawalRecords)
      } catch (error) {
        console.error('Error fetching withdrawal records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawalRecords()
  }, [router])

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

      {/* Records List */}
      <div className="mx-4 mt-6">
        {loading ? (
          <div className="text-white text-center">Loading...</div>
        ) : records.length === 0 ? (
          <Card className="bg-white rounded-2xl p-6 text-center">
            <p className="text-gray-500">No withdrawal records found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="bg-white rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">₹{record.amount}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    record.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                    record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Bank:</span> {record.bankDetails.bankName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Account:</span> {record.bankDetails.accountNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">IFSC:</span> {record.bankDetails.ifscCode}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
