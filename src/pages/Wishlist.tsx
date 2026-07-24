import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getWishlist, addToWishlist, removeFromWishlist } from "../api";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  id: number;
  userId: number;
  restaurantId: string;
  notes: string;
  tags: string;
  createdAt: string;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRestaurantId, setNewRestaurantId] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      const res = await getWishlist();
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newRestaurantId) return;

    try {
      const tagsArray = newTags.split(",").map(t => t.trim()).filter(Boolean);
      await addToWishlist(newRestaurantId, newNotes || undefined, tagsArray);
      setNewRestaurantId("");
      setNewNotes("");
      setNewTags("");
      await loadWishlist();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add to wishlist");
    }
  }

  async function handleRemove(restaurantId: string) {
    try {
      await removeFromWishlist(restaurantId);
      await loadWishlist();
    } catch (err) {
      alert("Failed to remove from wishlist");
    }
  }

  return (
    <div
      style={{

        minHeight: "100vh",

        background: "#F8F5F0"

      }}
    >
      <Navbar />

      <div
        style={{

          maxWidth: "1000px",

          margin: "0 auto",

          padding: "40px 20px",

        }}
      >

        <h1 style={{

          fontSize: "36px",

          color: "#2D3436",

          fontWeight: 800,

        }}>
          ❤️ My Wishlist
        </h1>

        <p style={{

          color: "#636E72",

          fontSize: "18px",

          marginBottom: "30px",

        }}>
          Save restaurants you want to visit.
        </p>

        {/* Add Form */}
        <form onSubmit={handleAdd} style={{
          background: "white",
          padding: "25px",
          borderRadius: "18px",
          marginBottom: "30px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        }}>

          <h3 style={{ marginTop: 0 }}>Add Restaurant</h3>

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <input
              placeholder="Restaurant ID / Place ID"
              value={newRestaurantId}
              onChange={(e) => setNewRestaurantId(e.target.value)}
              required
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #E8E1D9",
                fontSize: "15px",
              }}
            />

            <input
              placeholder="Notes (optional)"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #E8E1D9",
                fontSize: "15px",
              }}
            />

            <input
              placeholder="Tags (comma separated)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #E8E1D9",
                fontSize: "15px",
              }}
            />

            <button type="submit" style={{
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#E67E22",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}>
              Add
            </button>

          </div>
        </form>

        {/* Wishlist Items */}
        {loading ? (<p>Loading...</p>) :

          items.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px",
              background: "white",
              borderRadius: "18px",
              color: "#777"
            }}>

              <h3>Your wishlist is empty 🍽</h3>

              <p>Search for restaurants and add them here!</p>

            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>

                    <h3 style={{ margin: "0 0 8px 0" }}>
                      Restaurant ID: {item.restaurantId}
                    </h3>

                    {item.notes && (
                      <p style={{ color: "#555", margin: "0 0 8px 0" }}>
                        📝 {item.notes}
                      </p>
                    )}

                    {item.tags && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {item.tags.split(",").map((tag, i) => (
                          <span key={i} style={{
                            background: "#F0E8DE",
                            padding: "4px 10px",
                            borderRadius: "10px",
                            fontSize: "13px",
                          }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <p style={{ color: "#999", fontSize: "13px", marginTop: "8px" }}>
                      Added: {new Date(item.createdAt).toLocaleDateString()}
                    </p>

                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => navigate(`/restaurant/${item.restaurantId}`)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1px solid #E67E22",
                        background: "white",
                        color: "#E67E22",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleRemove(item.restaurantId)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#ffebee",
                        color: "#c62828",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}