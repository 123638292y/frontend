"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login") // Rediriger vers login si pas de token
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return <p>Chargement...</p> // Empêcher le rendu si non authentifié
  }

  return (
    <div>
      <h1>Bienvenue sur la page Home</h1>
      <button
        onClick={() => {
          localStorage.removeItem("token")
          router.push("/login")
          window.location.href = "/login" // Forcer le reload
        }}
      >
        Logout
      </button>
    </div>
  )
}
