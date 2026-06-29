import type { Review } from "../types";

export default function ReviewList({
    reviews,
}: {
    reviews: Review[];
}) {

    if (reviews.length === 0) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999",
                    border: "2px dashed #ddd",
                }}
            >
                <p>No reviews yet. Write your first review now!</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reviews.map((review) => (
                <div
                    key={review.id}
                    style={{
                        border: "1px solid #e0e0e0",
                        padding: "16px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: "16px" }}>
                            {review.restaurant?.name || `Restaurant #${review.restaurantId}`}
                        </h3>
                        {review.isVerified ? (
                            <span
                                style={{
                                    color: "#388e3c",
                                    padding: "2px 8px",
                                    fontSize: "12px",
                                }}
                            >
                                Verified
                            </span>
                        ) : (
                            <span
                                style={{
                                    color: "#f57c00",
                                    padding: "2px 8px",
                                    fontSize: "12px",
                                }}
                            >
                                Unverified
                            </span>
                        )}
                    </div>

                    <h4 style={{ margin: "0 0 8px 0" }}>{review.title}</h4>

                    {review.body && (
                        <p style={{ margin: "0 0 12px 0", color: "#555", lineHeight: "1.5" }}>
                            {review.body}
                        </p>
                    )}

                    <div
                        style={{
                            display: "flex",
                            gap: "20px",
                            marginBottom: "10px",
                            fontSize: "14px",
                        }}
                    >
                        <span>Taste: {review.tasteRating}/5</span>
                        <span>Value: {review.valueRating}/5</span>
                        <span>Ambiance: {review.ambianceRating}/5</span>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <strong>
                            Overall:{" "}
                            {((review.tasteRating + review.valueRating + review.ambianceRating) / 3).toFixed(1)}
                            /5
                        </strong>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            fontSize: "12px",
                            color: "#999",
                            borderTop: "1px solid #eee",
                            paddingTop: "10px",
                        }}
                    >
                        <span>{review.user?.username || "Anonymous"}</span>
                        <span>
                            {new Date(review.createdAt).toLocaleDateString()}
                            {review.updatedAt !== review.createdAt && " (edited)"}
                        </span>
                    </div>

                    {review.verification && (
                        <div
                            style={{
                                marginTop: "10px",
                                padding: "8px",
                                fontSize: "12px",
                            }}
                        >
                            <strong>Verification:</strong> {review.verification.type} –{" "}
                            {review.verification.status}
                            {review.verification.imageUrl && (
                                <div style={{ marginTop: "5px" }}>
                                    <a
                                        href={review.verification.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#007bff" }}
                                    >
                                        View Receipt
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}