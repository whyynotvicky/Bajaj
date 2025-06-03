"use client"

import { useState } from "react"
import { ArrowLeft, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function InvitePage() {
  const [inviteLink] = useState("https://bajaj-fd278.web.app/")
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(type === "code" ? "Referral code copied!" : "Invite link copied!")

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback(null)
      }, 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      setCopyFeedback(type === "code" ? "Referral code copied!" : "Invite link copied!")
      setTimeout(() => {
        setCopyFeedback(null)
      }, 2000)
    }
  }

  const handleShare = async () => {
    const shareText = `🎉 Join Bajaj and start earning rewards!\n\nOr click this link: ${inviteLink}\n\n✅ Earn 10% rewards on every investment\n✅ Trusted platform with daily earnings\n✅ Easy withdrawal process\n\nJoin now and start your earning journey! 💰`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Bajaj - Earn Rewards!",
          text: shareText,
          url: inviteLink,
        })
      } catch (err) {
        // User cancelled sharing or error occurred
        console.log("Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard(shareText, "link")
      alert("Invitation message copied to clipboard! You can now paste it anywhere to share.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center p-4 pt-12">
        <Link href="/home" className="mr-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
            <ArrowLeft className="text-white" size={24} />
          </div>
        </Link>
        <h1 className="text-white text-2xl font-bold">Invite</h1>
      </div>

      {/* Main Content */}
      <div className="mx-4 mt-8">
        <Card className="bg-white rounded-3xl p-6">
          {/* Title */}
          <h2 className="text-gray-800 text-3xl font-bold mb-6">Invite Your Friends!</h2>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Share your unique invite link below to invite your friends and earn 10% rewards!
          </p>

          {/* Invite Link Section */}
          <div className="mb-8">
            <h3 className="text-gray-700 text-lg font-medium mb-4">Your Invite Link:</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-xl p-4">
                <span className="text-gray-700 text-sm break-all">{inviteLink}</span>
              </div>
              <Button
                onClick={() => copyToClipboard(inviteLink, "link")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-medium"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Copy Feedback */}
          {copyFeedback && (
            <div className="mb-6 p-3 bg-green-100 border border-green-300 rounded-xl">
              <p className="text-green-700 text-center font-medium">{copyFeedback}</p>
            </div>
          )}

          {/* Share Button */}
          <Button
            onClick={handleShare}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl py-4 font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Share size={20} />
            Share
          </Button>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <h4 className="text-blue-800 font-semibold mb-2">How it works:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Share your invite link with friends</li>
              <li>• When they register and invest, you earn 10% commission</li>
              <li>• Your earnings are credited instantly</li>
              <li>• No limit on the number of referrals</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
