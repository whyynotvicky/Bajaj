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
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useRouter } from "next/navigation"

interface BankCard {
  holderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
}

export default function ProfilePage() {
  const [activeNavTab, setActiveNavTab] = useState("profile")
  const [user, setUser] = useState<any | null>(null)
  const [bankCard, setBankCard] = useState<BankCard | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          // Get user's bank details
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/bank-card', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.bankCard) {
              setBankCard({
                holderName: data.bankCard.accountHolderName,
                accountNumber: data.bankCard.accountNumber,
                ifscCode: data.bankCard.ifscCode,
                bankName: data.bankCard.bankName
              });
            }
          }

          // Get user's balance and other details
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Update any other user data you need
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center">
          {/* User Avatar with Bajaj Logo */}
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
                  <h3 className="font-semibold text-lg">Bank Details</h3>
                  <div className="text-blue-100 text-sm mt-2">
                    <div><span className="font-semibold">Bank:</span> {bankCard.bankName}</div>
                    <div><span className="font-semibold">Holder:</span> {bankCard.holderName}</div>
                    <div><span className="font-semibold">Account:</span> {bankCard.accountNumber}</div>
                    <div><span className="font-semibold">IFSC:</span> {bankCard.ifscCode}</div>
                  </div>
                </>
              ) : user ? (
                <>
                  <h3 className="font-semibold text-lg">No bank details</h3>
                  <p className="text-blue-100 text-sm">Please add your bank details</p>
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
                <div className="text-blue-500 text-xl font-bold">--</div>
                <div className="text-gray-500 text-sm">Balance</div>
              </div>
              <div>
                <div className="text-blue-500 text-xl font-bold">--</div>
                <div className="text-gray-500 text-sm">Recharge</div>
              </div>
              <div>
                <div className="text-blue-500 text-xl font-bold">--</div>
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
                  <RefreshCw className="text-white" size={20} />
                </div>
                <span className="font-medium">Transactions</span>
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

      {/* Password Section */}
      <div className="mx-4 mb-6">
        <Card className="bg-blue-400 rounded-2xl p-4 text-white border-0">
          <button onClick={handlePassword} className="flex items-center justify-between w-full py-2">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <Wifi className="text-white" size={20} />
              </div>
              <span className="font-medium">Password</span>
            </div>
            <ChevronRight className="text-white" size={20} />
          </button>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-20">
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
            <User className="text-blue-600" size={24} />
            <span className="text-xs mt-1 text-blue-600">Profile</span>
          </Link>
        </div>
      </div>
      {/* Logout Button - always visible at the bottom above navigation */}
      <div className="fixed left-0 right-0 bottom-16 px-4 z-30">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl py-4 font-semibold text-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <LogOut size={20} /> Logout
        </Button>
      </div>

      {/* New Bank Card Section */}
      <div className="mx-4 mt-6 space-y-4">
        <Link href="/withdrawal-records">
          <Button className="w-full bg-white text-blue-600 hover:bg-gray-50">
            View Withdrawal Records
          </Button>
        </Link>
        <Button 
          onClick={() => router.push('/add-bank-card')}
          className="w-full bg-white text-blue-600 hover:bg-gray-50"
        >
          {bankCard ? 'Update Bank Details' : 'Add Bank Details'}
        </Button>
      </div>
    </div>
  )
}
