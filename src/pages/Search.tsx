import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FilterPanel from "../components/FilterPanel";
import { searchRestaurants, getCuisineTypes } from "../api";
import type { SimpleRestaurant, SearchRequest } from "../types";
import { useNavigate } from "react-router-dom";

function Search() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [restaurants, setRestaurants] = useState<SimpleRestaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        verifiedOnly: false,
        minRating: 0,
        cuisine: "",
        priceLevel: 0,
    });

    useEffect(() => {
        async function loadCuisines() {
            try {
                const res = await getCuisineTypes();
                setCuisines(res.data || []);
            } catch (err) {
                console.error("Failed to load cuisines:", err);
                setCuisines([]);
            }
        }
        loadCuisines();
    }, []);

    async function getUserLocation(): Promise<{ lat: number; lng: number }> {
        const fallback = { lat: 1.3521, lng: 103.8198 };

        if (!navigator.geolocation) {
            console.warn("Cannot get your location.");
            return fallback;
        }

        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000,
                });
            });
            return {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
        } catch (err) {
            console.warn("Geolocation failed, falling back to Singapore:", err);
            return fallback;
        }
    }

    useEffect(() => {
        handleSearch();
    }, []);

    async function handleSearch() {
        setLoading(true);
        try {
            let { lat, lng } = await getUserLocation();

            if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
                console.warn("Invalid coordinates");
                lat = 1.3521;
                lng = 103.8198;
            }

            const params: SearchRequest = {
                query: keyword || undefined,
                lat,
                lng,
                radius: 50000,
                cuisine: filters.cuisine || undefined,
                price_level: filters.priceLevel || undefined,
                min_score: filters.minRating || undefined,
                verified_only: filters.verifiedOnly,
                sort_by: "trust",
                page: 1,
                page_size: 20,
            };
            const res = await searchRestaurants(params);
            setRestaurants(res.data.restaurants || []);
        } catch (err) {
            console.error("Search failed:", err);
            alert("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />

            <h1

                style={{

                    fontSize: "36px",

                    color: "#2D3436",

                    fontWeight: 800,

                }}

            >

                🔍 Search Reviews

            </h1>

            <p

                style={{

                    color: "#636E72",

                    fontSize: "18px",

                    marginBottom: "5px"

                }}

            >

                Find trusted restaurants based on real experiences.

            </p>

            <input
                type="text"
                placeholder="Search by restaurant name or cuisine..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{

                    width: "100%",

                    height: "45px",

                    fontSize: "16px",

                    padding: "0 15px",

                    borderRadius: "12px",

                    border: "1px solid #E8E1D9",

                    background: "white",

                    color: "#333333",

                    caretColor: "#333333",

                    outline: "none",

                    boxSizing: "border-box",

                    color: "#0e0d0d",
                    
                    caretColor: "#0e0d0d",

                }}
            />

            <button
                onClick={handleSearch}
                disabled={loading}
                style={{

                    marginTop: "10px",

                    padding: "10px 30px",

                    borderRadius: "12px",

                    border: "none",

                    background: "#E67E22",

                    color: "white",

                    fontSize: "16px",

                    fontWeight: 700,

                    cursor: loading ? "not-allowed" : "pointer",

                    opacity: loading ? 0.6 : 1,

                }}
            >
                {loading ? "Searching..." : "Search"}
            </button>

            <br />
            <br />

            <div

                style={{

                    background: "white",

                    padding: "25px",

                    borderRadius: "18px",

                    marginTop: "25px",

                    boxShadow:
                        "0 6px 20px rgba(0,0,0,0.06)"

                }}

            >

                <FilterPanel
                    verifiedOnly={filters.verifiedOnly}
                    setVerifiedOnly={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            verifiedOnly: value,
                        }))
                    }

                    minRating={filters.minRating}
                    setMinRating={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            minRating: value,
                        }))
                    }

                    cuisine={filters.cuisine}
                    setCuisine={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            cuisine: value,
                        }))
                    }

                    cuisines={cuisines}

                    priceLevel={filters.priceLevel}
                    setPriceLevel={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            priceLevel: value,
                        }))
                    }

                />

                <button
                    onClick={handleSearch}
                    style={{

                        marginTop: "20px",

                        padding: "8px 20px",

                        borderRadius: "10px",

                        border: "1px solid #E8E1D9",

                        background: "#E67E22",

                        cursor: "pointer",

                        fontSize: "14px",

                    }}
                >
                    Apply Filters
                </button>
            </div>

            <br />
            <br />

            <div

                style={{
                    display: "grid",

                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",

                    gap: "24px"
                }}

            >

                {restaurants.map((r) => (
                    <div
                        key={r.id}
                        onClick={() => navigate(`/restaurant/${r.place_id || r.id}`)}
                        style={{
                            background: "white",

                            borderRadius: "18px",

                            overflow: "hidden",

                            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",

                            cursor: "pointer",

                        }}

                    >
                        <img
                            src={r.photo_url || "/placeholder.png"}
                            alt={r.name}
                            style={{
                                width: "100%",

                                height: "180px",

                                objectFit: "cover",

                            }}
                        />

                        <div style={{ padding: "20px" }}>
                            <div style={{

                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "start",

                            }}

                            >

                                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{r.name}</h3>

                                {r.verified_review_count > 0 && (
                                    <span style={{

                                        background: "#e8f5e9",

                                        color: "#2e7d32",

                                        padding: "4px 10px",

                                        borderRadius: "12px",

                                        fontSize: "12px",

                                        fontWeight: "bold",

                                    }}>
                                        ✓ Verified
                                    </span>
                                )}
                            </div>

                            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 12px 0" }}>{r.address}</p>

                            <div
                                style={{

                                    display: "flex",

                                    gap: "15px",

                                    fontSize: "14px",

                                    color: "#555",
                                }}

                            >

                                <span>⭐ {r.composite_score.toFixed(1)}</span>
                                <span>🛡 {r.trust_weighted_score.toFixed(1)}</span>
                                <span>📍 {r.distance.toFixed(1)}m</span>

                            </div>

                            <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                                <span style={{

                                    background: "#F0E8DE",

                                    padding: "4px 10px",

                                    borderRadius: "10px",

                                    fontSize: "13px",

                                }}>
                                    {r.cuisine_type || "Unknown"}
                                </span>
                                <span style={{

                                    background: "#FFF3E0",

                                    padding: "4px 10px",

                                    borderRadius: "10px",

                                    fontSize: "13px",

                                }}>
                                    {"$".repeat(r.price_level || 1)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && restaurants.length === 0 && (
                <div style={{

                    textAlign: "center",

                    padding: "60px",

                    color: "#777",

                }}>
                    <h3>No restaurants found 🔍</h3>
                    <p>Try adjusting your filters or search keywords.</p>
                </div>
            )}
        </div>
    );
}

export default Search;