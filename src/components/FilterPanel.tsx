function FilterPanel({
    verifiedOnly,
    setVerifiedOnly,
    minRating,
    setMinRating,
    cuisine,
    setCuisine,
    priceLevel,
    setPriceLevel,
    cuisines,
}: {
    verifiedOnly: boolean;
    setVerifiedOnly: (value: boolean) => void;
    minRating: number;
    setMinRating: (value: number) => void;
    cuisine: string;
    setCuisine: (value: string) => void;
    priceLevel: number;
    setPriceLevel: (value: number) => void;
    cuisines: string[];
}) {
    return (
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>

            <label>
                <input
                    type="checkbox"
                    checked={verifiedOnly}
                    style={{ marginLeft: "10px", width: "50px" }}
                    onChange={(e) =>
                        setVerifiedOnly(e.target.checked)
                    }
                />
                Verified Reviews Only
            </label>

            <label>
                Minimum Rating:
                <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    style={{ marginLeft: "5px", width: "30px" }}
                    value={minRating}
                    onChange={(e) =>
                        setMinRating(Number(e.target.value))
                    }
                />
            </label>

            <label>
                Cuisine:
                <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ padding: "4px 8px" }}
                >
                    <option value="">All Cuisines</option>
                    {(Array.isArray(cuisines) ? cuisines : []).map((c) => (
                        <option key={c} value={c}>
                            {String(c).charAt(0).toUpperCase() + String(c).slice(1)}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Price:
                <select
                    value={priceLevel}
                    onChange={(e) => setPriceLevel(parseInt(e.target.value))}
                    style={{ padding: "4px 8px" }}
                >
                    <option value={0}>Any</option>
                    <option value={1}>$</option>
                    <option value={2}>$$</option>
                    <option value={3}>$$$</option>
                    <option value={4}>$$$$</option>
                </select>
            </label>

        </div>
    );
}

export default FilterPanel;