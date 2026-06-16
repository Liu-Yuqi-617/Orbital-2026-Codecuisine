import { useState } from "react";
import Navbar from "../components/Navbar";
import FilterPanel from "../components/FilterPanel";


function Search() {

    const [keyword, setKeyword] = useState("");


    const [filters, setFilters] = useState({
        verifiedOnly: false,
        minRating: 1
    });

    function handleSearch() {
        console.log("Search clicked with:", {
            keyword,
            verifiedOnly: filters.verifiedOnly,
            minRating: filters.minRating
        });
    }

    return (

        <div>
            <Navbar />

            <input
                type="text"
                placeholder="Search reviews..."
                style={{
                    width: "500px",
                    height: "20px",
                    fontSize: "16px",
                    padding: "10px 15px"
                }}
                value={keyword}
            onChange={(e) =>
                setKeyword(e.target.value)
            }
            />

            <br />
            <br />

            <FilterPanel
                verifiedOnly={filters.verifiedOnly}
                setVerifiedOnly={
                    (value) =>
                        setFilters((prev) => ({
                            ...prev,
                            verifiedOnly: value
                        }))
                }
                minRating={filters.minRating}
                setMinRating={
                    (value) =>
                        setFilters((prev) => ({
                            ...prev,
                            minRating: value
                        }))
                }
            />

            <br />
            <br />

            <button onClick={handleSearch}
                style={{
                    padding: "10px 20px",
                    fontSize: "20px"
                }}
            >
                Search
            </button>

        </div>
    );

}
export default Search;