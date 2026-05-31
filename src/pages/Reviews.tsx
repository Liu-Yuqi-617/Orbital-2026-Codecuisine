import { useState } from "react";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();


  function addReview(review: any) {
    setReviews([
      ...reviews,
      {
        ...review,
        user: user?.username || "guest"
      }
    ]);
  }

  return (
    <div>
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
      </div>

      <ReviewForm addReview={addReview} />

      <ReviewList reviews={reviews} />
    </div>
  );
}