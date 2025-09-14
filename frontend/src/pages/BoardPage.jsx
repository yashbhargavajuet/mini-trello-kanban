import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const BoardPage = () => {
  const { boardId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-blue-600">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:bg-blue-700 p-2 rounded"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">Board {boardId}</h1>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Board View Coming Soon!</h2>
          <p className="text-gray-600 mb-4">
            This is where the Kanban board with drag-and-drop functionality will be implemented.
          </p>
          <p className="text-sm text-gray-500">
            Board ID: {boardId}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BoardPage