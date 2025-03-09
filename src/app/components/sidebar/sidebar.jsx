"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Home,
  LayoutDashboard,
  Inbox,
  ShoppingBag,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  HelpCircle,
  ChevronLeft,
  UserPlus,
  Shield
} from "lucide-react"
import styles from "./sidebar.module.css"

export default function Sidebar() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState('')

  // Vérifier si l'utilisateur est connecté au montage du composant
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')

    if (token && storedRole) {
      setIsLoggedIn(true)
      setRole(storedRole)
    }
  }, [])

  return (
    <aside className={`${styles.sidebar} ${isMinimized ? styles.minimized : ""}`}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.logo}>DJERBAEXPLORE</h1>
        <button className={styles.minimizeButton} onClick={() => setIsMinimized(!isMinimized)}>
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <Link href="/home" className={styles.navItem}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link href="/dashboard" className={styles.navItem}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/inbox" className={styles.navItem}>
          <Inbox size={20} />
          <span>Inbox</span>
        </Link>
        <Link href="/products" className={styles.navItem}>
          <ShoppingBag size={20} />
          <span>Products</span>
        </Link>
        <Link href="/invoices" className={styles.navItem}>
          <FileText size={20} />
          <span>Invoices</span>
        </Link>
        <Link href="/customers" className={styles.navItem}>
          <Users size={20} />
          <span>Customers</span>
        </Link>
        <Link href="/chat" className={styles.navItem}>
          <MessageSquare size={20} />
          <span>Chat Room</span>
        </Link>
        <Link href="/calendar" className={styles.navItem}>
          <Calendar size={20} />
          <span>Calendar</span>
        </Link>
        <Link href="/help" className={styles.navItem}>
          <HelpCircle size={20} />
          <span>Help Center</span>
        </Link>

        {/* Afficher le lien "Login" uniquement si l'utilisateur n'est pas connecté */}
        {!isLoggedIn && (
          <Link href="/login" className={styles.navItem}>
            <UserPlus size={20} />
            <span>Login</span>
          </Link>
        )}

        {/* Afficher le lien "Admin Control" uniquement si l'utilisateur est un super-admin */}
        {role === "super-admin" && (
          <Link href="/admin-control" className={styles.navItem}>
            <Shield size={20} />
            <span>Admin Control</span>
          </Link>
        )}
      </nav>
    </aside>
  )
}