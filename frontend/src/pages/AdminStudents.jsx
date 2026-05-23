import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const typeLabels = { R: '實用型', I: '研究型', A: '藝術型', S: '社會型', E: '企業型', C: '事務型' }

export default function AdminStudents() {
  const { token } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = () => {
    fetch('/api/students', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setStudents(data); setLoading(false) })
      .catch(err => { setError('載入失敗'); setLoading(false) })
  }

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這位學生的資料嗎？')) return
    
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('刪除失敗')
      fetchStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/export/students', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'students.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('匯出失敗: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">學生資料</h1>
            </div>
          </div>
          <Link to="/admin" className="text-gray-600 hover:text-blue-600">← 返回</Link>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <Link to="/admin" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600">
            總覽
          </Link>
          <Link to="/admin/questions" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600">
            題目管理
          </Link>
          <Link to="/admin/students" className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium">
            學生資料
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">學生列表 ({students.length} 人)</h2>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            匯出 CSV
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-500">載入中...</p>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            尚無學生資料
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">學校/班級</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">日期</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">分數</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">推薦學群</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.school || '-'} {s.grade && `/ ${s.grade}`}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('zh-TW') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {s.scores ? (
                        <div className="flex gap-1 text-xs">
                          {['R', 'I', 'A', 'S', 'E', 'C'].map(t => (
                            <span key={t} className={`px-2 py-1 rounded ${s.scores[t] >= 4 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {t}:{s.scores[t]?.toFixed(1)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.recommended_field || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}