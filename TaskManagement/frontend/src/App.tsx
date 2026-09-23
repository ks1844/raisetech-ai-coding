import { useState } from 'react'
import './App.css'
import { BoardListPage } from './pages/BoardListPage'
import { BoardDetailPage } from './pages/BoardDetailPage'

type Page = 'list' | 'detail'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('list')
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null)

  const handleSelectBoard = (boardId: number) => {
    setSelectedBoardId(boardId)
    setCurrentPage('detail')
  }

  const handleBack = () => {
    setCurrentPage('list')
    setSelectedBoardId(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'list' ? (
        <BoardListPage onSelectBoard={handleSelectBoard} />
      ) : (
        selectedBoardId && <BoardDetailPage boardId={selectedBoardId} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
