'use client'

import { BikeProvider } from "./(fleet-management)/context/BikeContext"
import { Toaster } from "react-hot-toast"
import Sidebar from "./(fleet-management)/components/Sidebar"
import ClientProviders from "../components/ClientProviders"
import { SidebarProvider, useSidebar } from "../context/SidebarContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

function LayoutContent({ children }) {
  const { status } = useSession()
  const router = useRouter()
  const { collapsed } = useSidebar()   // 👈 get collapsed state

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === "unauthenticated") return null

  return (
    <div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <Sidebar />
      <main className="min-h-screen">{children}</main>
    </div>
  )
}

export default function AdminLayout({ children }) {
  return (
    <ClientProviders>
      <BikeProvider>
        <SidebarProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "bg-gray-800 text-gray-100 border border-gray-700",
              success: {
                className: "bg-green-900 text-green-100 border-green-700",
                iconTheme: { primary: "#10B981", secondary: "#ECFDF5" },
              },
              error: {
                className: "bg-rose-900 text-rose-100 border-rose-700",
                iconTheme: { primary: "#F43F5E", secondary: "#FDF2F2" },
              },
            }}
          />
        </SidebarProvider>
      </BikeProvider>
    </ClientProviders>
  )
}
