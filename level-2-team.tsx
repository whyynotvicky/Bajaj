"use client"

import { useState } from "react"
import { ArrowLeft, X, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface TeamMember {
  id: string
  name: string
  phone: string
  joinDate: string
  totalInvest: number
  commission: number
}

export default function Level2TeamPage() {
  // Sample data - in real app this would come from API
  const [teamStats] = useState({
    totalPeople: 0,
    totalInvest: 0,
  })

  const [teamMembers] = useState<TeamMember[]>([
    // Uncomment to show sample members
    // {
    //   id: '1',
    //   name: 'Jane Smith',
    //   phone: '+91 98765 43211',
    //   joinDate: '2025-01-20',
    //   totalInvest: 3000,
    //   commission: 300
    // }
  ])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-b-3xl pb-8">
        <div className="flex items-center p-4 pt-12">
          <Link href="/team" className="mr-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
              <ArrowLeft className="text-white" size={24} />
            </div>
          </Link>
          <h1 className="text-white text-2xl font-bold">Level 2 Team</h1>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-4 -mt-4 mb-6">
        <Card className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-red-500 text-3xl font-bold">{teamStats.totalPeople}</div>
              <div className="text-gray-600 text-sm mt-1">Total People</div>
            </div>
            <div className="text-center">
              <div className="text-red-500 text-3xl font-bold">₹ {teamStats.totalInvest}</div>
              <div className="text-gray-600 text-sm mt-1">Total Invest</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="px-4">
        {teamMembers.length === 0 ? (
          // Empty State
          <div className="flex items-center mt-8">
            <div className="bg-black rounded-full p-2 mr-3">
              <X className="text-white" size={16} />
            </div>
            <p className="text-gray-700 text-lg">No! You have 0 level 2 team members..</p>
          </div>
        ) : (
          // Team Members List
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-white rounded-2xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 rounded-full p-3">
                    <User className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{member.name}</h4>
                    <p className="text-gray-600 text-sm">{member.phone}</p>
                    <p className="text-gray-500 text-xs">Joined: {member.joinDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-bold">₹{member.totalInvest}</p>
                    <p className="text-green-600 text-sm">Commission: ₹{member.commission}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
