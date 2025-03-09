import type React from "react"
import Navbar from "./components/navbar/navbar"
import Sidebar from "./components/sidebar/sidebar"
import styles from "./lauout.module.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className={styles.layout}>
          <Sidebar />
          <div className={styles.mainContainer}>
          <Navbar />
            <main className={styles.mainContent}>{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

