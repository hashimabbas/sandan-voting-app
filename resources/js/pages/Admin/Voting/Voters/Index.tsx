import React, { useState, useMemo, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import {
    Search, Edit, Trash2, Upload, Filter,
    Database, Users, Building, Phone,
    CreditCard, CheckCircle, XCircle, Sparkles,
    FileSpreadsheet, Loader2, Info, FileText,
    Save, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableVirtuoso } from 'react-virtuoso';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ElectionShort {
    id: number;
    title: string;
}

interface Voter {
    id: number;
    election_id: number;
    voter_id_no: string;
    name: string;
    phone: string;
    number_of_units: number;
    building_no: string;
    unit_name: string;
    mulkiya_status: string;
    has_voted: boolean;
    created_at: string;
}

interface AdminVoterIndexProps {
    voters: {
        data: Voter[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    elections: ElectionShort[];
    filters: {
        search?: string;
        election_id?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    can: {
        viewVoters: boolean;
        importVoters: boolean;
        editVoters: boolean;
        deleteVoters: boolean;
    };
}

// Inline Editable Cell Component
const EditableCell = ({ value, onSave, placeholder, className }: { value: string, onSave: (val: string) => void, placeholder?: string, className?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || '');

    const handleBlur = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onSave(currentValue);
        }
    };

    if (isEditing) {
        return (
            <input
                autoFocus
                className={cn("w-full bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-slate-900 text-xs focus:outline-none", className)}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn("cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors truncate min-h-[1.5rem]", !value && "text-slate-400 italic", className)}
        >
            {value || placeholder || '---'}
        </div>
    );
};

export default function AdminVoterIndex() {
    const { voters, elections, filters, breadcrumbs, flash, can } = usePage<AdminVoterIndexProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedElectionId, setSelectedElectionId] = useState<string>(filters.election_id?.toString() || '');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleFilter = () => {
        router.get(route('admin_voters_index'), { search, election_id: selectedElectionId }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleUpdateVoter = (voter: Voter, field: keyof Voter, value: any) => {
        router.patch(route('admin_voters_update', voter.id), {
            ...voter,
            [field]: value,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Flash message handled by backend
            }
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile || !selectedElectionId) return;

        if (confirm("Initiate Ownership Registry Ingestion? Existing records will be synchronized.")) {
            const formData = new FormData();
            formData.append("file", importFile);
            formData.append("election_id", selectedElectionId);

            router.post(route('admin_voters_import'), formData, {
                onStart: () => setIsImporting(true),
                onFinish: () => setIsImporting(false),
                onSuccess: () => {
                    setImportFile(null);
                    router.reload({ only: ['voters'] });
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Terminate ownership record? This action is irreversible.")) {
            router.delete(route('admin_voters_destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleBulkDelete = () => {
        const message = selectedElectionId && selectedElectionId !== 'all'
            ? `⚠️ CRITICAL ACTION: Are you absolutely sure you want to delete ALL voters for "${currentElection?.title}"?`
            : "⚠️ CRITICAL ACTION: Are you absolutely sure you want to delete ALL voters in the system?";

        if (confirm(message)) {
            router.delete(route('admin_voters_bulk_destroy'), {
                data: { election_id: selectedElectionId !== 'all' ? selectedElectionId : null },
                preserveScroll: true,
            });
        }
    };

    const exportToPDF = () => {
        setIsExporting(true);
        const doc = new jsPDF('l', 'mm', 'a4');
        const title = currentElection ? `Ownership Registry - ${currentElection.title}` : 'Global Ownership Registry';

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const tableData = sortedVoters.map(v => [
            v.voter_id_no,
            v.name,
            v.phone,
            v.building_no || '-',
            v.unit_name || '-',
            v.mulkiya_status || '-',
            v.number_of_units,
            v.has_voted ? 'Yes' : 'No'
        ]);

        autoTable(doc, {
            startY: 35,
            head: [['Owner ID', 'Name', 'Phone', 'Building', 'Unit', 'Status', 'Weight', 'Voted']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 },
        });

        doc.save(`Ownership_Registry_${new Date().getTime()}.pdf`);
        setIsExporting(false);
    };

    const currentElection = elections.find(e => e.id.toString() === selectedElectionId);

    // Sort voters by Building No and Unit Name (Numeric sorting)
    const sortedVoters = useMemo(() => {
        return [...voters.data].sort((a, b) => {
            const bldgA = a.building_no || '';
            const bldgB = b.building_no || '';

            const bldgCompare = bldgA.localeCompare(bldgB, undefined, { numeric: true, sensitivity: 'base' });
            if (bldgCompare !== 0) return bldgCompare;

            const unitA = a.unit_name || '';
            const unitB = b.unit_name || '';
            return unitA.localeCompare(unitB, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [voters.data]);

    // Optimized Virtual Table Renderer
    const TableComponents = useMemo(() => ({
        Table: (props: any) => <table {...props} className="w-full text-left border-collapse bg-white" />,
        TableHead: React.forwardRef((props: any, ref: any) => <thead {...props} ref={ref} className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm" />),
        TableRow: (props: any) => <tr {...props} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group" />,
        TableCell: (props: any) => <td {...props} className="px-6 py-4 text-xs text-slate-600" />,
    }), []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ownership Matrix" />

            <div className="min-h-screen bg-[#FDFDFD] text-slate-600 p-8 space-y-12 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.4em]">
                            <Database className="w-4 h-4" /> Global Ownership Matrix
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Shareholder Registry</h1>
                        <p className="text-slate-400 font-medium max-w-xl">Centralized data engine for property management and voting eligibility.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center gap-4 bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Records</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{voters.total}</span>
                            </div>
                            <div className="w-px h-10 bg-slate-100 mx-2" />
                            <Users className="w-10 h-10 text-indigo-600 opacity-20" />
                        </div>

                        <Button
                            onClick={exportToPDF}
                            disabled={isExporting || voters.total === 0}
                            className="h-20 px-8 rounded-[2rem] bg-slate-900 text-white hover:bg-indigo-600 transition-all group font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10"
                        >
                            {isExporting ? <Loader2 className="animate-spin" /> : <><Download className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> PDF Export</>}
                        </Button>
                    </div>
                </header>

                {/* Flash Messages */}
                {(flash.success || flash.error || flash.info) && (
                    <div className="relative z-10 space-y-4 max-w-5xl">
                        {flash.success && (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm">{flash.success}</span>
                            </div>
                        )}
                        {flash.error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <XCircle className="w-5 h-5" />
                                <span className="text-sm">{flash.error}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Ingestion & Filter Terminal */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 relative z-10">
                    <div className="xl:col-span-3 bg-white border border-slate-200 rounded-[3rem] p-8 space-y-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Filter className="w-4 h-4 text-indigo-600" /> Filter Parameters
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select onValueChange={(v) => setSelectedElectionId(v)} value={selectedElectionId}>
                                <SelectTrigger className="h-16 bg-slate-50 border-slate-200 rounded-2xl px-6 text-slate-900 focus:ring-2 focus:ring-indigo-500/20">
                                    <SelectValue placeholder="Select Assembly Node" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-900">
                                    <SelectItem value="all">Across All Assemblies</SelectItem>
                                    {elections.map(e => (
                                        <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search registry..."
                                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                        </div>

                        <button onClick={handleFilter} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10">
                            Sync Registry View
                        </button>
                    </div>

                    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-[3rem] p-8 flex flex-col justify-between space-y-6 shadow-sm">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Upload className="w-4 h-4 text-emerald-600" /> Bulk Ingestion
                            </h3>
                        </div>

                        <form onSubmit={handleImport} className="space-y-4">
                            <label className={cn(
                                "w-full h-24 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                                importFile ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                            )}>
                                <FileSpreadsheet className="w-6 h-6" />
                                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">
                                    {importFile ? importFile.name : 'Upload Registry File'}
                                </span>
                                <input type="file" className="hidden" onChange={(e) => setImportFile(e.target.files?.[0] || null)} accept=".xls,.xlsx,.csv" />
                            </label>

                            <div className="flex gap-4">
                                <button type="submit" disabled={isImporting || !importFile || !selectedElectionId} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-20 transition-all">
                                    {isImporting ? <Loader2 className="animate-spin mx-auto" /> : 'Commit Ingestion'}
                                </button>
                                {can.deleteVoters && voters.total > 0 && (
                                    <button type="button" onClick={handleBulkDelete} className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Virtualized Registry Table */}
                <div className="relative z-10 bg-white border border-slate-200 rounded-[3rem] shadow-xl overflow-hidden" style={{ height: '700px' }}>
                    <TableVirtuoso
                        data={sortedVoters}
                        components={TableComponents}
                        fixedHeaderContent={() => (
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[150px]">Owner ID</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[200px]">Name</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[150px]">Phone</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[120px]">Building No</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[120px]">Unit</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[150px]">Mulkiya Status</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[80px] text-center">Weight</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[100px] text-right">Actions</th>
                            </tr>
                        )}
                        itemContent={(index, voter) => (
                            <>
                                <td className="px-6 py-4">
                                    <EditableCell
                                        value={voter.voter_id_no}
                                        onSave={(val) => handleUpdateVoter(voter, 'voter_id_no', val)}
                                        className="font-mono text-indigo-600"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <EditableCell
                                        value={voter.name}
                                        onSave={(val) => handleUpdateVoter(voter, 'name', val)}
                                        className="font-black text-slate-900"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <EditableCell
                                        value={voter.phone}
                                        onSave={(val) => handleUpdateVoter(voter, 'phone', val)}
                                        className="text-slate-600"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <EditableCell
                                        value={voter.building_no}
                                        onSave={(val) => handleUpdateVoter(voter, 'building_no', val)}
                                        placeholder="Add Bldg"
                                        className="text-slate-600"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <EditableCell
                                        value={voter.unit_name}
                                        onSave={(val) => handleUpdateVoter(voter, 'unit_name', val)}
                                        placeholder="Add Unit"
                                        className="text-slate-600"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <EditableCell
                                        value={voter.mulkiya_status}
                                        onSave={(val) => handleUpdateVoter(voter, 'mulkiya_status', val)}
                                        placeholder="Status"
                                        className="text-slate-600"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 font-bold">
                                        {voter.number_of_units}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleDelete(voter.id)}
                                            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </>
                        )}
                    />
                </div>

                <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest text-center py-4">
                    Matrix Virtualization Active • Rendering {voters.total} Nodes Optimized
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />

        </AppLayout>
    );
}
