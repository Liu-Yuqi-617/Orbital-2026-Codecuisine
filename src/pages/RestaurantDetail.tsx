import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getRestaurantReviews,
  gpsCheckin,
  addToWishlist,
  getRestaurantByPlaceId,
  removeFromWishlist
} from "../api";
import type { Review, SimpleRestaurant } from "../types";

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [addedDate, setAddedDate] = useState<string>("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState<Partial<SimpleRestaurant>>({});
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    if (id) {
      const restaurantIdNum = parseInt(id);
      if (!isNaN(restaurantIdNum)) {
        setRestaurantId(id);
        loadReviews(restaurantIdNum);
        loadRestaurantInfo(id);
      }
    }
  }, [id]);

  async function loadRestaurantInfo(restaurantId: string) {

    const hasLocalInfo = loadRestaurantInfoFromStorage(restaurantId);

    if (!hasLocalInfo) {
      await fetchRestaurantInfoFromBackend(restaurantId);
    }
  }

  function loadRestaurantInfoFromStorage(restaurantId: string): boolean {
    let hasInfo = false;

    const name = localStorage.getItem(`restaurant_name_${restaurantId}`) ||
      localStorage.getItem(`restaurant_${restaurantId}`) ||
      `Restaurant #${restaurantId}`;
    setRestaurantName(name);

    const infoStr = localStorage.getItem(`restaurant_info_${restaurantId}`);
    if (infoStr) {
      try {
        const info = JSON.parse(infoStr) as Partial<SimpleRestaurant>;
        setRestaurantInfo(info);
        hasInfo = true;
      } catch (e) {
        console.error("Failed to parse restaurant info:", e);
      }
    }

    if (!hasInfo) {
      setRestaurantInfo({
        place_id: restaurantId,
      });
    }

    const dateStr = localStorage.getItem(`wishlist_added_${restaurantId}`);
    if (dateStr) {
      const date = new Date(dateStr);
      setAddedDate(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } else {
      const wishlistData = localStorage.getItem(`wishlist_item_${restaurantId}`);
      if (wishlistData) {
        try {
          const parsed = JSON.parse(wishlistData);
          if (parsed.createdAt) {
            const date = new Date(parsed.createdAt);
            setAddedDate(date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }));
          }
        } catch (e) {
          setAddedDate('Unknown date');
        }
      } else {
        setAddedDate('Unknown date');
      }
    }

    return hasInfo;
  }

  async function fetchRestaurantInfoFromBackend(restaurantId: string) {
    setLoadingInfo(true);

    try {
      const wishlistData = localStorage.getItem(`wishlist_item_${restaurantId}`);
      let placeId: string | null = null;

      if (wishlistData) {
        try {
          const parsed = JSON.parse(wishlistData);
          placeId = parsed.google_place_id || parsed.placeId || null;
        } catch (e) {
          console.error("Failed to parse wishlist data:", e);
        }
      }

      if (!placeId) {
        const infoStr = localStorage.getItem(`restaurant_info_${restaurantId}`);
        if (infoStr) {
          try {
            const info = JSON.parse(infoStr) as Partial<SimpleRestaurant>;
            placeId = info.place_id || null;
          } catch (e) {
            console.error("Failed to parse restaurant info:", e);
          }
        }
      }

      if (placeId) {
        const response = await getRestaurantByPlaceId(placeId);

        if (response.data) {
          const data = response.data as SimpleRestaurant;

          const info: Partial<SimpleRestaurant> = {
            address: data.address || '',
            cuisine_type: data.cuisine_type || '',
            price_level: data.price_level || 0,
            avg_taste: data.avg_taste || 0,
            avg_value: data.avg_value || 0,
            avg_ambiance: data.avg_ambiance || 0,
            total_review_count: data.total_review_count || 0,
            verified_review_count: data.verified_review_count || 0,
            place_id: placeId,
            lat: data.lat,
            lng: data.lng,
          };

          setRestaurantInfo(info);

          if (data.name) {
            setRestaurantName(data.name);
            localStorage.setItem(`restaurant_name_${restaurantId}`, data.name);
          }

          localStorage.setItem(`restaurant_info_${restaurantId}`, JSON.stringify(info));
        }
      } else {
        console.warn('No Google Place ID found for restaurant:', restaurantId);
        const fallbackPlaceId = restaurantId;
        const cachedName = localStorage.getItem(`restaurant_name_${restaurantId}`) ||
          localStorage.getItem(`restaurant_${restaurantId}`) ||
          `Restaurant #${restaurantId}`;
        setRestaurantInfo({
          place_id: fallbackPlaceId,
          address: localStorage.getItem(`restaurant_address_${restaurantId}`) || '',
          cuisine_type: localStorage.getItem(`restaurant_cuisine_${restaurantId}`) || '',
        });
        setRestaurantName(cachedName);
        localStorage.setItem(`restaurant_info_${restaurantId}`, JSON.stringify({
          place_id: fallbackPlaceId,
          name: cachedName,
        }));
      }

    } catch (error) {
      console.error('Error fetching restaurant info from backend:', error);
    } finally {
      setLoadingInfo(false);
    }
  }

  async function loadReviews(restaurantId: number) {
    try {
      setLoading(true);
      const res = await getRestaurantReviews(restaurantId.toString());
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
          if (id) {
            await loadReviews(parseInt(id));
          }
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

      const wishlistData = localStorage.getItem(`wishlist_item_${id!}`);
      let placeId: string | null = null;

      if (wishlistData) {
        try {
          const parsed = JSON.parse(wishlistData);
          placeId = parsed.place_id || parsed.placeId || null;
        } catch (e) {
          console.error("Failed to parse wishlist data:", e);
        }
      }

      await addToWishlist(id!, undefined, undefined);
      setIsInWishlist(true);
      alert("Added to wishlist!");

      await loadRestaurantInfo(id!);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add to wishlist");
    }
  }

  async function handleRemoveFromWishlist() {
    if (!confirm("Remove this restaurant from wishlist?")) return;

    try {
      await removeFromWishlist(id!);
      setIsInWishlist(false);
      alert("Removed from wishlist!");
      navigate("/wishlist");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove from wishlist");
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.tasteRating + r.valueRating + r.ambianceRating) / 3, 0) / reviews.length).toFixed(1)
    : "0";

  const verifiedCount = reviews.filter(r => r.isVerified).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F5F0" }}>

      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>

        <button
          onClick={() => navigate("/wishlist")}
          style={{

            background: "transparent",

            border: "none",

            color: "#E67E22",

            fontSize: "16px",

            fontWeight: 600,

            cursor: "pointer",

            marginBottom: "20px",

            padding: "8px 0",

          }}
        >
          ← Back to Wishlist
        </button>

        {/* Header */}
        <div style={{

          background: "white",

          padding: "30px",

          borderRadius: "18px",

          marginBottom: "30px",

          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",

        }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>

            <div style={{ flex: 1 }}>

              <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", color: "#070707" }}>
                {restaurantName}

                {loadingInfo && <span style={{ fontSize: "14px", color: "#999", marginLeft: "10px" }}>Loading info...</span>}
              </h1>

              {/* Restaurant details info */}
              <div style={{
                display: "flex",
                gap: "15px",
                fontSize: "14px",
                color: "#555",
                flexWrap: "wrap",
                marginBottom: "8px"
              }}>
                {restaurantInfo.address && (
                  <span>📍 {restaurantInfo.address}</span>
                )}
                {restaurantInfo.cuisine_type && restaurantInfo.cuisine_type !== "unknown" && restaurantInfo.cuisine_type !== "" && (
                  <span>🍽 {restaurantInfo.cuisine_type.charAt(0).toUpperCase() + restaurantInfo.cuisine_type.slice(1)}</span>
                )}
                {restaurantInfo.price_level && restaurantInfo.price_level > 0 && (
                  <span>💰 {"$".repeat(Math.min(restaurantInfo.price_level, 4))}</span>
                )}
                {restaurantInfo.avg_taste !== undefined && restaurantInfo.avg_taste > 0 && (
                  <span>⭐ Taste: {restaurantInfo.avg_taste.toFixed(1)}</span>
                )}
                {restaurantInfo.avg_value !== undefined && restaurantInfo.avg_value > 0 && (
                  <span>💰 Value: {restaurantInfo.avg_value.toFixed(1)}</span>
                )}
                {restaurantInfo.avg_ambiance !== undefined && restaurantInfo.avg_ambiance > 0 && (
                  <span>🏛️ Ambiance: {restaurantInfo.avg_ambiance.toFixed(1)}</span>
                )}
                {restaurantInfo.total_review_count !== undefined && restaurantInfo.total_review_count > 0 && (
                  <span style={{ color: "#2e7d32" }}>✓ {restaurantInfo.total_review_count} total reviews</span>
                )}
                {restaurantInfo.verified_review_count !== undefined && restaurantInfo.verified_review_count > 0 && (
                  <span style={{ color: "#2e7d32" }}>✅ {restaurantInfo.verified_review_count} verified</span>
                )}
                {restaurantInfo.place_id && (
                  <span style={{ color: "#4285f4", fontSize: "12px" }}>
                    🔍 Google Places
                  </span>
                )}
              </div>

              <div style={{

                display: "flex",

                flexDirection: "column",

                gap: "6px",

                color: "#636E72",

                fontSize: "15px",

              }}>
                <div>

                  <span style={{ fontWeight: 600, color: "#2D3436" }}>Restaurant ID:</span>

                  <span style={{

                    marginLeft: "8px",

                    fontFamily: "monospace",

                    background: "#f5f5f5",

                    padding: "2px 8px",

                    borderRadius: "4px",

                    fontSize: "13px",

                  }}>
                    {restaurantId}
                  </span>

                </div>

                <div>
                  <span style={{ fontWeight: 600, color: "#2D3436" }}>Added to Wishlist:</span>

                  <span style={{ marginLeft: "8px" }}>
                    {addedDate}
                  </span>

                </div>

              </div>

              <div style={{ marginTop: "15px", color: "#777", fontSize: "18px" }}>
                {reviews.length} reviews · ⭐ {avgRating} average
                {verifiedCount > 0 && ` · ✅ ${verifiedCount} verified`}
              </div>

            </div>

            <div style={{ display: "flex", gap: "10px" }}>

              {isInWishlist ? (
                <button
                  onClick={handleRemoveFromWishlist}
                  style={{

                    padding: "12px 20px",

                    borderRadius: "12px",

                    border: "1px solid #e74c3c",

                    background: "white",

                    color: "#e74c3c",

                    fontWeight: 700,

                    cursor: "pointer",

                  }}
                >
                  ❤️ Remove
                </button>
              ) : (
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
              )}

              <button
                onClick={() => navigate(`/reviews?restaurantId=${id}`)}
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

                          fontWeight: "bold",

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

                    {review.body && (
                      <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "15px" }}>
                        {review.body}
                      </p>
                    )}

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

                      color: "#888",

                    }}>

                      <span>Overall: <strong>{overall}/5</strong></span>
                      <span>{new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>

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