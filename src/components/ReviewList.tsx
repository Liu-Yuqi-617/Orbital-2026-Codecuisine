export default function ReviewList({
    reviews
}: {
    reviews: any[]
}) {

    return (

        <div>

            {reviews.map((review, index) => (

                <div
                    key={index}
                    style={{
                        border: "1px solid #ddd",
                        padding: "12px",
                        marginBottom: "12px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >

                    <div
                        style={{
                            flex: 1,
                            textAlign: "left",
                        }}
                    >
                        <p style={{ margin: "0", fontSize: "12px", color: "gray" }}>
                            By: {review.user}
                        </p>

                        <h4
                            style={{
                                margin: "0 0 6px 0",
                            }}
                        >
                            {review.title}
                        </h4>

                        <p
                            style={{
                                margin: "2px 0",
                                fontSize: "14px",
                            }}
                        >
                            Taste: {review.taste}
                        </p>

                        <p
                            style={{
                                margin: "2px 0",
                                fontSize: "14px",
                            }}
                        >
                            Value: {review.value}
                        </p>

                        <p
                            style={{
                                margin: "2px 0",
                                fontSize: "14px",
                            }}
                        >
                            Ambiance: {review.ambiance}
                        </p>

                        {review.verified && (
                            <p
                                style={{
                                    marginTop: "6px",
                                    fontSize: "13px",
                                }}
                            >
                                ✅ Certified Authentic
                            </p>
                        )}

                    </div>

                    {review.image && (
                        <img
                            src={review.image}
                            alt={review.title}
                            style={{
                                width: "180px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginLeft: "20px",
                            }}
                        />
                    )}

                </div>

            ))}

        </div>

    );
}