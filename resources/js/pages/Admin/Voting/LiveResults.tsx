import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import axios from 'axios';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining class names

// Interfaces for data received from backend
interface CandidateResult {
    id: number;
    name: string;
    photo: string | null;
    votes_count: number;
}

interface AdminLiveVotingResultsProps {
    results: CandidateResult[];
    totalPossibleVotes: number;
    totalVotesCast: number;
    votingStatus: string;
}

// --- FIX START: Move formatNum here, outside the component ---
// Helper for formatting numbers (defined globally in this file)
const formatNum = (v: unknown, digits = 3) => {
    const n = Number(v ?? 0);
    return Number.isNaN(n) ? (0).toFixed(digits) : n.toFixed(digits);
};
// --- FIX END ---

export default function AdminLiveVotingResults() {
    const { initialResults, initialTotalPossibleVotes, initialTotalVotesCast, initialVotingStatus } = usePage<AdminLiveVotingResultsProps>().props;

    const [results, setResults] = useState<CandidateResult[]>(initialResults || []);

    const [totalPossibleVotes, setTotalPossibleVotes] = useState<number>(initialTotalPossibleVotes || 0);
    const [totalVotesCast, setTotalVotesCast] = useState<number>(initialTotalVotesCast || 0);

    // --- FIX START ---
    // Provide a default empty string or 'inactive' for votingStatus during initial renders
    const [votingStatus, setVotingStatus] = useState<string>(initialVotingStatus || 'inactive');
    // --- FIX END ---
    const [lastUpdated, setLastUpdated] = useState<string>('');


    // Polling effect for real-time updates
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchData = async () => {
            try {
                const response = await axios.get(route('api_voting_results'));
                const data = response.data;

                // Sort results by votes_count descending for live ranking
                const sortedResults = data.results.sort((a: CandidateResult, b: CandidateResult) => b.votes_count - a.votes_count);

                setResults(sortedResults);

                setTotalPossibleVotes(Number(data.totalPossibleVotes || 0));
                setTotalVotesCast(Number(data.totalVotesCast || 0));
                setVotingStatus(data.votingStatus);
                setLastUpdated(new Date().toLocaleTimeString());
            } catch (error) {
                console.error("Error fetching live voting results:", error);
                // Optionally show an error message on screen
            }
        };

        // Poll immediately and then every 3 seconds if voting is active
        fetchData(); // Initial fetch
        if (votingStatus === 'active') {
            intervalId = setInterval(fetchData, 3000); // Poll every 3 seconds
        }


        // Cleanup function
        return () => clearInterval(intervalId);
    }, [votingStatus, initialResults, initialTotalPossibleVotes, initialTotalVotesCast, initialVotingStatus]);


    const calculatePercentage = (votes: number) => {
        if (totalVotesCast === 0) return '0.00%';
        return ((votes / totalVotesCast) * 100).toFixed(2) + '%';
    };

    // Define colors for chart bars
    const barColors = ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#9013FE', '#FF6B6B']; // Example colors

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-8">
            <Head title="Live Voting Results" />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-5xl font-extrabold">📊 Live Voting Results</h1>
                <div className="text-right">
                    <p className="text-xl font-semibold">Status: <span className={votingStatus === 'active' ? 'text-green-400' : 'text-red-400'}>{votingStatus.toUpperCase()}</span></p>
                    <p className="text-lg text-gray-400">Last updated: {lastUpdated}</p>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-8 mb-12">
                <LiveStatCard label="Total Possible Votes" value={totalPossibleVotes} />
                <LiveStatCard label="Total Votes Cast" value={totalVotesCast} />
                <LiveStatCard label="Votes Remaining" value={totalPossibleVotes - totalVotesCast} />
            </div>

            {/* Results Chart */}
            <div className="flex-grow bg-gray-800 rounded-xl p-6 shadow-2xl flex flex-col">
                <h3 className="text-3xl font-bold text-gray-200 mb-6 text-center">Vote Distribution by Candidate</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={results || []}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 10 }} // Increased left margin for names
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis type="number" stroke="#ccc" />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={150} // Increased width for longer names
                            tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 17)}...` : value}
                            stroke="#ccc"
                            interval={0} // Show all labels
                            angle={-30} // Angle labels if they overlap
                            textAnchor="end" // Align labels to the end
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value: number) => [`${value} Votes (${calculatePercentage(value)})`, 'Votes']}
                        />
                        {/* <Legend /> */}
                        <Bar dataKey="votes_count" name="Votes" barSize={30}>
                            {(results || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Helper LiveStatCard component
function LiveStatCard({ label, value }: { label: string; value: string | number; }) {
    return (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg flex flex-col items-center justify-center text-center">
            <p className="text-lg text-gray-400 mb-2">{label}</p>
            <p className="text-4xl font-extrabold text-blue-400">{value}</p>
        </div>
    );
}
