"use client"

import React from 'react'
import { useState, useEffect } from "react"
import { ShoppingBag, Home, Package, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { app } from './lib/firebase/config'
import type { User as FirebaseUser } from 'firebase/auth'
import { startFastzixPayment } from './lib/fastzix'

interface Product {
  id: string
  name: string
  image: string
  price: number
  revenue: string
  dailyEarnings: number
  totalRevenue: number
}

interface Order {
  userId: string
  productId: string
  productName: string
  amount: number
  purchaseDate: string
  revenueEnd: string
  status: string
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("normal")
  const [activeNavTab, setActiveNavTab] = useState("products")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [purchaseMessage, setPurchaseMessage] = useState("")
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [notification, setNotification] = useState("")
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [userBalance, setUserBalance] = useState<number | null>(null)

  const normalFundProducts: Product[] = [
    {
      id: "1",
      name: "Normal Product",
      image: "/images/Normal fund.jpg",
      price: 210,
      revenue: "60 Days",
      dailyEarnings: 260,
      totalRevenue: 15600,
    },
    {
      id: "2",
      name: "Normal Product",
      image: "/images/Normal fund.jpg",
      price: 420,
      revenue: "60 Days",
      dailyEarnings: 600,
      totalRevenue: 36000,
    },
    {
      id: "3",
      name: "Normal Product",
      image: "/images/Normal fund.jpg",
      price: 700,
      revenue: "60 Days",
      dailyEarnings: 1100,
      totalRevenue: 66000,
    },
    {
      id: "4",
      name: "Normal Product",
      image: "/images/Normal fund.jpg",
      price: 980,
      revenue: "60 Days",
      dailyEarnings: 1799,
      totalRevenue: 107940,
    },
    {
      id: "5",
      name: "Normal Product",
      image: "/images/Normal fund.jpg",
      price: 1400,
      revenue: "60 Days",
      dailyEarnings: 3200,
      totalRevenue: 192000,
    },
    {
      id: "6",
      name: "Normal Product",
      image: "/images/Normal fund.jpg",
      price: 2000,
      revenue: "60 Days",
      dailyEarnings: 6000,
      totalRevenue: 360000,
    },
  ]

  const welfareFundProducts: Product[] = [
    {
      id: "w1",
      name: "Welfare Product 01",
      image: "/images/welfare fund.jpg",
      price: 310,
      revenue: "7 Days",
      dailyEarnings: 450,
      totalRevenue: 3150,
    },
    {
      id: "w2",
      name: "Welfare Product 02",
      image: "/images/welfare fund.jpg",
      price: 810,
      revenue: "7 Days",
      dailyEarnings: 1700,
      totalRevenue: 11900,
    },
    {
      id: "w3",
      name: "Welfare Product 03",
      image: "/images/welfare fund.jpg",
      price: 1200,
      revenue: "7 Days",
      dailyEarnings: 2600,
      totalRevenue: 18200,
    },
    {
      id: "w4",
      name: "Welfare Product 04",
      image: "/images/welfare fund.jpg",
      price: 2100,
      revenue: "7 Days",
      dailyEarnings: 4500,
      totalRevenue: 31500,
    },
  ]

  const activityFundProducts: Product[] = [
    {
      id: "a1",
      name: "Activity Plan 1",
      image: "/images/activity fund.jpg",
      price: 430,
      revenue: "3 Days",
      dailyEarnings: 1200,
      totalRevenue: 3600,
    },
    {
      id: "a2",
      name: "Activity Plan 2",
      image: "/images/activity fund.jpg",
      price: 900,
      revenue: "3 Days",
      dailyEarnings: 1899,
      totalRevenue: 5697,
    },
    {
      id: "a3",
      name: "Activity Plan 3",
      image: "/images/activity fund.jpg",
      price: 1400,
      revenue: "3 Days",
      dailyEarnings: 2989,
      totalRevenue: 8967,
    },
  ]

  const getCurrentProducts = () => {
    switch (activeTab) {
      case "normal":
        return normalFundProducts
      case "welfare":
        return welfareFundProducts
      case "activity":
        return activityFundProducts
      default:
        return normalFundProducts
    }
  }

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      setLoadingOrders(true)
      const db = getFirestore(app)
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          userId: data.userId,
          productId: data.productId,
          productName: data.productName,
          amount: data.amount,
          purchaseDate: data.purchaseDate,
          revenueEnd: data.revenueEnd,
          status: data.status,
        } as Order
      })
      setUserOrders(orders)
      setLoadingOrders(false)
    }
    fetchOrders()
  }, [user])

  useEffect(() => {
    if (!user) return
    // Fetch user balance from Firestore
    const fetchBalance = async () => {
      const db = getFirestore(app)
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserBalance(typeof data.balance === 'number' ? data.balance : 0)
      } else {
        setUserBalance(0)
      }
    }
    fetchBalance()
  }, [user])

  const hasActiveOrder = (productId: string) => {
    const now = Timestamp.now().toDate()
    return userOrders.some((order: Order) => order.productId === productId && order.revenueEnd && new Date(order.revenueEnd) > now)
  }

  const handleBuyProduct = (product: Product) => {
    if (!user) {
      setNotification('Please log in to buy products.')
      return
    }
    if (hasActiveOrder(product.id)) {
      setNotification('Buy another plan, you have already purchased.')
      return
    }
    if (userBalance !== null && userBalance < product.price) {
      // Redirect to recharge page if not enough balance
      window.location.href = '/recharge'
      return
    }
    // If balance is enough or still loading, allow to buy (assume enough if not loaded)
    setSelectedProduct(product)
    setConfirmOpen(true)
  }

  const handleConfirmBuy = async () => {
    if (!selectedProduct || !user) return
    if (userBalance !== null && userBalance >= selectedProduct.price) {
      // Deduct balance and create order in Firestore
      const db = getFirestore(app)
      const userRef = doc(db, 'users', user.uid)
      const newBalance = userBalance - selectedProduct.price
      await updateDoc(userRef, { balance: newBalance })
      setUserBalance(newBalance)
      // Create order
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        amount: selectedProduct.price,
        purchaseDate: new Date().toISOString(),
        revenueEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * parseInt(selectedProduct.revenue.replace(/\D/g, ""))).toISOString(),
        status: 'active',
      })
      setConfirmOpen(false)
      setPurchaseMessage('Plan purchased successfully!')
      return
    }
    // If balance is insufficient, start Fastzix payment
    let userPhone = user.phoneNumber
    if (!userPhone) {
      userPhone = prompt('Enter your mobile number for payment:') || ''
    }
    if (!userPhone) {
      setNotification('Mobile number is required for payment.')
      return
    }
    await startFastzixPayment({ amount: selectedProduct.price, userId: user.uid, userPhone })
    setConfirmOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <h1 className="text-white text-2xl font-bold">Products</h1>
        <div className="bg-white/20 p-2 rounded-full">
          <ShoppingBag className="text-white" size={24} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-1">
          <div className="flex">
            <button
              onClick={() => setActiveTab("normal")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "normal" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500"
              }`}
            >
              Normal Fund
              {activeTab === "normal" && <span className="ml-1">▼</span>}
            </button>
            <button
              onClick={() => setActiveTab("welfare")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "welfare" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500"
              }`}
            >
              Welfare Fund
              {activeTab === "welfare" && <span className="ml-1">▼</span>}
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === "activity" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500"
              }`}
            >
              Activity Fund
              {activeTab === "activity" && <span className="ml-1">▼</span>}
            </button>
          </div>
        </Card>
      </div>

      {/* Products List */}
      <div className="mx-4 space-y-4 pb-24">
        {getCurrentProducts().map((product) => (
          <Card key={product.id} className="bg-white rounded-2xl overflow-hidden">
            {/* Product Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
              <h3 className="text-white font-semibold">{product.name}</h3>
              <Button
                onClick={() => handleBuyProduct(product)}
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium"
              >
                Buy
              </Button>
            </div>

            {/* Product Details */}
            <div className="p-4 flex items-center space-x-4">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Each Price</span>
                  <span className="text-blue-500 font-bold">Rs {product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Revenue</span>
                  <span className="text-blue-500 font-medium">{product.revenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Daily Earnings</span>
                  <span className="text-blue-500 font-bold">Rs {product.dailyEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Revenue</span>
                  <span className="text-blue-500 font-bold">Rs {product.totalRevenue}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/home" className="flex flex-col items-center py-2">
            <Home className="text-gray-400" size={24} />
            <span className="text-xs mt-1 text-gray-400">Home</span>
          </Link>

          <Link href="/products" className="flex flex-col items-center py-2">
            <Package className="text-blue-600" size={24} />
            <span className="text-xs mt-1 text-blue-600">Products</span>
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

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center">
              <img src="/images/logo.jpg" alt="Bajaj Logo" className="h-10 mb-2" />
              {selectedProduct?.name || "Product"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {selectedProduct ? null : "Confirm your purchase details."}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex w-full justify-between">
                <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">Price : ₹ {selectedProduct.price}</span>
                <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">Days: {selectedProduct.revenue.replace(/\D/g, "")}</span>
              </div>
              <div className="text-3xl font-bold mt-2 text-blue-700">₹ {selectedProduct.dailyEarnings}</div>
              <div className="text-sm text-gray-500">Daily Income</div>
              <div className="text-2xl font-bold text-blue-700">₹ {selectedProduct.totalRevenue}</div>
              <div className="text-sm text-gray-500 mb-2">Total Income</div>
            </div>
          )}
          <DialogFooter className="flex flex-row justify-between gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="secondary" className="w-1/2 bg-red-100 text-red-500 hover:bg-red-200">Maybe later</Button>
            </DialogClose>
            <Button onClick={handleConfirmBuy} className="w-1/2 bg-blue-500 text-white hover:bg-blue-600">Yes, Buy Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Purchase message alert */}
      {purchaseMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          {purchaseMessage}
          <button className="ml-2 text-green-700 font-bold" onClick={() => setPurchaseMessage("")}>×</button>
        </div>
      )}
      {/* Show notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded shadow z-50">
          {notification}
          <button className="ml-2 text-red-700 font-bold" onClick={() => setNotification("")}>×</button>
        </div>
      )}
    </div>
  )
}
