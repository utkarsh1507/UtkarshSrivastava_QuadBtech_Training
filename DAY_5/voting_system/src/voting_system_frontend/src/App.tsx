import React, { useState, useEffect } from 'react';
import { Proposal, Vote, ProposalStatus } from './declarations/voting_system_backend/voting_system_backend.did';
import { voting_system_backend } from './declarations/voting_system_backend';

function App() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [newProposal, setNewProposal] = useState({ title: '', description: '', duration: 3600 });
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [results, setResults] = useState<[Vote, bigint][] | null>(null);

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        try {
            const activeProposals = await voting_system_backend.get_active_proposals();
            setProposals(activeProposals);
        } catch (error) {
            console.error('Error loading proposals:', error);
        }
    };

    const handleCreateProposal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProposal.title.trim()) return;

        try {
            await voting_system_backend.create_proposal(
                newProposal.title,
                newProposal.description,
                BigInt(newProposal.duration)
            );
            setNewProposal({ title: '', description: '', duration: 3600 });
            loadProposals();
        } catch (error) {
            console.error('Error creating proposal:', error);
        }
    };

    const handleVote = async (proposalId: bigint, vote: Vote) => {
        try {
            await voting_system_backend.vote(proposalId, vote);
            loadProposalResults(proposalId);
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const loadProposalResults = async (proposalId: bigint) => {
        try {
            const results = await voting_system_backend.get_proposal_results(proposalId);
            setResults(results || null);
        } catch (error) {
            console.error('Error loading results:', error);
        }
    };

    const formatTime = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleString();
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Decentralized Voting System</h1>

            <form onSubmit={handleCreateProposal} className="mb-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Proposal title"
                        value={newProposal.title}
                        onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <textarea
                        placeholder="Description"
                        value={newProposal.description}
                        onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Duration in seconds"
                        value={newProposal.duration}
                        onChange={(e) => setNewProposal({ ...newProposal, duration: parseInt(e.target.value) })}
                        className="p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Create Proposal
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Active Proposals</h2>
                {proposals.map((proposal) => (
                    <div
                        key={Number(proposal.id)}
                        className="bg-white p-6 rounded-lg shadow"
                    >
                        <h3 className="text-xl font-semibold mb-2">{proposal.title}</h3>
                        <p className="text-gray-600 mb-4">{proposal.description}</p>
                        <div className="text-sm text-gray-500 mb-4">
                            <p>Created: {formatTime(proposal.created_at)}</p>
                            <p>Ends: {formatTime(proposal.end_time)}</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleVote(proposal.id, Vote.Yes)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Vote Yes
                            </button>
                            <button
                                onClick={() => handleVote(proposal.id, Vote.No)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Vote No
                            </button>
                            <button
                                onClick={() => handleVote(proposal.id, Vote.Abstain)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Abstain
                            </button>
                        </div>

                        {results && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Current Results:</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {results.map(([vote, count]) => (
                                        <div key={vote} className="text-center">
                                            <span className="font-medium">{vote}:</span> {count.toString()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App; 