"use client"

import { useState } from "react"
import { Wifi, ChevronRight, Home, Package, Star, User, MessageCircle, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface TeamStats {
  totalPeople: number
  totalInvest: number
  level1: {
    people: number
    recharge: number
    commission: number
    percentage: number
  }
  level2: {
    people: number
    recharge: number
    commission: number
    percentage: number
  }
  level3: {
    people: number
    recharge: number
    commission: number
    percentage: number
  }
}

export default function TeamPage() {
  const [activeNavTab, setActiveNavTab] = useState("team")

  // Sample team data - in real app this would come from API
  const [teamStats] = useState<TeamStats>({
    totalPeople: 0,
    totalInvest: 0,
    level1: {
      people: 0,
      recharge: 0,
      commission: 0,
      percentage: 10,
    },
    level2: {
      people: 0,
      recharge: 0,
      commission: 0,
      percentage: 0,
    },
    level3: {
      people: 0,
      recharge: 0,
      commission: 0,
      percentage: 0,
    },
  })

  const handleViewLevel = (level: number) => {
    window.location.href = `/team/level-${level}`
  }

  const handleCustomerCare = () => {
    alert("Connecting to customer support for more tasks...")
  }

  const handleMessage = () => {
    alert("Opening message center...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="text-center p-4 pt-12">
        <h1 className="text-white text-2xl font-bold">Team</h1>
      </div>

      {/* Top Stats */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-blue-500 text-3xl font-bold">{teamStats.totalPeople}</div>
              <div className="text-gray-500 text-sm mt-1">Total People</div>
            </div>
            <div className="text-center">
              <div className="text-blue-500 text-3xl font-bold">₹ {teamStats.totalInvest}</div>
              <div className="text-gray-500 text-sm mt-1">Total Invest</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Level Cards */}
      <div className="mx-4 mb-6 grid grid-cols-3 gap-3">
        {/* Level 1 */}
        <Card className="bg-blue-500 rounded-2xl p-4 text-white">
          <div className="flex items-center mb-2">
            <Wifi size={16} className="mr-1" />
            <span className="text-sm font-medium">Level 1</span>
          </div>
          <div className="text-2xl font-bold mb-1">{teamStats.level1.percentage}%</div>
          <div className="text-xs mb-3 opacity-90">Member & Bonus info</div>
          <Button
            onClick={() => handleViewLevel(1)}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-1 h-8 rounded-lg"
          >
            VIEW ALL <ChevronRight size={12} className="ml-1" />
          </Button>
        </Card>

        {/* Level 2 */}
        <Card className="bg-blue-500 rounded-2xl p-4 text-white">
          <div className="flex items-center mb-2">
            <Wifi size={16} className="mr-1" />
            <span className="text-sm font-medium">Level 2</span>
          </div>
          <div className="text-2xl font-bold mb-1">{teamStats.level2.percentage}%</div>
          <div className="text-xs mb-3 opacity-90">Member & Bonus info</div>
          <Button
            onClick={() => handleViewLevel(2)}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-1 h-8 rounded-lg"
          >
            VIEW ALL <ChevronRight size={12} className="ml-1" />
          </Button>
        </Card>

        {/* Level 3 */}
        <Card className="bg-blue-500 rounded-2xl p-4 text-white">
          <div className="flex items-center mb-2">
            <Wifi size={16} className="mr-1" />
            <span className="text-sm font-medium">Level 3</span>
          </div>
          <div className="text-2xl font-bold mb-1">{teamStats.level3.percentage}%</div>
          <div className="text-xs mb-3 opacity-90">Member & Bonus info</div>
          <Button
            onClick={() => handleViewLevel(3)}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-1 h-8 rounded-lg"
          >
            VIEW ALL <ChevronRight size={12} className="ml-1" />
          </Button>
        </Card>
      </div>

      {/* Team Information */}
      <div className="mx-4 mb-6">
        <Card className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-blue-500 text-white text-center py-3">
            <h3 className="font-semibold">Team Information</h3>
          </div>
          <div className="p-4">
            {/* Level 1 Row */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">{teamStats.level1.people}</div>
                <div className="text-xs text-gray-500">Lv1 People</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">₹{teamStats.level1.recharge}</div>
                <div className="text-xs text-gray-500">Lv1 Recharge</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">₹{teamStats.level1.commission}</div>
                <div className="text-xs text-gray-500">Lv1 Commission</div>
              </div>
            </div>

            {/* Level 2 Row */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">{teamStats.level2.people}</div>
                <div className="text-xs text-gray-500">Lv2 People</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">₹{teamStats.level2.recharge}</div>
                <div className="text-xs text-gray-500">Lv2 Recharge</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">₹{teamStats.level2.commission}</div>
                <div className="text-xs text-gray-500">Lv2 Commission</div>
              </div>
            </div>

            {/* Level 3 Row */}
            <div className="flex justify-between items-center py-3">
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">{teamStats.level3.people}</div>
                <div className="text-xs text-gray-500">Lv3 People</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">₹{teamStats.level3.recharge}</div>
                <div className="text-xs text-gray-500">Lv3 Recharge</div>
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-gray-800">₹{teamStats.level3.commission}</div>
                <div className="text-xs text-gray-500">Lv3 Commission</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Explain Section */}
      <div className="mx-4 mb-20">
        <Card className="bg-white rounded-2xl p-4">
          <div className="border-l-4 border-yellow-400 pl-3 mb-4">
            <h3 className="font-semibold text-gray-800">Explain</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold">1.</span> Create your own team and get up to 10% referral reward which you
              can withdraw directly
            </p>
            <p>
              <span className="font-semibold">2.</span> Invite your friends and ask them to invest. If your friend
              recharges and purchases the plan, only then will you get commission.
            </p>
            <p>
              <span className="font-semibold">3.</span> If you want extra reward then complete the mission (view
              mission) you will get reward on every investment
            </p>
            <p>
              <span className="font-semibold">4.</span> If you want more extra reward then message Customer Care you
              will get more task
            </p>
          </div>
        </Card>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-4 bottom-24 space-y-3">
        <button onClick={handleMessage} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <MessageCircle className="text-white" size={20} />
        </button>
        <button onClick={handleCustomerCare} className="bg-blue-500 rounded-full p-3 shadow-lg">
          <Headphones className="text-white" size={20} />
        </button>
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
            <Star className="text-blue-600" size={24} />
            <span className="text-xs mt-1 text-blue-600">Team</span>
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
