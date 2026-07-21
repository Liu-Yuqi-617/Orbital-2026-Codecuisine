import type { Review } from "../types";


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
    rating:number;
}) {

    return (
        <span>
            {
                [1,2,3,4,5].map(
                    (star)=>(
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
}:{
    reviews:Review[];
}) {


    if(reviews.length===0){

        return (

            <div
                style={{
                    textAlign:"center",
                    padding:"50px",
                    background:"white",
                    borderRadius:"16px",
                    color:"#777",
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
                display:"flex",
                flexDirection:"column",
                gap:"24px",
            }}
        >


        {
            reviews.map((review)=>{


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

                        background:"#ffffff",

                        borderRadius:"18px",

                        padding:"24px",

                        boxShadow:
                            "0 6px 20px rgba(0,0,0,0.08)",

                        transition:
                            "transform 0.2s",

                    }}

                    onMouseEnter={
                        (e)=>
                            e.currentTarget.style.transform
                            ="translateY(-4px)"
                    }

                    onMouseLeave={
                        (e)=>
                            e.currentTarget.style.transform
                            ="translateY(0)"
                    }

                >



                    {/* Header */}

                    <div
                        style={{
                            display:"flex",
                            justifyContent:"space-between",
                            alignItems:"center",
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    margin:"0",
                                    fontSize:"22px",
                                }}
                            >

                            {
                                review.restaurant?.name
                                ||
                                `Restaurant #${review.restaurantId}`
                            }

                            </h2>


                            <div
                                style={{
                                    marginTop:"8px",
                                    color:"#777",
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
                                    background:"#e8f5e9",
                                    color:"#2e7d32",
                                    padding:"8px 14px",
                                    borderRadius:"20px",
                                    fontWeight:"bold",
                                    fontSize:"14px",
                                }}
                            >

                            ✓ Verified

                            </span>

                            :

                            <span
                                style={{
                                    background:"#fff3e0",
                                    color:"#ef6c00",
                                    padding:"8px 14px",
                                    borderRadius:"20px",
                                    fontWeight:"bold",
                                }}
                            >

                            Unverified

                            </span>

                        }


                    </div>




                    {/* Title */}

                    <h3
                        style={{
                            marginTop:"20px",
                        }}
                    >

                        {review.title}

                    </h3>



                    {
                        review.body &&

                        <p
                            style={{
                                color:"#555",
                                lineHeight:"1.6",
                            }}
                        >

                            {review.body}

                        </p>
                    }





                    {/* Ratings */}

                    <div
                        style={{
                            display:"grid",
                            gridTemplateColumns:
                                "repeat(3,1fr)",

                            gap:"15px",

                            marginTop:"20px",
                        }}
                    >


                        <div>
                            Taste
                            <br/>
                            <Stars
                                rating={
                                    review.tasteRating
                                }
                            />
                        </div>


                        <div>
                            Value
                            <br/>
                            <Stars
                                rating={
                                    review.valueRating
                                }
                            />
                        </div>



                        <div>
                            Ambiance
                            <br/>
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
                            marginTop:"20px",
                            fontSize:"18px",
                            fontWeight:"bold",
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
                            marginTop:"20px",
                            padding:"15px",
                            background:"#fafafa",
                            borderRadius:"12px",
                        }}
                    >

                        <div
                            style={{
                                display:"flex",
                                justifyContent:"space-between",
                                marginBottom:"8px",
                            }}
                        >

                            <strong>
                                Trust Score
                            </strong>


                            <span
                                style={{
                                    color:trust.color,
                                    background:
                                        trust.background,

                                    padding:
                                        "4px 10px",

                                    borderRadius:"15px",

                                    fontWeight:"bold",
                                }}
                            >

                                {trustScore}/100
                                {" "}
                                {trust.label}

                            </span>


                        </div>


                        <div
                            style={{
                                height:"10px",
                                background:"#ddd",
                                borderRadius:"10px",
                            }}
                        >

                            <div

                                style={{

                                    width:
                                        `${trustScore}%`,

                                    height:"100%",

                                    background:
                                        trust.color,

                                    borderRadius:"10px",

                                }}

                            />


                        </div>


                    </div>





                    {/* Verification */}

                    {
                        review.verification &&

                        <div
                            style={{
                                marginTop:"20px",
                                padding:"15px",
                                background:"#f8f9fa",
                                borderRadius:"12px",
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
                            marginTop:"20px",
                            paddingTop:"15px",
                            borderTop:
                                "1px solid #eee",

                            color:"#888",

                            display:"flex",
                            justifyContent:"space-between",

                            fontSize:"14px",
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
                                new Date(
                                    review.createdAt
                                ).toLocaleDateString()
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