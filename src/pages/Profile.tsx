import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyReviews } from "../api";
import Navbar from "../components/Navbar";


interface Restaurant {
    id: number;
    name: string;
}

interface Review {
    id: number;
    restaurantId: number;
    restaurant?: Restaurant;
    title: string;
    tasteRating: number;
    valueRating: number;
    ambianceRating: number;
    isVerified: boolean;
    createdAt: string;
}

interface User {
    username: string;
    email: string;
    createdAt: string;
    trustScore: number;
}

interface Stats {
    totalReviews: number;
    verifiedReviews: number;
    verificationRate: number;
    avgRating: number;
}

interface TrustLevel {
    label: string;
    color: string;
    icon: string;
}

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalReviews: 0,
        verifiedReviews: 0,
        verificationRate: 0,
        avgRating: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await getMyReviews();
                const myReviews: Review[] = res.data;
                setReviews(myReviews);

                let verifiedCount = 0;
                let totalRatingSum = 0;

                for (let i = 0; i < myReviews.length; i++) {
                    const r = myReviews[i];
                    if (r.isVerified) {
                        verifiedCount += 1;
                    }
                    totalRatingSum += (r.tasteRating + r.valueRating + r.ambianceRating) / 3;
                }

                const totalCount = myReviews.length;

                const avgOverall = totalCount > 0 ? totalRatingSum / totalCount : 0;
                const rate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

                setStats({
                    totalReviews: totalCount,
                    verifiedReviews: verifiedCount,
                    verificationRate: rate,
                    avgRating: avgOverall,
                });
            } catch (err) {
                console.error("Failed to load review stats:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, []);

    const getTrustLevel = (score: number): TrustLevel => {
        if (score >= 80) {
            return { label: "Expert Critic", color: "#4caf50", icon: "🏆" };
        }
        if (score >= 60) {
            return { label: "Trusted Reviewer", color: "#2196f3", icon: "⭐" };
        }
        if (score >= 40) {
            return { label: "Regular User", color: "#ff9800", icon: "👤" };
        }
        return { label: "Newcomer", color: "#9e9e9e", icon: "🌱" };
    };

    const trustScore = (user as User | null)?.trustScore ?? 0;
    const trustLevel = getTrustLevel(trustScore);

    const username = (user as User | null)?.username ?? "";
    const email = (user as User | null)?.email ?? "";
    const joinedDate = (user as User | null)?.createdAt
        ? new Date((user as User).createdAt).toLocaleDateString()
        : "N/A";

    return (
        <div className="profile-container">
            <Navbar />

            <div className="profile-header">
                <h1>My Profile</h1>
                <button
                    className="logout-btn"
                    onClick={() => {
                        logout();
                        navigate("/login");
                    }}
                >
                    🚪 Logout
                </button>
            </div>

            {isLoading ? (
                <div className="loading-container">
                    <p>Loading your profile...</p>
                </div>
            ) : (
                <div className="profile-grid">
                    <div className="profile-card" style={{ textAlign: "center" }}>
                        <div className="avatar">
                            {trustLevel.icon}
                        </div>

                        <h2>{username}</h2>

                        <div
                            className="trust-badge"
                            style={{
                                color: trustLevel.color,
                            }}
                        >
                            {trustLevel.label}
                        </div>

                        <p className="email-text">{email}</p>
                        <p className="joined-text">Joined: {joinedDate}</p>
                    </div>

                    <div className="profile-card">
                        <h3>Trust Score</h3>

                        <div className="trust-section">
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${trustScore}%`,
                                    }}
                                >
                                </div>
                                <div className="progress-bar-text">
                                    {trustScore} / 100
                                </div>
                            </div>

                            <div className="stats-grid">
                                <StatCard
                                    label="Total Reviews"
                                    value={stats.totalReviews}
                                    icon="📝"
                                />
                                <StatCard
                                    label="Verified Reviews"
                                    value={stats.verifiedReviews}
                                    icon="✅"
                                />
                                <StatCard
                                    label="Verification Rate"
                                    value={`${stats.verificationRate}%`}
                                    icon="📊"
                                />
                                <StatCard
                                    label="Avg Rating Given"
                                    value={stats.avgRating.toFixed(1)}
                                    icon="⭐"
                                />
                            </div>
                        </div>

                        <div className="trust-tips">
                            <strong>How to improve your trust score:</strong>
                            <ul>
                                <li>Write more reviews (+base points)</li>
                                <li>Upload receipt photos for verification (+40% bonus)</li>
                                <li>Use GPS check-in when visiting (+diversity bonus)</li>
                                <li>Higher trust = your reviews carry more weight!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}
