import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Database, 
    UploadCloud, 
    CheckCircle2, 
    AlertCircle, 
    FileText, 
    Loader2, 
    Info, 
    ShieldCheck,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImportIndex() {
    const { flash } = usePage<any>().props;
    const { data, setData, post, processing, progress, errors } = useForm({
        file: null as File | null,
    });

    const [isDragging, setIsDragging] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin_import_store'));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Dashboard', url: route('admin_dashboard') }, { label: 'Property Management', url: '#' }]}>
            <Head title="Property & Asset Management" />

            <div className="min-h-screen bg-slate-50 text-slate-600 p-8 space-y-12 selection:bg-indigo-500/10 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                <header className="space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Database className="w-4 h-4" /> Data Infrastructure
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Property Management</h1>
                    <p className="text-slate-400 font-medium italic max-w-2xl">Update property owners and unit registries via bulk data ingestion (CSV/Excel).</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                    {/* Upload Section */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Data Matrix</h2>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">Ensure column headers align with the official template to prevent synchronization errors.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div 
                                    className={cn(
                                        "relative group cursor-pointer border-2 border-dashed rounded-[3rem] p-16 transition-all duration-500 flex flex-col items-center justify-center gap-6",
                                        isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-slate-100 bg-slate-50 hover:border-indigo-300 hover:bg-white"
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files[0]) setData('file', e.dataTransfer.files[0]);
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={(e) => e.target.files && setData('file', e.target.files[0])}
                                    />
                                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                        <UploadCloud className="w-10 h-10" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black text-slate-900 mb-1">
                                            {data.file ? data.file.name : "Drop file here or click to browse"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports .xlsx, .csv, .xls</p>
                                    </div>
                                </div>

                                {progress && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                            <span>Processing Ingestion...</span>
                                            <span>{progress.percentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress.percentage}%` }} />
                                        </div>
                                    </div>
                                )}

                                {errors.file && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in zoom-in">
                                        <AlertCircle className="w-4 h-4" /> {errors.file}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!data.file || processing}
                                    className={cn(
                                        "w-full py-6 rounded-[2rem] font-black text-xl transition-all duration-500 shadow-xl",
                                        !data.file || processing 
                                            ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
                                            : "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-emerald-500/20"
                                    )}
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Initiate Sync <ShieldCheck className="w-5 h-5" /></>}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Requirements Sidebar */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="p-10 rounded-[3.5rem] bg-indigo-600 text-white shadow-2xl space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <FileText className="w-32 h-32 text-white -rotate-12" />
                            </div>
                            
                            <div className="space-y-4 relative z-10">
                                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <Info className="w-6 h-6" /> Data Protocol
                                </h3>
                                <p className="text-indigo-100/70 text-xs font-medium leading-relaxed">
                                    To ensure registry integrity, your file MUST contain the following columns in order:
                                </p>
                            </div>

                            <ul className="space-y-4 relative z-10">
                                <RequirementItem text="Building Name" />
                                <RequirementItem text="Unit Number" />
                                <RequirementItem text="Owner Name" />
                                <RequirementItem text="Ownership Type" />
                                <RequirementItem text="Contact Info" />
                            </ul>

                            <div className="pt-8 border-t border-white/10 relative z-10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Download Template</span>
                                <button className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {flash?.success && (
                            <div className="p-6 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-start gap-4 animate-in slide-in-from-right duration-700">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                                <div className="space-y-1">
                                    <h4 className="font-black text-emerald-900 text-sm">Sync Successful</h4>
                                    <p className="text-xs text-emerald-700/70 font-medium">Property registry has been updated successfully.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function RequirementItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 group">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-150 transition-transform" />
            <span className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">{text}</span>
        </li>
    );
}
