function FilterPanel({
    verifiedOnly,
    setVerifiedOnly,
    minRating,
    setMinRating,
}: {
    verifiedOnly: boolean;
    setVerifiedOnly: (value: boolean)=> void;
    minRating: number;
    setMinRating: (value: number) => void;
}) {
    return (
        <div>
            
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

            <br />
            <br />

            <label> 

                Minimum Rating:
                <input
                    type="number"
                    min="1"
                    max="5"
                    style={{ marginLeft: "10px", width: "50px" }}
                    value={minRating}
                    onChange={(e) =>
                        setMinRating(Number(e.target.value))
                    }
                />
            </label>

        </div>
    );
}
export default FilterPanel;