import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
    X, 
    Copy, 
    Check, 
    Download, 
    Share2, 
    ExternalLink, 
    MessageCircle, 
    Twitter, 
    Mail, 
    Facebook
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareElectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    election: {
        id: number;
        title: string;
        slug?: string;
    };
    votingUrl: string;
}

export default function ShareElectionModal({ isOpen, onClose, election, votingUrl }: ShareElectionModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(votingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQRCode = () => {
        const svg = document.getElementById('election-qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                // Background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Draw QR
                ctx.drawImage(img, 20, 20);
                
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `Election_QR_${election.id}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-[#25D366]',
            url: `https://wa.me/?text=${encodeURIComponent(`Cast your vote for: ${election.title}\n${votingUrl}`)}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-[#1DA1F2]',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Cast your vote for: ${election.title}`)}&url=${encodeURIComponent(votingUrl)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#1877F2]',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(votingUrl)}`
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'bg-slate-700',
            url: `mailto:?subject=${encodeURIComponent(election.title)}&body=${encodeURIComponent(`Please cast your vote here: ${votingUrl}`)}`
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-[#0a0f1d] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Share Assembly Access</h3>
                        <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">{election.title}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* QR Code Section */}
                    <div className="p-12 flex flex-col items-center justify-center bg-white/5 space-y-8">
                        <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20">
                            <QRCodeSVG 
                                id="election-qr-code"
                                value={votingUrl}
                                size={220}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        
                        <Button 
                            onClick={downloadQRCode}
                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs gap-3"
                        >
                            <Download className="w-4 h-4" />
                            Download QR Code
                        </Button>
                    </div>

                    {/* Links & Socials Section */}
                    <div className="p-10 space-y-8">
                        {/* URL Copy */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Direct Voting Link</label>
                            <div className="relative group">
                                <input 
                                    readOnly
                                    value={votingUrl}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-16 text-sm text-slate-400 focus:outline-none"
                                />
                                <button 
                                    onClick={copyToClipboard}
                                    className={cn(
                                        "absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                        copied ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Social Shares */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Social Distribution</label>
                            <div className="grid grid-cols-2 gap-3">
                                {shareLinks.map((share) => (
                                    <a 
                                        key={share.name}
                                        href={share.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", share.color)}>
                                            <share.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-300 group-hover:text-white">{share.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <a 
                                href={votingUrl}
                                target="_blank"
                                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-dashed border-white/10 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all text-xs font-black uppercase tracking-widest"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Preview Voting Portal
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Minimal Button component to match current UI if not imported correctly
function Button({ className, children, ...props }: any) {
    return (
        <button 
            className={cn("flex items-center justify-center transition-all", className)}
            {...props}
        >
            {children}
        </button>
    );
}
