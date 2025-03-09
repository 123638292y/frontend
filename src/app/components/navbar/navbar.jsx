"use client"

import { Bell, Search, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from '../navbar/style/navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Vérifier si l'utilisateur est connecté au montage du composant
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')

    if (token && storedUsername) {
      setIsLoggedIn(true)
      setUsername(storedUsername)
    }
  }, [])

  
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch("http://localhost:5000/api/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      localStorage.removeItem("token")
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

 
  return (
    <nav className={styles.navbar}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input 
          type="text" 
          placeholder="Search transactions, invoices or help" 
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.navRight}>
        <button className={styles.navButton}>
          <Bell size={20} />
        </button>
        <button className={styles.navButton}>
          <Settings size={20} />
        </button>
        {isLoggedIn && (
          <>
            <div className={styles.profile}>
              <span className={styles.profileName}>{username}</span>
              <img 
                src="/placeholder.svg?height=32&width=32" 
                alt="Profile" 
                className={styles.profileImage}
              />
            </div>
            <button className={styles.navButton} onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}