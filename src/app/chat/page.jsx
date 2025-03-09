"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import styles from "./chat.module.css"
import axios from "axios"

export default function ChatPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <main className={styles.main}>
      {isLoggedIn ? (
        <div className={styles.container}>
          <h1 className={styles.title}>Chat Room</h1>
          <ChatRoom />
        </div>
      ) : (
        <div className={styles.loading}>Loading...</div>
      )}
    </main>
  )
}

function ChatRoom() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)
  const [error, setError] = useState(null)

  // const [users, setUsers] = useState([]);
  console.log(users, "userss")

  // Keeping the existing axios call
  useEffect(() => {
    // Fetch data when the component mounts
    axios
      .get("http://localhost:5000/api/users/")
      .then((response) => {
        setUsers(response.data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError("Failed to fetch users")
        setIsLoading(false)
      })
  }, [])

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Fetch current user info
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")

        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setCurrentUser(response.data)
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()

    // Update last active status every minute
    const updateActiveStatus = async () => {
      try {
        const token = localStorage.getItem("token")

        await axios.put(
          "http://localhost:5000/api/users/active",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      } catch (error) {
        console.error("Error updating active status:", error)
      }
    }

    const activeInterval = setInterval(updateActiveStatus, 60000)

    return () => clearInterval(activeInterval)
  }, [])

  useEffect(() => {
    // Fetch all online users
    const fetchUsers = async () => {
      if (!currentUser) return

      try {
        const token = localStorage.getItem("token")

        const response = await axios.get("http://localhost:5000/api/users/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    // Fetch unread message counts
    const fetchUnreadCounts = async () => {
      if (!currentUser) return

      try {
        const token = localStorage.getItem("token")

        const promises = users.map(async (user) => {
          const response = await axios.get(`http://localhost:5000/api/messages/${user._id}/unread`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          return { userId: user._id, count: response.data.count }
        })

        const counts = await Promise.all(promises)
        const countsObj = counts.reduce((acc, curr) => {
          acc[curr.userId] = curr.count
          return acc
        }, {})

        setUnreadCounts(countsObj)
      } catch (error) {
        console.error("Error fetching unread counts:", error)
      }
    }

    if (currentUser) {
      fetchUsers()

      // Set up interval to refresh users list and unread counts
      const usersInterval = setInterval(fetchUsers, 10000)
      const unreadInterval = setInterval(fetchUnreadCounts, 15000)

      return () => {
        clearInterval(usersInterval)
        clearInterval(unreadInterval)
      }
    }
  }, [currentUser, users.length])

  useEffect(() => {
    // Fetch messages when a user is selected
    const fetchMessages = async () => {
      if (!selectedUser) return

      try {
        const token = localStorage.getItem("token")

        const response = await axios.get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setMessages(response.data)

        // Update unread counts after fetching messages
        const newUnreadCounts = { ...unreadCounts }
        newUnreadCounts[selectedUser._id] = 0
        setUnreadCounts(newUnreadCounts)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    if (selectedUser) {
      fetchMessages()

      // Set up interval to refresh messages
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedUser, unreadCounts])

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    // Focus the input when a user is selected
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedUser) return

    try {
      const token = localStorage.getItem("token")

      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          recipient: selectedUser._id,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setMessages([...messages, response.data])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      setIsTyping(false)
    }

    // Focus the input after sending
    inputRef.current?.focus()
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      // Here you would notify the server that the user is typing
      // For example: socket.emit('typing', { recipientId: selectedUser._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 3000)
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")

      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      localStorage.removeItem("token")
      window.location.href = "/login"
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      if (days === 1) {
        return "yesterday"
      } else if (days < 7) {
        return `${days} days ago`
      } else {
        return date.toLocaleDateString()
      }
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading chat room...</div>
  }

  return (
    <div className={styles.chatRoom}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          {currentUser && (
            <>
              <div className={styles.currentUser}>
                <div className={styles.avatar}>{currentUser.username.charAt(0).toUpperCase()}</div>
                <span className={styles.username}>{currentUser.username}</span>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
        <div className={styles.usersList}>
          <h2>All Users</h2>
          <div className={styles.statusLegend}></div>
          {users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li
                  key={user._id}
                  className={`${styles.userItem} ${selectedUser?._id === user._id ? styles.active : ""}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className={styles.userItemContent}>
                    <div className={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
                    <div className={styles.userDetails}>
                      <span className={styles.userItemName}>{user.username}</span>
                      <span className={styles.lastActive}>
                        {user.isOnline ? formatTimeAgo(user.lastActive) : `Last seen ${formatTimeAgo(user.lastActive)}`}
                      </span>
                    </div>
                  </div>
                  <div className={styles.userItemRight}>
                    {unreadCounts[user._id] > 0 && <span className={styles.unreadBadge}>{unreadCounts[user._id]}</span>}
                    <span
                      className={`${styles.onlineIndicator} ${!user.isOnline ? styles.offlineIndicator : ""}`}
                    ></span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noUsers}>No users available</p>
          )}
        </div>
      </div>

      <div className={styles.chatContainer}>
        {selectedUser ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderUser}>
                <div className={styles.avatar}>{selectedUser.username.charAt(0).toUpperCase()}</div>
                <div className={styles.userDetails}>
                  <h2>{selectedUser.username}</h2>
                  <span className={styles.lastActive}>
                    {selectedUser.isOnline
                      ? `Online • ${formatTimeAgo(selectedUser.lastActive)}`
                      : `Offline • Last seen ${formatTimeAgo(selectedUser.lastActive)}`}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.messagesContainer}>
              {messages.length > 0 ? (
                <>
                  {messages.reduce((acc, message, index) => {
                    const messageDate = formatDate(message.createdAt)

                    // Check if we need to add a date separator
                    if (index === 0 || formatDate(messages[index - 1].createdAt) !== messageDate) {
                      acc.push(
                        <div key={`date-${message._id}`} className={styles.dateSeparator}>
                          {messageDate}
                        </div>,
                      )
                    }

                    // Add the message
                    acc.push(
                      <div
                        key={message._id}
                        className={`${styles.message} ${message.sender === currentUser._id ? styles.sent : styles.received}`}
                      >
                        <div className={styles.messageContent}>{message.content}</div>
                        <div className={styles.messageTime}>
                          {formatTime(message.createdAt)}
                          {message.sender === currentUser._id && (
                            <span className={styles.readStatus}>{message.read ? " ✓✓" : " ✓"}</span>
                          )}
                        </div>
                      </div>,
                    )

                    return acc
                  }, [])}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <p className={styles.noMessages}>No messages yet. Start the conversation!</p>
              )}
            </div>
            <form className={styles.messageForm} onSubmit={handleSendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                placeholder="Type a message..."
                className={styles.messageInput}
              />
              <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className={styles.selectUserPrompt}>
            <div className={styles.emptyStateIcon}>💬</div>
            <h3>Welcome to the Chat Room</h3>
            <p>Select a user from the list to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

