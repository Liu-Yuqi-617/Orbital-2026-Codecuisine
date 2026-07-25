import { useState } from "react";
import Navbar from "../components/Navbar";
import FilterPanel from "../components/FilterPanel";

function Search() {
    const [keyword, setKeyword] = useState("");

    const [filters, setFilters] = useState({
        verifiedOnly: false,
        minRating: 1,
        cuisine: "",
        priceLevel: 0,
    });

    const cuisines = [
        "Chinese",
        "Japanese",
        "Korean",
        "Western",
        "Italian",
        "Indian",
        "Thai",
    ];

    function handleSearch() {
        console.log("Search clicked with:", {
            keyword,
            verifiedOnly: filters.verifiedOnly,
            minRating: filters.minRating,
            cuisine: filters.cuisine,
            priceLevel: filters.priceLevel,
        });

        // Future:
        // axios.get("/reviews/search", {
        //     params: {
        //         keyword,
        //         verifiedOnly: filters.verifiedOnly,
        //         minRating: filters.minRating,
        //         cuisine: filters.cuisine,
        //         priceLevel: filters.priceLevel,
        //     },
        // });
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

                    fontSize: "18px"

                }}

            >

                Find trusted restaurants based on real experiences.

            </p>

            <input
                type="text"
                placeholder="Search reviews..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{

                    width: "100%",

                    height: "45px",

                    fontSize: "16px",

                    padding: "0 15px",

                    borderRadius: "12px",

                    border: "1px solid #E8E1D9",

                    background: "white",

                    outline: "none",

                    boxSizing: "border-box",

                    color: "#0e0d0d",
                    
                    caretColor: "#0e0d0d",

                }}
            />

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

                    priceLevel={filters.priceLevel}
                    setPriceLevel={(value) =>
                        setFilters((prev) => ({
                            ...prev,
                            priceLevel: value,
                        }))
                    }

                    cuisines={cuisines}
                />
            </div>

            <br />
            <br />

            <button
                onClick={handleSearch}
                style={{

                    marginTop: "25px",

                    padding: "14px 35px",

                    fontSize: "17px",

                    borderRadius: "12px",

                    border: "none",

                    background: "#E67E22",

                    color: "white",

                    fontWeight: 700,

                    cursor: "pointer",

                }}
            >
                Search
            </button>
        </div>
    );
}

export default Search;