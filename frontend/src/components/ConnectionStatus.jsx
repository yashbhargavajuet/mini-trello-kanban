import { useState, useEffect } from 'react'
import axios from 'axios'

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking')
  const [backendInfo, setBackendInfo] = useState(null)

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkConnection = async () => {
    try {
      const response = await axios.get('/health')
      setBackendInfo(response.data)
      setStatus('connected')
    } catch (error) {
      setStatus('disconnected')
      setBackendInfo(null)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200'
      case 'disconnected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '✅ Connected to Backend'
      case 'disconnected': return '❌ Backend Disconnected'
      default: return '🔄 Checking Connection...'
    }
  }

  return (
    <div className={`fixed top-4 right-4 px-3 py-2 rounded-md border text-sm font-medium ${getStatusColor()} z-50`}>
      <div className="flex items-center space-x-2">
        <span>{getStatusText()}</span>
        {status === 'connected' && backendInfo && (
          <div className="text-xs">
            (Uptime: {Math.floor(backendInfo.uptime || 0)}s)
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionStatus