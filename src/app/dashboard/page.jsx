"use client"

import { useEffect, useState } from "react"
import { BarChart } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import styles from "../dashboard/styles/dashboard.module.css"

interface AnalyticsData {
  totalViews: number
  viewsTrend: number[]
}

interface StatisticsData {
  date: string
  views: number
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    viewsTrend: [],
  })
  const [statistics, setStatistics] = useState<StatisticsData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, statisticsRes] = await Promise.all([fetch("/api/analytics"), fetch("/api/statistics")])

        if (!analyticsRes.ok || !statisticsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const analyticsData = await analyticsRes.json()
        const statisticsData = await statisticsRes.json()

        setAnalytics(analyticsData)
        setStatistics(statisticsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard data...</div>
  }

  return (
    <div className={styles.dashboard}>
      <h1>Overview</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Total Views</h3>
            <BarChart className={styles.cardIcon} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.mainStat}>{analytics.totalViews.toLocaleString()}</div>
            <div className={styles.trend}>
              <div className={styles.miniChart}>
                {analytics.viewsTrend.map((value, i) => (
                  <div key={i} className={styles.miniBar} style={{ height: `${value}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statistics}>
        <h2>Statistics</h2>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={statistics}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

