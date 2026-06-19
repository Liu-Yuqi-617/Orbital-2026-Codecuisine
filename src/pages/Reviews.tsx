import { useState } from "react";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();

  async function addReview(review: any) {
    if (review.orderID.trim() === "") {
      alert("Order ID is required for verification");
      return;
    }

    const formData = new FormData();

    formData.append("orderID", review.orderID);
    formData.append("title", review.title);
    formData.append("taste", review.taste);
    formData.append("value", review.value);
    formData.append("ambiance", review.ambiance);

    if (review.image) {
      formData.append("image", review.image);
    }

    formData.append("email", user?.email || "anonymous");

    try {
      const res = await fetch("http://localhost:3001/api/review", // should be backend URL
        {
          method: "POST",
          body: formData,
        });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setReviews(prev => [...prev, data]);

    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
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
        <p><em>Note: Reviews with duplicate Order IDs will be marked as unverified.</em></p>
      </div>

      <ReviewForm addReview={addReview} />

      <ReviewList reviews={reviews} />



    </div>
  );
}