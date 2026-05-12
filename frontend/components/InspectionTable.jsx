import { useEffect, useState } from 'react'
import { getTableData, updateTableRow } from '../services/api'
import { motion } from 'framer-motion'
import { FileText, Loader2, AlertCircle, Check, Save } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'

function InspectionTable({ tableName, vesselId, vesselName }) {
    const { user } = useAuth()
    const [rows, setRows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [savingRowId, setSavingRowId] = useState(null)
    const [error, setError] = useState(null)
    const [editData, setEditData] = useState({})

    const isEditable = user?.role === 'USER' || user?.role === 'SUPERINTENDENT'

    useEffect(() => {
        async function loadData() {
            if (!vesselId) return;
            try {
                setIsLoading(true)
                const data = await getTableData(tableName, vesselId)
                setRows(data || [])
                
                // Initialize edit data
                const initialEditData = {}
                data?.forEach(row => {
                    initialEditData[row.id] = { ans: row.ans, comments: row.comments }
                })
                setEditData(initialEditData)
            } catch (err) {
                console.error(`Error loading table ${tableName}:`, err)
                setError('Failed to load data')
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [tableName, vesselId])

    const handleInputChange = (id, field, value) => {
        setEditData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }))
    }

    const handleSave = async (id) => {
        try {
            setSavingRowId(id)
            await updateTableRow(tableName, id, editData[id])
            
            // Update local rows to reflect saved state
            setRows(prev => prev.map(row => 
                row.id === id ? { ...row, ...editData[id] } : row
            ))
        } catch (err) {
            console.error('Failed to save row:', err)
            alert('Failed to save changes')
        } finally {
            setSavingRowId(null)
        }
    }

    const formatHeader = (str) => {
        return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{formatHeader(tableName)}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Active Vessel: <span className="text-accent">{vesselName || 'Loading...'}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditable && (
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full uppercase tracking-wider">
                            Edit Mode
                        </span>
                    )}
                    {rows.length > 0 && (
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full uppercase tracking-wider">
                            {rows.length} Items
                        </span>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm">Loading inspection data...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500 bg-red-500/5 rounded-xl border border-red-500/10">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl">
                    <p className="text-slate-500 text-sm">No data found for this inspection category.</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5">
                                <th className="pb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider w-16">S.No</th>
                                <th className="pb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Rule Ref</th>
                                <th className="pb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Requirements</th>
                                <th className="pb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center w-32">Ans</th>
                                <th className="pb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Comments</th>
                                <th className="pb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {rows.map((item, index) => (
                                <tr key={item.id || index} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 text-sm font-bold text-slate-900 dark:text-slate-200 pr-12 whitespace-nowrap">
                                        {item.s_no || index + 1}
                                    </td>
                                    <td className="py-4 text-[10px] font-mono text-slate-900 dark:text-slate-200 font-bold uppercase tracking-tight pr-12">
                                        {item.rule_ref || '-'}
                                    </td>
                                    <td className="py-4 text-sm leading-relaxed pr-8">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{item.requirements}</div>
                                    </td>
                                    <td className="py-4">
                                        {isEditable ? (
                                            <select 
                                                value={editData[item.id]?.ans || ''}
                                                onChange={(e) => handleInputChange(item.id, 'ans', e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 ring-accent appearance-none cursor-pointer"
                                            >
                                                <option value="">N/A</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        ) : (
                                            <div className="text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    item.ans?.toLowerCase() === 'yes' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    item.ans?.toLowerCase() === 'no' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {item.ans || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4">
                                        {isEditable ? (
                                            <input 
                                                type="text"
                                                value={editData[item.id]?.comments || ''}
                                                onChange={(e) => handleInputChange(item.id, 'comments', e.target.value)}
                                                placeholder="Add comment..."
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 ring-accent"
                                            />
                                        ) : (
                                            <span className="text-sm text-slate-500">{item.comments || '-'}</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-right">
                                        {isEditable ? (
                                            <button 
                                                onClick={() => handleSave(item.id)}
                                                disabled={savingRowId === item.id}
                                                className={`p-2 rounded-lg transition-all ${
                                                    savingRowId === item.id 
                                                        ? 'bg-slate-100 text-slate-400' 
                                                        : 'bg-accent/10 text-accent hover:bg-accent hover:text-white shadow-sm'
                                                }`}
                                            >
                                                {savingRowId === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                {item.image ? (
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 overflow-hidden ring-1 ring-slate-200 dark:ring-white/10">
                                                        <img src={item.image} alt="Ref" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <Check className="w-4 h-4 text-slate-300" />
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    )
}

export default InspectionTable
