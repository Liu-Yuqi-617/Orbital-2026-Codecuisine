import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Navbar from "../components/Navbar";
import { createReview, getMyReviews, uploadReceipt } from "../api";
import type { Review, CreateReviewRequest } from "../types";


export default function Reviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  useEffect(() => {
    loadMyReviews();
  }, []);

  async function loadMyReviews() {
    try {
      const res = await getMyReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  }

  async function addReview(reviewData: {
    restaurantId: number;
    title: string;
    body: string;
    taste: number;
    value: number;
    ambiance: number;
    receipt?: File;
  }) {
    try {
      setIsLoading(true);

      const createData: CreateReviewRequest = {
        restaurantId: reviewData.restaurantId,
        tasteRating: reviewData.taste,
        valueRating: reviewData.value,
        ambianceRating: reviewData.ambiance,
        title: reviewData.title,
        body: reviewData.body,
      };

      const res = await createReview(createData);
      const newReview: Review = res.data;

      if (reviewData.receipt && newReview.id) {
        try {
          await uploadReceipt(newReview.id, reviewData.receipt);
          newReview.isVerified = true;
        } catch (err) {
          console.error("Receipt upload failed:", err);
          alert("Review submitted but receipt upload failed.");
        }
      }

      await loadMyReviews();
      alert("Review submitted successfully!");

      navigate(`/restaurant/${reviewData.restaurantId}`);

    } catch (err: any) {
      console.error("Failed to submit review:", err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  }

  return (

    <>

      <Navbar />

      <div

        style={{

          minHeight: "100vh",

          background: "#F8F5F0",

          padding: "40px 20px",

        }}

      >

        <div

          style={{

            maxWidth: "1000px",

            margin: "0 auto",

          }}

        >

          {/* Hero */}

          <div
            style={{
              marginBottom: "40px",
            }}
          >

            <h1
              style={{

                fontSize: "38px",

                marginBottom: "12px",

                color: "#2D3436",

                fontWeight: 800,

                letterSpacing: "-0.5px",

              }}
            >
              🍽 My Reviews
            </h1>

            <p
              style={{

                color: "#2D3436",

                fontSize: "19px",

                fontWeight: 500,

                lineHeight: "1.6",

              }}
            >
              Manage your dining experiences and verifications.
            </p>

          </div>

          {/* Review Form */}

          <section>

            <h2
              style={{

                fontSize: "28px",

                marginBottom: "15px",

                color: "#2D3436"

              }}
            >

              ✍️ Write a Review

            </h2>

            <ReviewForm

              addReview={
                addReview
              }

              isLoading={
                isLoading
              }

            />

          </section>

          {/* Trust Guide */}

          <div

            style={{

              background: "white",

              padding: "25px",

              borderRadius: "18px",

              marginTop: "35px",

              boxShadow:
                "0 4px 15px rgba(0,0,0,0.06)",

            }}

          >

            <h2
              style={{

                fontSize: "28px",

                marginBottom: "15px",

                color: "#2D3436",

              }}
            >

              🛡 Trust Score System

            </h2>

            <p>
              Reviews are ranked based on
              authenticity and detail.
            </p>

            <div

              style={{

                display: "grid",

                gridTemplateColumns:
                  "repeat(3,1fr)",

                gap: "15px",

              }}

            >

              <div>
                ✅ Verified Visit
                <br />
                +40 points
              </div>

              <div>
                📷 Receipt Upload
                <br />
                +20 points
              </div>

              <div
              >
                ✍️ Detailed Review
                <br />
                +15 points
              </div>

              <div
              >
                ⭐ High Rating
                <br />
                +10 points
              </div>

              <div>
                👤 Registered User
                <br />
                +5 points
              </div>

            </div>

          </div>

          {/* Reviews */}

          <section

            style={{

              marginTop: "45px",

            }}

          >


            <h2
              style={{
                fontSize: "28px",
                marginBottom: "15px",
                color: "#2D3436"
              }}
            >

              🌟 My Reviews

            </h2>

            <ReviewList

              reviews={
                reviews
              }

            />

          </section>

        </div>

      </div>

    </>

  );

}