// resources/js/Pages/Voting/VoterLogin.tsx
"use client";

import { useForm, Head, usePage } from "@inertiajs/react";
import React, { useState, useEffect, useMemo } from "react";
import { route } from 'ziggy-js';
import { 
    Building2, Fingerprint, Loader2, ArrowRight, 
    Search, Landmark, AlertCircle, Phone, 
    ShieldCheck, CheckCircle2, Info, Globe,
    LayoutGrid, UserCheck, Smartphone
} from 'lucide-react';
import axios from 'axios';
import AppLogo from "@/components/app-logo";
import { cn } from "@/lib/utils";

interface Building {
    id: number;
    name: string;
}

interface Unit {
    id: number | string;
    unit_name: string;
    ownership_status: string;
}

interface VoterLoginProps {
    buildings: Building[];
    election?: {
        id: number;
        title: string;
    };
    election_id?: number | string;
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    errors: {
        unit_id?: string;
        civil_id?: string;
        phone?: string;
        global?: string;
    };
}

export default function VoterLogin() {
    const { props } = usePage<VoterLoginProps>();
    const { buildings, election_id: initialElectionId } = props;

    const [lang, setLang] = useState<'ar' | 'en'>('ar');
    const [step, setStep] = useState(1); // 1: Main Factor Hub, 2: Unit Selection (if needed)
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const isRtl = lang === 'ar';

    const t = {
        ar: {
            title: props.election?.title || 'نظام التصويت الإلكتروني',
            subtitle: 'بوابة التحقق الآمنة للمساهمين',
            instruction: 'يرجى تقديم اثنين على الأقل من عوامل التحقق للدخول',
            civil_id: 'رقم الهوية المدنية',
            civil_id_placeholder: 'أدخل رقم الهوية المكون من 12 رقم',
            phone: 'رقم الهاتف المسجل',
            phone_placeholder: 'أدخل رقم الهاتف',
            property: 'بيانات الوحدة العقارية',
            property_desc: 'اختر المبنى والوحدة',
            select_building: 'اختر المبنى',
            select_unit: 'اختر رقم الوحدة',
            search_unit: 'بحث عن رقم وحدة...',
            factor: 'عامل تحقق',
            factors_ready: 'جاهز للدخول',
            factors_needed: 'متبقي عامل واحد',
            start: 'بدء عملية التصويت',
            change_lang: 'English',
            error_global: 'خطأ في التحقق',
            unit_selected: 'تم اختيار الوحدة',
            change_location: 'تغيير الموقع',
            back: 'رجوع',
            loading: 'جاري التحميل...',
            active: 'نشط',
            restricted: 'مقيد',
            ownership_error: 'هذه الوحدة غير مؤهلة للتصويت المباشر'
        },
        en: {
            title: props.election?.title || 'E-Voting System',
            subtitle: 'Secure Shareholder Authentication Portal',
            instruction: 'Provide at least two verification factors to enter',
            civil_id: 'Civil ID Number',
            civil_id_placeholder: 'Enter 12-digit ID',
            phone: 'Registered Phone',
            phone_placeholder: 'Enter phone number',
            property: 'Property Details',
            property_desc: 'Select building and unit',
            select_building: 'Select Building',
            select_unit: 'Select Unit',
            search_unit: 'Search unit...',
            factor: 'Factor',
            factors_ready: 'Ready to Enter',
            factors_needed: '1 Factor Remaining',
            start: 'Start Voting Process',
            change_lang: 'العربية',
            error_global: 'Verification Error',
            unit_selected: 'Unit Selected',
            change_location: 'Change Location',
            back: 'Back',
            loading: 'Loading...',
            active: 'Active',
            restricted: 'Restricted',
            ownership_error: 'This unit is not eligible for direct voting'
        }
    }[lang];

    const { data, setData, post, processing, errors } = useForm({
        unit_id: "",
        civil_id: "",
        phone: "",
        building_id: "",
        election_id: initialElectionId || "", 
    });

    const [selectedUnitName, setSelectedUnitName] = useState("");
    const [selectedBuildingName, setSelectedBuildingName] = useState("");

    const factorCount = useMemo(() => {
        let count = 0;
        if (data.unit_id) count++;
        if (data.civil_id.length >= 4) count++; // Minimum length for ID
        if (data.phone.length >= 8) count++;   // Minimum length for Phone
        return count;
    }, [data.unit_id, data.civil_id, data.phone]);

    const handleBuildingSelect = (buildingId: string, buildingName: string) => {
        setData('building_id', buildingId);
        setSelectedBuildingName(buildingName);
        setLoadingUnits(true);
        axios.get(route('vote_get_units', { building: buildingId, election_id: data.election_id }))
            .then(res => {
                setUnits(res.data);
                setStep(2);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingUnits(false));
    };

    const handleUnitSelect = (unitId: string, unitName: string) => {
        setData('unit_id', unitId);
        setSelectedUnitName(unitName);
        setStep(1);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (factorCount >= 2) {
            post(route("vote_login"));
        }
    };

    const errorMessage = props.flash?.error || props.errors.global;

    return (
        <div className={cn(
            "min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/10 flex flex-col items-center justify-center p-6 relative overflow-hidden",
            isRtl ? "font-arabic" : ""
        )} dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Immersive Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/5 blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
            </div>

            <Head title={t.title} />

            <div className="w-full max-w-4xl z-10 flex flex-col items-center">
                
                {/* Top Action Bar */}
                <div className="w-full flex justify-between items-center mb-12">
                    <AppLogo size="lg" className="text-slate-900" />
                    <button 
                        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Globe className="w-4 h-4" />
                        {t.change_lang}
                    </button>
                </div>

                {/* Branding Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
                        {t.title}
                    </h1>
                    <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px] flex items-center justify-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        {t.subtitle}
                    </p>
                </div>

                {/* Main Interaction Hub */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Factors Panel (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {step === 1 ? (
                            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                
                                {/* Header Info */}
                                <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Info className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Security Protocol</p>
                                            <p className="text-sm font-bold text-slate-700">{t.instruction}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Factors Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Factor 1: Civil ID */}
                                    <div className={cn(
                                        "p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden",
                                        data.civil_id.length >= 4 ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
                                    )}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <UserCheck className={cn("w-6 h-6", data.civil_id.length >= 4 ? "text-emerald-600" : "text-slate-400")} />
                                            </div>
                                            {data.civil_id.length >= 4 && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                        </div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">{t.civil_id}</label>
                                        <input 
                                            type="text"
                                            placeholder={t.civil_id_placeholder}
                                            className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 focus:outline-none placeholder:text-slate-200"
                                            value={data.civil_id}
                                            onChange={(e) => setData('civil_id', e.target.value)}
                                        />
                                        <div className={cn("h-0.5 w-full mt-4 rounded-full transition-all duration-700", data.civil_id.length >= 4 ? "bg-emerald-500" : "bg-slate-100")} />
                                    </div>

                                    {/* Factor 2: Phone */}
                                    <div className={cn(
                                        "p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden",
                                        data.phone.length >= 8 ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
                                    )}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Smartphone className={cn("w-6 h-6", data.phone.length >= 8 ? "text-emerald-600" : "text-slate-400")} />
                                            </div>
                                            {data.phone.length >= 8 && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                                        </div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">{t.phone}</label>
                                        <input 
                                            type="text"
                                            placeholder={t.phone_placeholder}
                                            className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 focus:outline-none placeholder:text-slate-200"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        <div className={cn("h-0.5 w-full mt-4 rounded-full transition-all duration-700", data.phone.length >= 8 ? "bg-emerald-500" : "bg-slate-100")} />
                                    </div>

                                    {/* Factor 3: Property */}
                                    <button 
                                        onClick={() => setStep(2)}
                                        className={cn(
                                            "md:col-span-2 p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden text-start",
                                            data.unit_id ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                                                    <LayoutGrid className={cn("w-8 h-8", data.unit_id ? "text-emerald-600" : "text-slate-300")} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">{t.property}</label>
                                                    <p className={cn("text-xl font-black transition-colors", data.unit_id ? "text-slate-900" : "text-slate-200")}>
                                                        {data.unit_id ? `${selectedBuildingName} - ${selectedUnitName}` : t.property_desc}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className={cn("w-6 h-6 transition-all", isRtl ? "rotate-180" : "", data.unit_id ? "text-emerald-500" : "text-slate-300 group-hover:translate-x-2")} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in duration-500 space-y-6">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
                                >
                                    <ArrowRight className={cn("w-4 h-4", isRtl ? "" : "rotate-180")} /> {t.back}
                                </button>

                                <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.select_building}</h2>
                                        {loadingUnits && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                        {buildings.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => handleBuildingSelect(b.id.toString(), b.name)}
                                                className={cn(
                                                    "p-6 rounded-2xl border transition-all text-start group",
                                                    data.building_id === b.id.toString() ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white text-slate-600"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Building2 className="w-5 h-5 opacity-50" />
                                                    <span className="font-bold text-lg">{b.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {units.length > 0 && (
                                    <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-sm animate-in slide-in-from-top-4 duration-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.select_unit}</h2>
                                            <div className="relative group min-w-[250px]">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500" />
                                                <input 
                                                    type="text"
                                                    placeholder={t.search_unit}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                            {units.filter(u => u.unit_name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => handleUnitSelect(u.id.toString(), u.unit_name)}
                                                    className={cn(
                                                        "p-5 rounded-2xl border transition-all text-center",
                                                        data.unit_id === u.id.toString() ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white text-slate-500"
                                                    )}
                                                >
                                                    <span className="block font-black text-lg">{u.unit_name}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50">
                                                        {u.ownership_status === 'محولة' || u.ownership_status === 'transferred' ? t.active : t.restricted}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Actions & Status (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Status Card */}
                        <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl rounded-full -mr-16 -mt-16" />
                            
                            <div className="relative z-10 text-center space-y-8">
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-6">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                                strokeDasharray={377}
                                                strokeDashoffset={377 - (377 * (factorCount / 3))}
                                                className={cn("transition-all duration-1000", factorCount >= 2 ? "text-emerald-500" : "text-indigo-500")}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900 leading-none">{factorCount}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ 3 {t.factor}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className={cn(
                                        "text-xl font-black uppercase tracking-tighter mb-2",
                                        factorCount >= 2 ? "text-emerald-600" : "text-slate-300"
                                    )}>
                                        {factorCount >= 2 ? t.factors_ready : t.factors_needed}
                                    </h3>
                                </div>

                                {errorMessage && (
                                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-3 animate-bounce">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleLogin}
                                    disabled={factorCount < 2 || processing}
                                    className={cn(
                                        "w-full py-6 rounded-[2rem] font-black text-lg transition-all duration-500 flex items-center justify-center gap-3",
                                        factorCount >= 2 
                                            ? "bg-slate-900 text-white hover:bg-emerald-600 shadow-2xl shadow-slate-900/20" 
                                            : "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                                    )}
                                >
                                    {processing ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            {t.start}
                                            <ArrowRight className={cn("w-5 h-5", isRtl ? "rotate-180" : "")} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="p-6 rounded-[2rem] border border-slate-200 bg-white flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                <Fingerprint className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 leading-relaxed">
                                AES-256 Encrypted Matrix<br />
                                <span className="text-slate-900/40">Secure Node Verification Active</span>
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-16 text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase text-center">
                    Sandan Property Network • Decentralized Registry Access
                </p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Cairo:wght@400;700;900&display=swap');
                
                .font-arabic { font-family: 'Cairo', 'Inter', sans-serif; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
}
