import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurantReviews, gpsCheckin, addToWishlist } from "../api";
import type { Review } from "../types";

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (id) loadReviews();
  }, [id]);

  async function loadReviews() {
    try {
      const res = await getRestaurantReviews(id!);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGPSCheckin(reviewId: number) {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await gpsCheckin({
            reviewId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          alert("GPS check-in successful! Review is now verified.");
          await loadReviews();
        } catch (err: any) {
          alert(err.response?.data?.message || "GPS check-in failed");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        alert("Failed to get location: " + err.message);
        setGpsLoading(false);
      }
    );
  }

  async function handleAddToWishlist() {
    try {
      await addToWishlist(id!);
      alert("Added to wishlist!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add to wishlist");
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.tasteRating + r.valueRating + r.ambianceRating) / 3, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div style={{ minHeight: "100vh", background: "#F8F5F0" }}>

      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "18px",
          marginBottom: "30px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>

            <div>
              <h1 style={{ margin: "0 0 10px 0", fontSize: "32px" }}>
                Restaurant #{id}
              </h1>

              <p style={{ color: "#777", fontSize: "18px" }}>
                {reviews.length} reviews · ⭐ {avgRating} average
              </p>

            </div>

            <div style={{ display: "flex", gap: "10px" }}>

              <button
                onClick={handleAddToWishlist}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid #E67E22",
                  background: "white",
                  color: "#E67E22",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ❤️ Save
              </button>

              <button
                onClick={() => navigate("/reviews")}
                style={{
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#E67E22",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✍️ Write Review
              </button>

            </div>
          </div>
        </div>

        {/* Reviews */}
        {loading ? (<p>Loading reviews...</p>)
          : reviews.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px",
              background: "white",
              borderRadius: "18px",
              color: "#777"
            }}>

              <h3>No reviews yet 🍽</h3>
              <p>Be the first to review this restaurant!</p>

            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {reviews.map((review) => {

                const overall = ((review.tasteRating + review.valueRating + review.ambianceRating) / 3).toFixed(1);

                return (
                  <div key={review.id} style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "18px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                  }}>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>

                      <div>

                        <h3 style={{ margin: "0 0 5px 0" }}>{review.title}</h3>
                        <span style={{ color: "#777", fontSize: "14px" }}>
                          by {review.user?.username || "Anonymous"}
                        </span>

                      </div>

                      {review.isVerified ? (
                        <span style={{
                          background: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "6px 12px",
                          borderRadius: "15px",
                          fontSize: "13px",
                          fontWeight: "bold"
                        }}>
                          ✓ Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGPSCheckin(review.id)}
                          disabled={gpsLoading}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "10px",
                            border: "1px solid #2980B9",
                            background: "white",
                            color: "#2980B9",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: gpsLoading ? "not-allowed" : "pointer",
                          }}
                        >
                          {gpsLoading ? "Checking..." : "📍 GPS Verify"}
                        </button>
                      )}
                    </div>

                    <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "15px" }}>
                      {review.body}
                    </p>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "15px",
                      marginBottom: "15px",
                    }}>

                      <div style={{
                        background: "#fafafa",
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "center",
                      }}>

                        <div style={{ fontSize: "12px", color: "#777" }}>Taste</div>
                        <div>{"⭐".repeat(review.tasteRating)}</div>

                      </div>

                      <div style={{
                        background: "#fafafa",
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "center",
                      }}>

                        <div style={{ fontSize: "12px", color: "#777" }}>Value</div>
                        <div>{"⭐".repeat(review.valueRating)}</div>

                      </div>

                      <div style={{
                        background: "#fafafa",
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "center",
                      }}>

                        <div style={{ fontSize: "12px", color: "#777" }}>Ambiance</div>
                        <div>{"⭐".repeat(review.ambianceRating)}</div>

                      </div>

                    </div>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "15px",
                      borderTop: "1px solid #eee",
                      fontSize: "14px",
                      color: "#888"
                    }}>

                      <span>Overall: <strong>{overall}/5</strong></span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}