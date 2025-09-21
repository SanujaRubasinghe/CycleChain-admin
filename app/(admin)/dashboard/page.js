"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const cards = [
  { href: "/store", title: "Manage Store", desc: "Add, edit, or delete items" },
  { href: "/users", title: "Manage Users", desc: "View and remove user profiles" },
  { href: "/profile", title: "Admin Profile", desc: "Edit your account or logout" },
  { href: "/analytics", title: "Analytics", desc: "User stats, rides & sales" },
  { href: "/reports", title: "Reports", desc: "Generate and export reports" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-12">
        <motion.h1
          className="text-4xl font-extrabold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={card.href}
                className="block rounded-2xl p-6 backdrop-blur-lg bg-white/5 border border-white/10 shadow-lg 
                           hover:shadow-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold mb-2 text-purple-300">{card.title}</h2>
                <p className="text-gray-400">{card.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
