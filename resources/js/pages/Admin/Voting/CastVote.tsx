// resources/js/Pages/Voting/CastVote.tsx
"use client";

import { useForm, Head, usePage, router } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { route } from 'ziggy-js';
import { ThumbsUp, LoaderCircle, CheckCircle, AlertTriangle, PlusCircle, MinusCircle } from 'lucide-react';

interface Candidate {
    id: number;
    name: string;
    photo: string | null;
}

interface Voter {
    id: number;
    name: string;
    number_of_units: number;
    token: string;
}

interface ElectionDetails { // New interface for election
    id: number;
    title: string;
}

interface CastVoteProps {
    voter: Voter;
    election: ElectionDetails; // Added election details
    candidates: Candidate[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    errors: {
        votes?: string;
        global?: string;
    };
}

export default function CastVote() {
    const { voter, election, candidates, flash, errors: pageErrors } = usePage<CastVoteProps>().props;

    const [candidateVotes, setCandidateVotes] = useState<{ [candidateId: number]: number }>(
        {}
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalVotesCastByUser = Object.values(candidateVotes).reduce((sum, count) => sum + count, 0);
    const totalVotesRemaining = voter.number_of_units - totalVotesCastByUser;

    const { errors: formErrors, setError, clearErrors } = useForm({});

    useEffect(() => {
        setCandidateVotes({});
        clearErrors();
    }, [voter.id, election.id, candidates.length]); // Added election.id to dependency array

    const handleVoteChange = (candidateId: number, change: number) => {
        setCandidateVotes(prevVotes => {
            const currentCount = prevVotes[candidateId] || 0;
            const newCount = currentCount + change;

            if (newCount < 0) return prevVotes;

            const updatedVotes = {
                ...prevVotes,
                [candidateId]: newCount,
            };

            const tempTotalCast = Object.values(updatedVotes).reduce((sum, count) => sum + count, 0);

            if (tempTotalCast > voter.number_of_units) {
                alert(`You can only cast a total of ${voter.number_of_units} votes for ${election.title}.`);
                return prevVotes;
            }

            return updatedVotes;
        });
        clearErrors('votes');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const votesArrayToSend = Object.entries(candidateVotes)
            .filter(([, count]) => count > 0)
            .map(([id, count]) => ({ candidate_id: Number(id), count }));

        if (votesArrayToSend.length === 0) {
            alert("Please cast at least one vote before submitting.");
            setError('votes', 'Please select at least one candidate to cast your votes.');
            return;
        }

        const totalSubmittedVotes = votesArrayToSend.reduce((sum, v) => sum + v.count, 0);
        if (totalSubmittedVotes === 0) {
            alert("You must allocate at least one vote.");
            setError('votes', 'You must allocate at least one vote.');
            return;
        }
        if (totalSubmittedVotes > voter.number_of_units) {
            alert(`You are trying to cast more votes (${totalSubmittedVotes}) than your allocated number of units (${voter.number_of_units}).`);
            setError('votes', `You are trying to cast more votes (${totalSubmittedVotes}) than your allocated number of units (${voter.number_of_units}).`);
            return;
        }

        clearErrors();
        setIsSubmitting(true);

        try {
            await router.post(route("vote_cast_vote"), {
                token: voter.token,
                votes: votesArrayToSend,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                onSuccess: () => {
                    setCandidateVotes({});
                },
                onError: (backendErrors) => {
                    console.error("Vote submission errors (from backend):", backendErrors);
                    if (backendErrors.votes) setError('votes', backendErrors.votes);
                    if (backendErrors.global) setError('global', backendErrors.global);
                    else if (Object.keys(backendErrors).length > 0) {
                        setError('global', 'One or more fields have errors. Please check above.');
                    }
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error("Network or unexpected error during vote submission:", error);
            setError('global', 'An unexpected network error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    const globalError = flash?.error || pageErrors.global || formErrors.global;
    const successMessage = flash?.success;

    return (
        <div className="min-h-screen bg-gray-100 p-8 pb-32">
            <Head title={`Cast Your Vote: ${election.title}`} />
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Ballot Box 🗳️</h2>
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2">{election.title}</h3> {/* Display election title */}
                    <p className="text-xl text-indigo-600 font-semibold">Welcome, {voter.name}</p>
                    <p className="text-lg text-gray-500">
                        Your total voting power: <span className="font-bold">{voter.number_of_units} Units</span>
                    </p>
                    <p className="text-lg text-gray-500">
                        Votes remaining: <span className="font-bold text-green-600">{totalVotesRemaining}</span>
                    </p>
                </div>

                {successMessage && (
                    <div className="rounded-md bg-green-100 border border-green-400 p-3 text-green-800 font-medium flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> {successMessage}
                    </div>
                )}
                {globalError && (
                    <div className="rounded-md bg-red-100 border border-red-400 p-3 text-red-800 font-medium flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> {globalError}
                    </div>
                )}
                {formErrors.votes && (
                    <div className="rounded-md bg-red-100 border border-red-400 p-3 text-red-800 font-medium flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> {formErrors.votes}
                    </div>
                )}


                <form onSubmit={handleSubmit} className="space-y-8">
                    {candidates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidates.map((candidate) => (
                                <CandidateVotingCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    currentVotes={candidateVotes[candidate.id] || 0}
                                    onVoteChange={handleVoteChange}
                                    canAddVote={totalVotesRemaining > 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No candidates available for voting at this time for "{election.title}".</p>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 shadow-2xl z-10">
                        <button
                            type="submit"
                            disabled={isSubmitting || totalVotesCastByUser === 0}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition duration-150
                                ${totalVotesCastByUser === 0 || isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {isSubmitting ? (
                                <LoaderCircle className="h-6 w-6 mr-2" />
                            ) : (
                                <><ThumbsUp className="h-6 w-6 mr-2" /> Submit My {totalVotesCastByUser} Votes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper Widget for a single candidate voting card (reused from Owner)
interface CandidateVotingCardProps {
    candidate: Candidate;
    currentVotes: number;
    onVoteChange: (candidateId: number, change: number) => void;
    canAddVote: boolean;
}

function CandidateVotingCard({ candidate, currentVotes, onVoteChange, canAddVote }: CandidateVotingCardProps) {
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

            <div className="flex items-center justify-center gap-3 mt-4">
                <button
                    type="button"
                    onClick={() => onVoteChange(candidate.id, -1)}
                    disabled={currentVotes <= 0}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <MinusCircle className="h-5 w-5" />
                </button>
                <span className="text-2xl font-bold text-blue-600 w-10 text-center">{currentVotes}</span>
                <button
                    type="button"
                    onClick={() => onVoteChange(candidate.id, 1)}
                    disabled={!canAddVote}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <PlusCircle className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

// // resources/js/Pages/Voting/CastVote.tsx
// "use client";

// import { useForm, Head, usePage } from "@inertiajs/react";
// import React, { useState } from "react";
// import { route } from 'ziggy-js';
// import { ThumbsUp, LoaderCircle, CheckCircle, AlertTriangle, PlusCircle, MinusCircle } from 'lucide-react'; // Added PlusCircle, MinusCircle

// interface Candidate {
//     id: number;
//     name: string;
//     photo: string | null;
// }

// interface Voter {
//     id: number;
//     name: string;
//     number_of_units: number;
//     token: string;
// }

// interface CastVoteProps {
//     voter: Voter;
//     candidates: Candidate[];
//     flash: { // Added flash messages from controller redirects
//         success?: string;
//         error?: string;
//         info?: string;
//     };
//     errors: { // Added errors for form validation or global issues
//         votes?: string;
//         global?: string;
//     };
// }

// export default function CastVote() {
//     const { voter, candidates, flash, errors: pageErrors } = usePage<CastVoteProps>().props;

//     // State to track how many votes are allocated to each candidate
//     const [candidateVotes, setCandidateVotes] = useState<{ [candidateId: number]: number }>(
//         {}
//     );

//     // Calculate total votes cast so far
//     const totalVotesCastByUser = Object.values(candidateVotes).reduce((sum, count) => sum + count, 0);

//     // Calculate votes remaining for the user
//     const totalVotesRemaining = voter.number_of_units - totalVotesCastByUser;

//     const { post, processing, errors: formErrors } = useForm({
//         // The actual votes data will be sent separately via Inertia.post
//         // We still need the token as a hidden field for the backend check
//         token: voter.token,
//     });

//     const handleVoteChange = (candidateId: number, change: number) => {
//         setCandidateVotes(prevVotes => {
//             const currentCount = prevVotes[candidateId] || 0;
//             const newCount = currentCount + change;

//             // Cannot go below 0 votes for a candidate
//             if (newCount < 0) return prevVotes;

//             const updatedVotes = {
//                 ...prevVotes,
//                 [candidateId]: newCount,
//             };

//             // Calculate total votes after this potential change
//             const tempTotalCast = Object.values(updatedVotes).reduce((sum, count) => sum + count, 0);

//             // Prevent exceeding total allocated votes
//             if (tempTotalCast > voter.number_of_units) {
//                 alert(`You can only cast a total of ${voter.number_of_units} votes.`);
//                 return prevVotes; // Revert if over-voting
//             }

//             return updatedVotes;
//         });
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         const votesArray = Object.entries(candidateVotes)
//             .filter(([, count]) => count > 0) // Only send candidates with at least one vote
//             .map(([id, count]) => ({ candidate_id: Number(id), count }));

//         if (votesArray.length === 0) {
//             alert("Please cast at least one vote before submitting.");
//             return;
//         }

//         const totalSubmittedVotes = votesArray.reduce((sum, v) => sum + v.count, 0);
//         if (totalSubmittedVotes === 0) {
//             alert("You must allocate at least one vote.");
//             return;
//         }
//         if (totalSubmittedVotes > voter.number_of_units) {
//             alert(`You are trying to cast more votes (${totalSubmittedVotes}) than your allocated number of units (${voter.number_of_units}).`);
//             return;
//         }

//         // Use Inertia.post directly for a custom payload structure that doesn't fit `useForm` directly
//         post(route("vote_cast_vote"), {
//             // Include the token for security validation on the backend
//             token: voter.token,
//             votes: votesArray,
//         }, {
//             preserveScroll: true,
//             onSuccess: () => {
//                 setCandidateVotes({}); // Reset votes after successful submission
//             },
//             onError: (errors) => {
//                 console.error("Vote submission errors:", errors);
//                 // Inertia handles flash errors, local formErrors would be updated for 'votes'
//             },
//         });
//     };

//     // Get global errors from the server (e.g., token mismatch, DB error, voting closed)
//     const globalError = flash?.error || pageErrors.global;
//     const successMessage = flash?.success;

//     return (
//         <div className="min-h-screen bg-gray-100 p-8 pb-32"> {/* Increased padding bottom for fixed button */}
//             <Head title="Cast Your Vote" />
//             <div className="max-w-4xl mx-auto space-y-8">
//                 <div className="text-center bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500">
//                     <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Ballot Box 🗳️</h2>
//                     <p className="text-xl text-indigo-600 font-semibold">Welcome, {voter.name}</p>
//                     <p className="text-lg text-gray-500">
//                         Your total voting power: <span className="font-bold">{voter.number_of_units} Units</span>
//                     </p>
//                     <p className="text-lg text-gray-500">
//                         Votes remaining: <span className="font-bold text-green-600">{totalVotesRemaining}</span>
//                     </p>
//                 </div>

//                 {successMessage && (
//                     <div className="rounded-md bg-green-100 border border-green-400 p-3 text-green-800 font-medium flex items-center gap-2">
//                         <CheckCircle className="h-5 w-5" /> {successMessage}
//                     </div>
//                 )}
//                 {globalError && (
//                     <div className="rounded-md bg-red-100 border border-red-400 p-3 text-red-800 font-medium flex items-center gap-2">
//                         <AlertTriangle className="h-5 w-5" /> {globalError}
//                     </div>
//                 )}
//                 {formErrors.votes && (
//                     <p className="mt-2 text-center text-red-600 text-sm">{formErrors.votes}</p>
//                 )}


//                 <form onSubmit={handleSubmit} className="space-y-8">
//                     {/* Hidden token field for backend validation */}
//                     <input type="hidden" name="token" value={voter.token} />

//                     {candidates.length > 0 ? (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {candidates.map((candidate) => (
//                                 <CandidateVotingCard
//                                     key={candidate.id}
//                                     candidate={candidate}
//                                     currentVotes={candidateVotes[candidate.id] || 0}
//                                     onVoteChange={handleVoteChange}
//                                     canAddVote={totalVotesRemaining > 0}
//                                     maxVotes={voter.number_of_units} // Max for one candidate (can be total units)
//                                 />
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="text-gray-500 text-center py-4">No candidates available for voting at this time.</p>
//                     )}


//                     {/* Fixed action button at the bottom */}
//                     <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 shadow-2xl z-10">
//                         <button
//                             type="submit"
//                             disabled={processing || totalVotesCastByUser === 0}
//                             className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition duration-150
//                                 ${totalVotesCastByUser === 0
//                                     ? 'bg-gray-400 cursor-not-allowed'
//                                     : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500'
//                                 }`}
//                         >
//                             {processing ? (
//                                 <LoaderCircle className="h-6 w-6 animate-spin mr-2" />
//                             ) : (
//                                 <><ThumbsUp className="h-6 w-6 mr-2" /> Submit My {totalVotesCastByUser} Votes</>
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // Helper Widget for a single candidate voting card (reused from Owner)
// interface CandidateVotingCardProps {
//     candidate: Candidate;
//     currentVotes: number;
//     onVoteChange: (candidateId: number, change: number) => void;
//     canAddVote: boolean;
//     maxVotes: number; // The overall maximum for the voter, not for a single candidate
// }

// function CandidateVotingCard({ candidate, currentVotes, onVoteChange, canAddVote, maxVotes }: CandidateVotingCardProps) {
//     return (
//         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-3 flex flex-col items-center text-center">
//             {candidate.photo ? (
//                 <img src={candidate.photo} alt={candidate.name} className="h-24 w-24 rounded-full object-cover mb-2" />
//             ) : (
//                 <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-500 mb-2">
//                     {candidate.name.charAt(0).toUpperCase()}
//                 </div>
//             )}
//             <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
//             {/* Removed description as it's not in the Candidate interface for this view */}

//             <div className="flex items-center justify-center gap-3 mt-4">
//                 <button
//                     type="button"
//                     onClick={() => onVoteChange(candidate.id, -1)}
//                     disabled={currentVotes <= 0}
//                     className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                 >
//                     <MinusCircle className="h-5 w-5" />
//                 </button>
//                 <span className="text-2xl font-bold text-blue-600 w-10 text-center">{currentVotes}</span>
//                 <button
//                     type="button"
//                     onClick={() => onVoteChange(candidate.id, 1)}
//                     disabled={!canAddVote} // Only disable if no global votes remaining
//                     className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                 >
//                     <PlusCircle className="h-5 w-5" />
//                 </button>
//             </div>
//         </div>
//     );
// }
