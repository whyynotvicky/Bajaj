"use client"

import { useState, useEffect } from "react"
import {
  Download,
  Building,
  Package,
  CreditCard,
  FileText,
  HelpCircle,
  Wifi,
  LogOut,
  ChevronRight,
  Home,
  Star,
  User,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

interface BankCard {
  holderName: string
  accountNumber: string
  ifscCode: string
}

export default function ProfilePage() {
  const [activeNavTab, setActiveNavTab] = useState("profile")
  const [user, setUser] = useState<any | null>(null)
  const [bankCard, setBankCard] = useState<BankCard | null>(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const response = await fetch('/api/bank-card')
          if (response.ok) {
            const data = await response.json()
            if (data.bankCard) {
              setBankCard(data.bankCard)
            }
          }
        } catch (error) {
          console.error('Error fetching bank card:', error)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleRecharge = () => {
    window.location.href = "/recharge"
  }

  const handleWithdraw = () => {
    if (!bankCard) {
      alert('Please add bank details first')
      window.location.href = "/bank/add"
      return
    }
    window.location.href = "/withdraw"
  }

  const handleOrders = () => {
    window.location.href = "/orders"
  }

  const handleBankCard = () => {
    window.location.href = "/bank/add"
  }

  const handleWithdrawRecord = () => {
    window.location.href = "/withdrawal-records"
  }

  const handleHelpCenter = () => {
    window.location.href = "/help-center"
  }

  const handlePassword = () => {
    window.location.href = "/password-manager"
  }

  const handleTransactions = () => {
    window.location.href = "/transactions"
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await signOut(getAuth())
      window.location.href = "/login"
    }
  }

  const handleDownload = () => {
    alert("Downloading user data...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Logout Button */}
      <div className="mx-4 mt-4 mb-4">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl py-4 font-semibold text-lg flex items-center justify-center gap-2"
        >
          <LogOut size={20} /> Logout
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-white">
              <img src="/images/logo.jpg" alt="Bajaj Logo" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <div className="ml-4">
            {loading ? (
              <h2 className="text-white font-semibold text-lg">Loading...</h2>
            ) : user?.email ? (
              <h2 className="text-white font-semibold text-lg">{user.email}</h2>
            ) : (
              <h2 className="text-white font-semibold text-lg">Please log in to view your profile</h2>
            )}
          </div>
        </div>
        <button onClick={handleDownload} className="bg-white/20 p-2 rounded-lg">
          <Download className="text-white" size={24} />
        </button>
      </div>

      {/* Bank Card Section */}
      <div className="mx-4 mb-4">
        <Card className="bg-blue-400 rounded-2xl p-4 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <h3 className="font-semibold text-lg">Loading...</h3>
              ) : user && bankCard ? (
                <>
                  <h3 className="font-semibold text-lg">Bank Card</h3>
                  <div className="text-blue-100 text-sm mt-2">
                    <div><span className="font-semibold">Holder:</span> {bankCard.holderName}</div>
                    <div><span className="font-semibold">Account:</span> {bankCard.accountNumber}</div>
                    <div><span className="font-semibold">IFSC:</span> {bankCard.ifscCode}</div>
                  </div>
                  <button 
                    onClick={handleBankCard}
                    className="mt-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                  >
                    Edit Details
                  </button>
                </>
              ) : user ? (
                <>
                  <h3 className="font-semibold text-lg">No bank card</h3>
                  <p className="text-blue-100 text-sm">Please add your bank card</p>
                  <button 
                    onClick={handleBankCard}
                    className="mt-2 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                  >
                    Add Bank Card
                  </button>
                </>
              ) : null}
            </div>
            <Building className="text-white" size={32} />
          </div>
        </Card>
      </div>

      {/* Balance Section */}
      {user && (
        <div className="mx-4 mb-6">
          <Card className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <div className="text-blue-500 text-xl font-bold">₹{balance.toFixed(2)}</div>
                <div className="text-gray-500 text-sm">Balance</div>
              </div>
              <div>
                <div className="text-blue-500 text-xl font-bold">₹{balance.toFixed(2)}</div>
                <div className="text-gray-500 text-sm">Recharge</div>
              </div>
              <div>
                <div className="text-blue-500 text-xl font-bold">₹{balance.toFixed(2)}</div>
                <div className="text-gray-500 text-sm">Total Earning</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleRecharge}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 font-medium"
              >
                Recharge
              </Button>
              <Button
                onClick={handleWithdraw}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 font-medium"
              >
                Withdraw
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Menu Options */}
      <div className="mx-4 mb-4">
        <Card className="bg-blue-400 rounded-2xl p-4 text-white border-0">
          <div className="space-y-4">
            <button onClick={handleOrders} className="flex items-center justify-between w-full py-2">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Package className="text-white" size={20} />
                </div>
                <span className="font-medium">Orders</span>
              </div>
              <ChevronRight className="text-white" size={20} />
            </button>

            <div className="border-t border-white/20"></div>

            <button onClick={handleBankCard} className="flex items-center justify-between w-full py-2">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <CreditCard className="text-white" size={20} />
                </div>
                <span className="font-medium">Bank Card</span>
              </div>
              <ChevronRight className="text-white" size={20} />
            </button>

            <div className="border-t border-white/20"></div>

            <button onClick={handleWithdrawRecord} className="flex items-center justify-between w-full py-2">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <FileText className="text-white" size={20} />
                </div>
                <span className="font-medium">Withdraw Record</span>
              </div>
              <ChevronRight className="text-white" size={20} />
            </button>

            <div className="border-t border-white/20"></div>

            <button onClick={handleTransactions} className="flex items-center justify-between w-full py-2">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <FileText className="text-white" size={20} />
                </div>
                <span className="font-medium">Transactions</span>
              </div>
              <ChevronRight className="text-white" size={20} />
            </button>

            <div className="border-t border-white/20"></div>

            <button onClick={handlePassword} className="flex items-center justify-between w-full py-2">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Wifi className="text-white" size={20} />
                </div>
                <span className="font-medium">Password Manager</span>
              </div>
              <ChevronRight className="text-white" size={20} />
            </button>

            <div className="border-t border-white/20"></div>

            <button onClick={handleHelpCenter} className="flex items-center justify-between w-full py-2">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <HelpCircle className="text-white" size={20} />
                </div>
                <span className="font-medium">Help Center</span>
              </div>
              <ChevronRight className="text-white" size={20} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
