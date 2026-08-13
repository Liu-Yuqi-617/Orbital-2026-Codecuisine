import type { Review } from "../types";
import { useNavigate } from "react-router-dom";

function calculateTrustScore(review: Review): number {
    let score = 0;

    // Verified review
    if (review.isVerified) {
        score += 40;
    }

    // Receipt uploaded
    if (review.verification?.imageUrl) {
        score += 20;
    }

    // Detailed review
    if (review.body && review.body.length >= 50) {
        score += 15;
    }

    // Good title
    if (review.title.length >= 10) {
        score += 10;
    }

    // High rating
    const avg =
        (
            review.tasteRating +
            review.valueRating +
            review.ambianceRating
        ) / 3;

    if (avg >= 4) {
        score += 10;
    }

    // User exists
    if (review.user) {
        score += 5;
    }

    return score;
}



function getTrustInfo(score: number) {

    if (score >= 80) {
        return {
            label: "High Trust",
            color: "#2e7d32",
            background: "#e8f5e9",
        };
    }


    if (score >= 60) {
        return {
            label: "Medium Trust",
            color: "#ef6c00",
            background: "#fff3e0",
        };
    }


    return {
        label: "Low Trust",
        color: "#c62828",
        background: "#ffebee",
    };

}



function Stars({
    rating,
}: {
    rating: number;
}) {

    return (
        <span>
            {
                [1, 2, 3, 4, 5].map(
                    (star) => (
                        <span key={star}>
                            {
                                star <= rating
                                    ? "⭐"
                                    : "☆"
                            }
                        </span>
                    )
                )
            }
        </span>
    );

}




export default function ReviewList({

    reviews,

    showRestaurantLink = false,

}: {

    reviews: Review[];

    showRestaurantLink?: boolean;

}) {

    const navigate = useNavigate();

    if (reviews.length === 0) {

        return (

            <div
                style={{
                    textAlign: "center",
                    padding: "50px",
                    background: "white",
                    borderRadius: "16px",
                    color: "#777",
                }}
            >

                <h3>
                    No reviews yet 🍽
                </h3>

                <p>
                    Be the first person to share your experience!
                </p>

            </div>

        );

    }



    return (

        <div
            style={{

                display: "flex",

                flexDirection: "column",

                gap: "24px",

            }}
        >


            {
                reviews.map((review) => {


                    const trustScore =
                        calculateTrustScore(review);


                    const trust =
                        getTrustInfo(trustScore);



                    const overall =
                        (
                            review.tasteRating +
                            review.valueRating +
                            review.ambianceRating
                        ) / 3;



                    return (

                        <div
                            key={review.id}

                            style={{

                                background: "linear-gradient(180deg, #ffffff 0%, #fffdf9 100%)",

                                border: "1px solid #f0ebe4",

                                borderRadius: "20px",

                                padding: "24px",

                                boxShadow:
                                    "0 10px 28px rgba(55, 43, 32, 0.08)",

                                transition:
                                    "transform 0.2s ease, box-shadow 0.2s ease",

                            }}

                            onMouseEnter={
                                (e) =>
                                    {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 16px 36px rgba(55, 43, 32, 0.12)";
                                    }
                            }

                            onMouseLeave={
                                (e) =>
                                    {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 10px 28px rgba(55, 43, 32, 0.08)";
                                    }
                            }

                        >



                            {/* Header */}

                            <div
                                style={{

                                    display: "flex",

                                    justifyContent: "space-between",

                                    alignItems: "center",

                                    flexWrap: "wrap",

                                    gap: "10px",

                                }}
                            >

                                <div>

                                    <h2
                                        style={{

                                            margin: "0",

                                            color: "#2F2A26",

                                            fontSize: "22px",

                                            fontWeight: 800,

                                            letterSpacing: "-0.3px",

                                            lineHeight: 1.25,

                                        }}
                                    >

                                        {
                                            review.restaurant?.name
                                            ||
                                            `Restaurant #${review.restaurantId}`
                                        }

                                    </h2>

                                    {showRestaurantLink && review.restaurantId && (
                                        <button
                                            onClick={() => navigate(`/restaurant/${review.restaurantId}`)}
                                            style={{

                                                marginTop: "8px",

                                                background: "#fff4e8",

                                                border: "1px solid #f3d4b2",

                                                borderRadius: "999px",

                                                color: "#A95312",

                                                fontSize: "13px",

                                                fontWeight: 700,

                                                cursor: "pointer",

                                                padding: "6px 10px",

                                                textDecoration: "none",

                                            }}
                                        >
                                            View Restaurant →
                                        </button>
                                    )}

                                    <div
                                        style={{

                                            marginTop: "10px",

                                            color: "#6B625B",

                                            fontSize: "13px",

                                            fontWeight: 500,

                                        }}
                                    >

                                        {
                                            review.user?.username
                                            ||
                                            "Anonymous"
                                        }

                                    </div>

                                </div>



                                {
                                    review.isVerified

                                        ?

                                        <span
                                            style={{

                                                background: "#e8f5e9",

                                                color: "#2e7d32",

                                                padding: "8px 14px",

                                                borderRadius: "20px",

                                                fontWeight: "bold",

                                                fontSize: "14px",

                                            }}
                                        >

                                            ✓ Verified

                                        </span>

                                        :

                                        <span
                                            style={{

                                                background: "#fff3e0",

                                                color: "#ef6c00",

                                                padding: "8px 14px",

                                                borderRadius: "20px",

                                                fontWeight: "bold",

                                            }}
                                        >

                                            Unverified

                                        </span>

                                }


                            </div>




                            {/* Title */}

                            <h3
                                style={{
                                    marginTop: "22px",
                                    marginBottom: "8px",
                                    color: "#39332E",
                                    fontSize: "19px",
                                    lineHeight: 1.35,
                                }}
                            >

                                {review.title}

                            </h3>



                            {
                                review.body &&

                                <p
                                    style={{
                                        color: "#5D554F",
                                        lineHeight: "1.7",
                                        margin: "0 0 4px",
                                        fontSize: "15px",
                                    }}
                                >

                                    {review.body}

                                </p>
                            }





                            {/* Ratings */}

                            <div
                                style={{

                                    display: "grid",

                                    gridTemplateColumns:
                                        "repeat(3,1fr)",

                                    gap: "12px",

                                    marginTop: "22px",
                                }}
                            >


                                <div
                                    style={{
                                        background: "#faf7f3",
                                        border: "1px solid #eee5dc",
                                        borderRadius: "12px",
                                        padding: "12px 14px",
                                        color: "#4B433D",
                                        fontSize: "13px",
                                        fontWeight: 700,
                                    }}
                                >
                                    Taste
                                    <br />
                                    <Stars
                                        rating={
                                            review.tasteRating
                                        }
                                    />
                                </div>


                                <div
                                    style={{
                                        background: "#faf7f3",
                                        border: "1px solid #eee5dc",
                                        borderRadius: "12px",
                                        padding: "12px 14px",
                                        color: "#4B433D",
                                        fontSize: "13px",
                                        fontWeight: 700,
                                    }}
                                >
                                    Value
                                    <br />
                                    <Stars
                                        rating={
                                            review.valueRating
                                        }
                                    />
                                </div>



                                <div
                                    style={{
                                        background: "#faf7f3",
                                        border: "1px solid #eee5dc",
                                        borderRadius: "12px",
                                        padding: "12px 14px",
                                        color: "#4B433D",
                                        fontSize: "13px",
                                        fontWeight: 700,
                                    }}
                                >
                                    Ambiance
                                    <br />
                                    <Stars
                                        rating={
                                            review.ambianceRating
                                        }
                                    />
                                </div>


                            </div>





                            {/* Overall */}

                            <div
                                style={{
                                    marginTop: "20px",
                                    padding: "12px 14px",
                                    background: "#2F2A26",
                                    color: "#ffffff",
                                    borderRadius: "12px",
                                    fontSize: "17px",
                                    fontWeight: 800,
                                }}
                            >

                                Overall:
                                {" "}
                                {overall.toFixed(1)}
                                /5 ⭐

                            </div>





                            {/* Trust Score */}

                            <div
                                style={{

                                    marginTop: "20px",

                                    padding: "15px",

                                    background: "#f8f6f3",

                                    border: "1px solid #ece7e1",

                                    borderRadius: "14px",

                                }}
                            >

                                <div
                                    style={{

                                        display: "flex",

                                        justifyContent: "space-between",

                                        marginBottom: "8px",

                                    }}
                                >

                                    <strong>
                                        Trust Score
                                    </strong>


                                    <span
                                        style={{

                                            color: trust.color,

                                            background:
                                                trust.background,

                                            padding:
                                                "4px 10px",

                                            borderRadius: "15px",

                                            fontWeight: "bold",
                                        }}
                                    >

                                        {trustScore}/100
                                        {" "}
                                        {trust.label}

                                    </span>


                                </div>


                                <div
                                    style={{

                                        height: "10px",

                                        background: "#e6e1dc",

                                        borderRadius: "10px",

                                    }}
                                >

                                    <div

                                        style={{

                                            width:
                                                `${trustScore}%`,

                                            height: "100%",

                                            background:
                                                trust.color,

                                            borderRadius: "10px",

                                            transition: "width 0.6s ease",

                                        }}

                                    />


                                </div>


                            </div>





                            {/* Verification */}

                            {
                                review.verification &&

                                <div
                                    style={{

                                        marginTop: "20px",

                                        padding: "15px",

                                        background: "#fbfaf8",

                                        border: "1px solid #ece7e1",

                                        borderRadius: "14px",

                                    }}
                                >

                                    <strong>
                                        Receipt Verification
                                    </strong>


                                    <p>
                                        Status:
                                        {" "}
                                        {
                                            review.verification.status
                                        }
                                    </p>


                                    {
                                        review.verification.imageUrl &&

                                        <a
                                            href={
                                                review.verification.imageUrl
                                            }

                                            target="_blank"

                                            rel="noopener noreferrer"

                                        >

                                            View Receipt 📄

                                        </a>

                                    }


                                </div>

                            }





                            {/* Footer */}

                            <div
                                style={{

                                    marginTop: "20px",

                                    paddingTop: "15px",

                                    borderTop:
                                        "1px solid #eee",

                                    color: "#756B63",

                                    display: "flex",

                                    justifyContent: "space-between",

                                    fontSize: "14px",

                                }}
                            >

                                <span>
                                    👤
                                    {" "}
                                    {
                                        review.user?.username
                                        ||
                                        "Anonymous"
                                    }
                                </span>


                                <span>
                                    {
                                        new Date(review.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                    }
                                </span>


                            </div>



                        </div>


                    );

                })
            }


        </div>

    );

}