"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Transaction {
  user: string;
  timestamp: string;
  amount: string;
}

// Sample data - replace with actual data fetching later
const transactions: Transaction[] = [
  { user: "User 9080 **** 94", timestamp: "2025-05-17 15:11", amount: "Withdraw 4400₹ successfully" },
  { user: "User 2837 **** 64", timestamp: "2025-05-10 15:11", amount: "Withdraw 9753₹ successfully" },
  { user: "User 7828 **** 96", timestamp: "2025-05-13 15:11", amount: "Withdraw 4579₹ successfully" },
  { user: "User 8291 **** 38", timestamp: "2025-05-XX 15:XX", amount: "Withdraw 5963₹ successfully" },
  { user: "User 1234 **** 56", timestamp: "2025-05-23 10:00", amount: "Withdraw 1234₹ successfully" },
  { user: "User 5678 **** 90", timestamp: "2025-05-23 11:00", amount: "Withdraw 5678₹ successfully" },
  { user: "User 1122 **** 33", timestamp: "2025-05-23 12:00", amount: "Withdraw 1122₹ successfully" },
  { user: "User 4455 **** 66", timestamp: "2025-05-23 13:00", amount: "Withdraw 4455₹ successfully" },
  { user: "User 7788 **** 99", timestamp: "2025-05-23 14:00", amount: "Withdraw 7788₹ successfully" },
  { user: "User 9900 **** 11", timestamp: "2025-05-23 15:00", amount: "Withdraw 9900₹ successfully" },
];

const TransactionTicker: React.FC = () => {
  // Duplicate transactions for seamless looping
  const loopedTransactions = [...transactions, ...transactions];

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-md p-4 h-64">
      {/* Added a fixed height (h-64) and overflow-hidden */}
      <style jsx>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); } /* Scrolls up by half the height to loop */
        }
        .animate-scroll {
          animation: scroll-up 20s linear infinite; /* Adjust time based on number of items */
        }
      `}</style>
      <div className="animate-scroll">
        {loopedTransactions.map((transaction, index) => (
          <div key={index} className="border-b pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
            {/* Added mb-3 for spacing between items */}
            <p className="text-sm font-semibold text-gray-800">{transaction.user}</p>
            <p className="text-xs text-gray-500">{transaction.timestamp}</p>
            <p className="text-sm text-green-600">{transaction.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTicker; 