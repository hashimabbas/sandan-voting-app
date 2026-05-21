// resources/js/Pages/Owner/Voting/Index.tsx
import React, { useState } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppSidebarOwnerLayout from '@/layouts/app/app-sidebar-layout-owner';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { CheckCircle, PlusCircle, MinusCircle, LoaderCircle } from 'lucide-react';
import router from '@inertiajs/inertia'; // Using direct router for specific post config

// Interfaces for data received from backend
interface VoterData {
    id: number;
    name: string;
    phone: string;
    number_of_units: number;
    votesRemaining: number;
}

interface ElectionDetails { // New interface for election
    id: number;
    title: string;
    description: string | null;
}

interface CandidateData {
    id: number;
    name: string;
    description: string | null;
    photo: string | null;
}

interface OwnerVotingIndexProps {
    voter: VoterData;
    election: ElectionDetails; // Added election details
    candidates: CandidateData[];
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
}

export default function OwnerVotingIndex() {
    const { voter, election, candidates, breadcrumbs, flash } = usePage<OwnerVotingIndexProps>().props;
    const [candidateVotes, setCandidateVotes] = useState<{ [candidateId: number]: number }>(
        {}
    );
    const totalVotesRemaining = voter.number_of_units - Object.values(candidateVotes).reduce((sum, count) => sum + count, 0);

    const { post, processing, errors, setData } = useForm({
        election_id: election.id, // Pass election_id with the form
        votes: [] as { candidate_id: number; count: number }[],
    });

    const handleVoteChange = (candidateId: number, change: number) => {
        setCandidateVotes(prevVotes => {
            const currentCount = prevVotes[candidateId] || 0;
            const newCount = currentCount + change;

            if (newCount < 0) return prevVotes;

            const updatedVotes = {
                ...prevVotes,
                [candidateId]: newCount,
            };

            const totalCast = Object.values(updatedVotes).reduce((sum, count) => sum + count, 0);

            if (totalCast > voter.number_of_units) {
                alert(`You can only cast ${voter.number_of_units} votes in total for ${election.title}.`);
                return prevVotes;
            }

            return updatedVotes;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const votesArray = Object.entries(candidateVotes)
            .filter(([, count]) => count > 0)
            .map(([id, count]) => ({ candidate_id: Number(id), count }));

        if (votesArray.length === 0) {
            alert('Please cast at least one vote.');
            return;
        }

        const totalCast = votesArray.reduce((sum, v) => sum + v.count, 0);
        if (totalCast > voter.number_of_units) {
            alert(`You are trying to cast more votes (${totalCast}) than your allocated number of units (${voter.number_of_units}).`);
            return;
        }

        setData('votes', votesArray); // Set the votes data into the form

        router.post(route('owner_voting_cast_vote'), {
            election_id: election.id, // Explicitly send election_id
            votes: votesArray,
        }, {
            onSuccess: () => {
                setCandidateVotes({}); // Reset local state
                // Inertia will handle redirect or flash messages
            },
            onError: (backendErrors) => {
                console.error('Owner Vote submission errors:', backendErrors);
                // Optionally update form errors if needed for specific fields
                alert(`Failed to cast votes: ` + Object.values(backendErrors).join(', '));
            },
        });
    };

    return (
        <AppSidebarOwnerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cast Your Vote: ${election.title}`} />

            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <h2 className="text-3xl font-bold text-gray-800">🗳️ Cast Your Vote for "{election.title}"</h2>
                <p className="text-gray-600">{election.description}</p>
                <p className="text-gray-600">You have <span className="font-bold text-blue-600">{voter.number_of_units}</span> votes based on your units.
                </p>
                <p className="text-gray-600">Votes remaining: <span className="font-bold text-green-600">{totalVotesRemaining}</span></p>

                {/* Flash Messages */}
                {flash.success && (<div className="rounded-md bg-green-100 border border-green-300 p-3 text-green-700 shadow-sm"> ✅ {flash.success} </div>)}
                {flash.error && (<div className="rounded-md bg-red-100 border border-red-300 p-3 text-red-700 shadow-sm"> ❌ {flash.error} </div>)}
                {flash.info && (<div className="rounded-md bg-blue-100 border border-blue-300 p-3 text-blue-700 shadow-sm"> ℹ️ {flash.info} </div>)}

                {errors.votes && <InputError message={errors.votes} className="mt-2" />}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {candidates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {candidates.map(candidate => (
                                <CandidateVotingCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    currentVotes={candidateVotes[candidate.id] || 0}
                                    onVoteChange={handleVoteChange}
                                    canAddVote={totalVotesRemaining > 0}
                                    maxVotes={voter.number_of_units} // Max for one candidate (can be total units)
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No candidates available for voting at this time for "{election.title}".</p>
                    )}

                    <div className="flex justify-end mt-6">
                        <Button
                            type="submit"
                            disabled={processing || Object.values(candidateVotes).every(count => count === 0)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3 text-lg"
                        >
                            {processing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                            Submit My Votes
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarOwnerLayout>
    );
}

// Helper Widget for a single candidate voting card (reused from Owner)
interface CandidateVotingCardProps {
    candidate: CandidateData;
    currentVotes: number;
    onVoteChange: (candidateId: number, change: number) => void;
    canAddVote: boolean;
    maxVotes: number; // The overall maximum for the voter, not for a single candidate
}

function CandidateVotingCard({ candidate, currentVotes, onVoteChange, canAddVote, maxVotes }: CandidateVotingCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-3 flex flex-col items-center text-center">
            {candidate.photo ? (
                <img src={candidate.photo} alt={candidate.name} className="h-24 w-24 rounded-full object-cover mb-2" />
            ) : (
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-500 mb-2">
                    {candidate.name.charAt(0).toUpperCase()}
                </div>
            )}
            <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
            {candidate.description && <p className="text-sm text-gray-600 max-w-prose">{candidate.description}</p>}

            <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onVoteChange(candidate.id, -1)}
                    disabled={currentVotes <= 0}
                >
                    <MinusCircle className="h-5 w-5 text-red-500" />
                </Button>
                <span className="text-2xl font-bold text-blue-600 w-10 text-center">{currentVotes}</span>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onVoteChange(candidate.id, 1)}
                    disabled={!canAddVote}
                >
                    <PlusCircle className="h-5 w-5 text-green-500" />
                </Button>
            </div>
        </div>
    );
}
