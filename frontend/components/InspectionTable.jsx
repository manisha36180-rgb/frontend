'use client';

import { useEffect, useState } from 'react'
import { getTableData, updateTableRow } from '../services/api'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Loader2, AlertCircle, Check, Save, Search, Lock, Plus, ChevronLeft, ChevronRight, X, Camera, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { cn } from '@/lib/utils'

function InspectionTable({ tableName, vesselId, vesselName }) {
    const { user } = useAuth()
    const [rows, setRows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [savingRowId, setSavingRowId] = useState(null)
    const [error, setError] = useState(null)
    const [editData, setEditData] = useState({})
    const [isAdding, setIsAdding] = useState(false)
    const [newRow, setNewRow] = useState({ s_no: '', requirements: '', rule_ref: '', ans: 'EMPTY', comments: '', image: '' })
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [selectedRowForImage, setSelectedRowForImage] = useState(null)
    const [tempImageUrl, setTempImageUrl] = useState('')
    const [isSavingNew, setIsSavingNew] = useState(false)
    const [isSavingAll, setIsSavingAll] = useState(false)

    const isEditable = ['ADMIN', 'SUPERINTENDENT', 'USER'].includes(user?.role)

    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true)
                setError(null)
                const data = await getTableData(tableName, vesselId)
                setRows(data || [])
            } catch (err) {
                console.error(`Error loading table ${tableName}:`, err)
                setError(`Failed to load ${tableName} data.`)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [tableName, vesselId])

    const handleEditChange = (id, field, value) => {
        setEditData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }))
    }

    const handleSaveAll = async () => {
        const changedIds = Object.keys(editData)
        if (changedIds.length === 0) return

        try {
            setIsSavingAll(true)
            await Promise.all(changedIds.map(id => updateTableRow(tableName, id, editData[id])))
            
            setRows(prev => prev.map(row => 
                editData[row.id] ? { ...row, ...editData[row.id] } : row
            ))
            
            setEditData({})
            alert('All changes saved successfully!')
        } catch (err) {
            console.error('Failed to save all changes:', err)
            alert('Failed to save some changes.')
        } finally {
            setIsSavingAll(false)
        }
    }

    const handleSave = async (id) => {
        const updates = editData[id]
        if (!updates) return

        try {
            setSavingRowId(id)
            await updateTableRow(tableName, id, updates)
            
            setRows(prev => prev.map(row => 
                row.id === id ? { ...row, ...updates } : row
            ))
            
            const newEditData = { ...editData }
            delete newEditData[id]
            setEditData(newEditData)
            
            alert('Record updated successfully!')
        } catch (err) {
            console.error('Failed to update record:', err)
            alert('Failed to save changes.')
        } finally {
            setSavingRowId(null)
        }
    }

    const handleAddRow = async (e) => {
        e.preventDefault()
        try {
            setIsSavingNew(true)
            const { data, error } = await supabase
                .from(tableName)
                .insert([{ ...newRow, vessel_id: vesselId }])
                .select()

            if (error) throw error
            
            setRows(prev => [...prev, data[0]])
            setIsAdding(false)
            setNewRow({ s_no: '', requirements: '', rule_ref: '', ans: 'EMPTY', comments: '' })
            alert('New record added successfully!')
        } catch (err) {
            console.error('Failed to add record:', err)
            alert(`Error: ${err.message}`)
        } finally {
            setIsSavingNew(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Technical Registry...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 rounded-xl border border-red-500/10">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden shadow-2xl border border-border relative">
            {/* PERMANENT ACTION BAR */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/50">
                        Technical Registry: <span className="text-foreground dark:text-white">{tableName.split('_').join(' ')}</span>
                    </span>
                </div>
                <button 
                    onClick={handleSaveAll}
                    disabled={isSavingAll || Object.keys(editData).length === 0}
                    className={cn(
                        "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                        Object.keys(editData).length > 0 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" 
                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 cursor-not-allowed border border-slate-200 dark:border-white/10"
                    )}
                >
                    {isSavingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                </button>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="border-b-2 border-slate-900 dark:border-white/20 bg-secondary">
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest w-16 border-r border-border">id</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest w-24 border-r border-border">s_no</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest min-w-[300px] border-r border-border">rule_ref</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest min-w-[400px] border-r border-border">requirements</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest w-24 border-r border-border">ans</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest w-40 border-r border-border">comments</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase text-foreground tracking-widest w-24 border-r border-border text-center">Image</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                                    No records found in this module.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className="group hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-3 text-[11px] font-mono font-bold text-foreground border-r border-border text-center">{row.id}</td>
                                    <td className="px-4 py-3 text-[11px] font-bold text-foreground border-r border-border">{row.s_no}</td>
                                    <td className="px-4 py-3 text-[11px] font-bold border-r border-border whitespace-normal leading-relaxed min-w-[300px] group/ref">
                                        {isEditable ? (
                                            <div className="relative flex items-start gap-2">
                                                <textarea
                                                    value={editData[row.id]?.rule_ref !== undefined ? editData[row.id].rule_ref : (row.rule_ref || '')}
                                                    placeholder="-"
                                                    rows={2}
                                                    onChange={(e) => handleEditChange(row.id, 'rule_ref', e.target.value)}
                                                    className={`w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-slate-500 dark:placeholder:text-white/50 resize-none transition-colors ${(editData[row.id]?.rule_ref !== undefined ? editData[row.id].rule_ref : row.rule_ref) ? 'text-foreground dark:text-white' : 'text-slate-600 dark:text-white/60'}`}
                                                />
                                                {!(editData[row.id]?.rule_ref || row.rule_ref) && (
                                                    <Search className="w-3 h-3 text-slate-500 group-hover/ref:text-emerald-500 transition-colors mt-0.5" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`whitespace-normal ${(row.rule_ref) ? 'text-slate-900 dark:text-white' : 'text-slate-600'}`}>
                                                {row.rule_ref || '-'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-[11px] font-medium border-r border-border whitespace-normal leading-relaxed min-w-[400px] group/req">
                                        {isEditable ? (
                                            <div className="relative flex items-start gap-2">
                                                <textarea
                                                    value={editData[row.id]?.requirements !== undefined ? editData[row.id].requirements : (row.requirements || '')}
                                                    rows={2}
                                                    onChange={(e) => handleEditChange(row.id, 'requirements', e.target.value)}
                                                    className={`w-full bg-transparent text-[11px] font-bold outline-none uppercase resize-none transition-colors ${(editData[row.id]?.requirements !== undefined ? editData[row.id].requirements : row.requirements) ? 'text-foreground' : 'text-slate-400'}`}
                                                />
                                                {!(editData[row.id]?.requirements || row.requirements) && (
                                                    <Search className="w-3 h-3 text-slate-300 group-hover/req:text-emerald-500 transition-colors mt-0.5" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-slate-900 dark:text-white uppercase">
                                                {row.requirements}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 border-r border-border text-foreground">
                                        {isEditable ? (
                                            <select
                                                value={editData[row.id]?.ans || row.ans || 'EMPTY'}
                                                onChange={(e) => handleEditChange(row.id, 'ans', e.target.value)}
                                                className={`w-full bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer hover:text-emerald-500 transition-colors ${(editData[row.id]?.ans || row.ans || 'EMPTY') === 'EMPTY' ? 'text-slate-600 dark:text-white/60' : 'text-foreground dark:text-white'}`}
                                            >
                                                <option value="EMPTY">EMPTY</option>
                                                <option value="Yes" className="text-slate-900 font-black">Yes</option>
                                                <option value="No" className="text-slate-900 font-black">No</option>
                                                <option value="N/A" className="text-slate-900 font-black">N/A</option>
                                            </select>
                                        ) : (
                                            <span className={`text-[11px] font-black uppercase ${(row.ans || 'EMPTY') === 'EMPTY' ? 'text-slate-600 dark:text-white/60' : 'text-foreground dark:text-white'}`}>
                                                {row.ans || 'EMPTY'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 border-r border-border text-foreground">
                                        {isEditable ? (
                                            <input
                                                type="text"
                                                value={editData[row.id]?.comments || row.comments || ''}
                                                placeholder="EMPTY"
                                                onChange={(e) => handleEditChange(row.id, 'comments', e.target.value)}
                                                className={`w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-slate-500 dark:placeholder:text-white/50 px-1 ${(editData[row.id]?.comments || row.comments) ? 'text-foreground dark:text-white' : 'text-slate-600 dark:text-white/60'}`}
                                            />
                                        ) : (
                                            <span className={`text-[11px] font-bold ${(row.comments) ? 'text-foreground dark:text-white' : 'text-slate-600 dark:text-white/60 italic'}`}>
                                                {row.comments || 'EMPTY'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 border-r border-border text-foreground">
                                        <div className="flex items-center justify-center gap-3">
                                            {row.image ? (
                                                <div 
                                                    onClick={() => {
                                                        setSelectedRowForImage(row.id)
                                                        setTempImageUrl(row.image || '')
                                                        setIsImageModalOpen(true)
                                                    }}
                                                    className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer hover:border-emerald-500 transition-all"
                                                >
                                                    <img src={row.image} alt="Ref" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRowForImage(row.id)
                                                        setTempImageUrl('')
                                                        setIsImageModalOpen(true)
                                                    }}
                                                    className="w-10 h-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* SUPABASE STYLE FOOTER */}
            <div className="h-10 border-t border-border flex items-center justify-between px-4 bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white/80">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-accent transition-colors text-slate-700 dark:text-white/60" />
                        <span className="text-slate-900 dark:text-white">Page 1 of 1</span>
                        <ChevronRight className="w-4 h-4 cursor-pointer hover:text-accent transition-colors text-slate-700 dark:text-white/60" />
                    </div>
                    <div className="flex items-center gap-2 border-l border-border pl-6">
                        <span className="text-slate-900 dark:text-white">{rows.length} records</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Save moved to top right for better visibility */}
                </div>
            </div>

            {/* INSERT MODAL - LIKE SUPABASE */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-xl shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Insert into {tableName}</h2>
                                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <form onSubmit={handleAddRow} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Serial No</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={newRow.s_no}
                                            onChange={(e) => setNewRow({...newRow, s_no: e.target.value})}
                                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rule Reference</label>
                                        <input 
                                            type="text"
                                            value={newRow.rule_ref}
                                            onChange={(e) => setNewRow({...newRow, rule_ref: e.target.value})}
                                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Requirement</label>
                                    <textarea 
                                        required
                                        rows={2}
                                        value={newRow.requirements}
                                        onChange={(e) => setNewRow({...newRow, requirements: e.target.value})}
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Reference Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            value={newRow.image}
                                            onChange={(e) => setNewRow({...newRow, image: e.target.value})}
                                            className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSavingNew}
                                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isSavingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Insert Row
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* IMAGE UPDATE MODAL */}
            <AnimatePresence>
                {isImageModalOpen && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-lg shadow-2xl">
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <Camera className="w-6 h-6 text-emerald-500" />
                                Update Reference Image
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Image URL</label>
                                    <input 
                                        type="text"
                                        value={tempImageUrl}
                                        onChange={(e) => setTempImageUrl(e.target.value)}
                                        placeholder="Enter image URL..."
                                        className="w-full px-6 py-4 bg-secondary border border-border rounded-2xl outline-none focus:border-primary font-bold text-sm text-foreground"
                                    />
                                </div>
                                {tempImageUrl && (
                                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-secondary border border-border shadow-inner">
                                        <img src={tempImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setIsImageModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500">Cancel</button>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await updateTableRow(tableName, selectedRowForImage, { image: tempImageUrl })
                                                setRows(prev => prev.map(r => r.id === selectedRowForImage ? { ...r, image: tempImageUrl } : r))
                                                setIsImageModalOpen(false)
                                            } catch (err) {
                                                alert('Failed to update image')
                                            }
                                        }}
                                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                    >
                                        Update Image
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default InspectionTable
