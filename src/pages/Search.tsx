import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import FilterPanel from "../components/FilterPanel";
import { searchRestaurants, getCuisineTypes } from "../api";
import type { SearchRequest, SimpleRestaurant } from "../types";

function Search() {

    const [keyword, setKeyword] = useState("");
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [minRating, setMinRating] = useState(1);
    const [cuisine, setCuisine] = useState("");
    const [priceLevel, setPriceLevel] = useState(0);
    const [sortBy, setSortBy] = useState<"trust" | "composite" | "distance" | "popularity">("trust");
    const [restaurants, setRestaurants] = useState<SimpleRestaurant[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [cuisines, setCuisines] = useState<string[]>([]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setUserLocation({ lat: 1.2913, lng: 103.8516 }); // where City Hall is.
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                setLocationError("Unable to retrieve your location, using default location");
                setUserLocation({ lat: 1.2913, lng: 103.8516 });
            }
        );
    }, []);

    useEffect(() => {
        getCuisineTypes()
            .then((res) => {
                const data = res.data;
                const list = Array.isArray(data) ? data : data.cuisines ?? [];
                setCuisines(list)
            })
            .catch((err) => {
                console.error("Failed to load cuisines:", err);
                setCuisines([]);
            });
    }, []);

    const doSearch = (nextPage: number | null) => {
        if (!userLocation) {
            setError("Waiting for location...");
            return;
        }

        setIsLoading(true);
        setError(null);

        if (!nextPage) {
            setPage(1);
        }

        const params: SearchRequest = {
            query: keyword || undefined,
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 5000,
            verified_only: verifiedOnly || undefined,
            min_score: minRating > 1 ? minRating : undefined,
            cuisine: cuisine || undefined,
            price_level: priceLevel > 0 ? priceLevel : undefined,
            sort_by: sortBy,
            page: nextPage || 1,
            page_size: 10,
        };

        searchRestaurants(params)
            .then((res) => {
                const list = res.data.restaurants ?? [];
                const totalCount = res.data.total ?? list.length;

                if (nextPage) {
                    setRestaurants((prev) => [...prev, ...list]);
                    setPage(nextPage);
                } else {
                    setRestaurants(list);
                    setTotal(totalCount);
                }
            })
            .catch((err: any) => {
                setError(err.response?.data?.message || err.message || "Search failed");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSearch = () => {
        doSearch(null);
    };

    const handleLoadMore = () => {
        if (!userLocation || isLoading || restaurants.length >= total) return;
        doSearch(page + 1);
    };

    useEffect(() => {
        if (userLocation) {
            doSearch(null);
        }
    }, [userLocation]);

    return (

        <div>
            <Navbar />

            {locationError && (
                <div style={{ color: "yellow", marginBottom: "10px" }}>
                    Warning: {locationError}
                </div>
            )}

            {!userLocation && (
                <div style={{ color: "blue", marginBottom: "10px" }}>
                    Getting your location...
                </div>
            )}

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "20px" }}>

                <input
                    type="text"
                    placeholder="Search reviews..."
                    style={{
                        width: "500px",
                        height: "20px",
                        fontSize: "16px",
                        padding: "10px 15px",
                        backgroundColor: "#2a2a3e",
                        color: "#ffffff",
                        border: "1px solid #444",
                    }}
                    value={keyword}
                    onChange={(e) =>
                        setKeyword(e.target.value)
                    }
                    onKeyDown={(e) =>
                        e.key === "Enter" && handleSearch()
                    }
                />

                <button
                    onClick={handleSearch}
                    disabled={isLoading || !userLocation}
                    style={{
                        padding: "10px 30px",
                        fontSize: "16px",
                        color: "white",
                        backgroundColor: "#1976d2",
                        border: "none",
                        cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                >
                    {isLoading ? "Searching..." : "Search"}
                </button>
            </div>

            <div style={{ marginBottom: "20px" }}>

                <label>
                    Sort by:
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        style={{ padding: "5px 10px", fontSize: "16px" }}
                    >
                        <option value="trust">Most Trusted</option>
                        <option value="composite">Best Rated</option>
                        <option value="distance">Nearest</option>
                        <option value="popularity">Most Popular</option>
                    </select>
                </label>
            </div>

            <FilterPanel
                verifiedOnly={verifiedOnly}
                setVerifiedOnly={setVerifiedOnly}
                minRating={minRating}
                setMinRating={setMinRating}
                cuisine={cuisine}
                setCuisine={setCuisine}
                priceLevel={priceLevel}
                setPriceLevel={setPriceLevel}
                cuisines={cuisines}
            />

            {error && (
                <div style={{ color: "red", marginBottom: "20px" }}>
                    {error}
                </div>
            )}

            {restaurants.length > 0 && (
                <div style={{ color: "#666", marginBottom: "15px" }}>
                    Found {total} restaurants (showing {restaurants.length})
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "20px",
                }}
            >
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        style={{
                            border: "1px solid #444",
                            backgroundColor: "#2a2a3e",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={restaurant.photo_url || "/placeholder.png"}
                            alt={restaurant.name}
                            style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                            }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.png";
                            }}
                        />

                        <div style={{ padding: "15px" }}>
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "20px" }}>
                                {restaurant.name}
                            </h3>

                            <p
                                style={{
                                    margin: "0 0 10px 0",
                                    color: "#666",
                                    fontSize: "15px",
                                }}
                            >
                                {restaurant.address}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "15px",
                                    flexWrap: "wrap",
                                    marginBottom: "10px",
                                    fontSize: "15px",
                                }}
                            >
                                <span title="Composite Score">
                                    {(restaurant.composite_score ?? 0).toFixed(1)}
                                </span>
                                <span title="Trust Weighted Score" style={{ color: "#35a950" }}>
                                    {(restaurant.trust_weighted_score ?? 0).toFixed(1)}
                                </span>
                                <span title="Distance" style={{ color: "#5c82bc" }}>
                                    {(restaurant.distance ?? 0).toFixed(0)}m
                                </span>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "5px",
                                    fontSize: "12px",
                                    color: "#888",
                                    marginBottom: "10px",
                                }}
                            >
                                <div>Taste: {(restaurant.avg_taste ?? 0).toFixed(1)}</div>
                                <div>Value: {(restaurant.avg_value ?? 0).toFixed(1)}</div>
                                <div>Ambiance: {(restaurant.avg_ambiance ?? 0).toFixed(1)}</div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                    marginBottom: "10px",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#1976d2",
                                        padding: "2px 8px",
                                        fontSize: "12px",
                                    }}
                                >
                                    {restaurant.cuisine_type}
                                </span>
                                <span
                                    style={{
                                        color: "#f57c00",
                                        padding: "2px 8px",
                                        fontSize: "12px",
                                    }}
                                >
                                    {"$".repeat(restaurant.price_level)}
                                </span>
                                {restaurant.verified_review_count > 0 && (
                                    <span
                                        style={{
                                            color: "#388e3c",
                                            padding: "2px 8px",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {restaurant.verified_review_count} verified
                                    </span>
                                )}
                            </div>

                            <p style={{ fontSize: "12px", color: "#999" }}>
                                {restaurant.total_review_count} reviews
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {restaurants.length > 0 && restaurants.length < total && (
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        style={{
                            padding: "12px 40px",
                            fontSize: "16px",
                            color: "white",
                            backgroundColor: "#1976d2",
                            border: "none",
                            cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        {isLoading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}

            {!isLoading && restaurants.length === 0 && !error && userLocation && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#999",
                    }}
                >
                    <h2>No restaurants found</h2>
                    <p>Try adjusting your search criteria</p>
                </div>
            )}
        </div>
    );
}

export default Search;