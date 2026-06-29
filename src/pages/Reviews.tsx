import { useState, useEffect } from "react";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createReview, getMyReviews, uploadReceipt } from "../api";
import type { Review, CreateReviewRequest } from "../types";

interface ReviewFormData {
  restaurantId: number;
  title: string;
  body: string;
  tasteRating: number;
  valueRating: number;
  ambianceRating: number;
  receipt?: File;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  async function loadReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyReviews();
      setReviews(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function addReview(reviewData: ReviewFormData) {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!reviewData.restaurantId || reviewData.restaurantId <= 0) {
      alert("Please select a restaurant");
      return;
    }

    if (reviewData.title.trim() === "") {
      alert("Title is required");
      return;
    }

    setSubmitLoading(true);

    try {
      const reviewLoad: CreateReviewRequest = {
        restaurantId: reviewData.restaurantId,
        tasteRating: reviewData.tasteRating,
        valueRating: reviewData.valueRating,
        ambianceRating: reviewData.ambianceRating,
        title: reviewData.title,
        body: reviewData.body || "",
      };

      const res = await createReview(reviewLoad);
      const newReview = res.data;

      if (reviewData.receipt) {
        try {
          await uploadReceipt(newReview.id, reviewData.receipt);
          newReview.isVerified = true;
        } catch (uploadErr: any) {
          console.error("Receipt upload failed:", uploadErr);
          alert("Review created, but receipt upload failed. You can upload it later.");
        }
      }

      setReviews((prev) => [newReview, ...prev]);

      await loadReviews();

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to submit review";
      alert(msg);
      setError(msg);
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "900px", padding: "20px" }}>
      <Navbar />
      <h1>Restaurant Reviews</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "12px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        <h3>Rating Guide</h3>
        <p><strong>Taste</strong> – How good the food tastes.</p>
        <p><strong>Value</strong> – Whether the food is worth the price.</p>
        <p><strong>Ambiance</strong> – The atmosphere, cleanliness, and dining experience.</p>
        <p><em>Tip: Upload a receipt photo to verify your visit and boost your trust score!</em></p>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>Write a Review</h2>
        <ReviewForm addReview={addReview} isLoading={submitLoading} />
      </div>

      {error && (
        <div
          style={{
            color: "red",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <h2>My Reviews ({reviews.length})</h2>
        {isLoading ? (
          <p>Loading reviews...</p>
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </div>
    </div>
  );
}