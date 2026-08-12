import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { getWishlist, addToWishlist, removeFromWishlist, searchRestaurants, getRestaurantByPlaceId, getRestaurantById } from "../api";
import { useNavigate } from "react-router-dom";
import type { SimpleRestaurant } from "../types";

interface WishlistItem {
  id: number;
  userId: number;
  restaurantId: string;
  notes: string;
  tags: string;
  createdAt: string;
}

interface WishlistItemWithDetails extends WishlistItem {
  restaurantDetails?: SimpleRestaurant | null;
  displayName?: string;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SimpleRestaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [newNotes, setNewNotes] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<SimpleRestaurant | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWishlist();

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadWishlist() {
    try {
      setLoading(true);

      const res = await getWishlist();

      console.log("wishlist response:", res.data);

      const rawItems = res.data || [];

      const wishlistItems: WishlistItem[] = rawItems.map((item: any) => ({
        id: item.id ?? item.ID,
        userId: item.userId ?? item.UserID,
        restaurantId: item.restaurantId ?? item.RestaurantID,
        notes: item.notes ?? item.Notes ?? "",
        tags: item.tags ?? item.Tags ?? "",
        createdAt: item.createdAt ?? item.CreatedAt,
      }));

      const itemsWithDetails = await Promise.all(
        wishlistItems.map(async (item: WishlistItem) => {

          const cachedData = localStorage.getItem(
            `restaurant_data_${item.restaurantId}`
          );

          if (cachedData) {
            try {
              const restaurant = JSON.parse(cachedData);

              return {
                ...item,
                restaurantDetails: restaurant,
                displayName:
                  restaurant.name ||
                  `Restaurant #${item.restaurantId}`,
              };
            } catch (e) {
              console.error("Failed to parse cached restaurant:", e);
            }
          }

          try {
            const isDatabaseId = /^\d+$/.test(item.restaurantId);

            const restaurantRes = isDatabaseId
              ? await getRestaurantById(item.restaurantId)
              : await getRestaurantByPlaceId(item.restaurantId);

            const restaurant = restaurantRes.data?.data || null;

            console.log(
              "restaurant details:",
              item.restaurantId,
              restaurant
            );

            if (restaurant) {
              localStorage.setItem(
                `restaurant_name_${item.restaurantId}`,
                restaurant.name
              );

              localStorage.setItem(
                `restaurant_data_${item.restaurantId}`,
                JSON.stringify(restaurant)
              );
            }

            return {
              ...item,
              restaurantDetails: restaurant,
              displayName:
                restaurant?.name ||
                `Restaurant #${item.restaurantId}`,
            };

          } catch (err) {
            console.error(
              `Failed to fetch restaurant ${item.restaurantId}:`,
              err
            );

            const cachedName = localStorage.getItem(
              `restaurant_name_${item.restaurantId}`
            );

            return {
              ...item,
              restaurantDetails: null,
              displayName:
                cachedName ||
                `Restaurant #${item.restaurantId}`,
            };
          }
        })
      );

      setItems(itemsWithDetails);

    } catch (err) {
      console.error("Failed to load wishlist:", err);
      alert("Failed to load wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function performSearch() {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      let lat = 1.3521;
      let lng = 103.8198;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (err) {
          console.warn("Geolocation failed, using default:", err);
        }
      }

      const res = await searchRestaurants({
        query: searchQuery,
        lat,
        lng,
        radius: 10000,
        page: 1,
        page_size: 10,
      });

      setSearchResults(res.data.restaurants || []);
    } catch (err) {
      console.error("Search failed:", err);
      alert("Failed to search restaurants. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSelectRestaurant(restaurant: SimpleRestaurant) {
    setSelectedRestaurant(restaurant);
    setSearchQuery(restaurant.name);
    setShowSearchResults(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedRestaurant) {
      alert("Please search and select a restaurant first");
      return;
    }

    try {
      const tagsArray = newTags.split(",").map(t => t.trim()).filter(Boolean);

      const restaurantId = selectedRestaurant.place_id || selectedRestaurant.id.toString();

      await addToWishlist(restaurantId, newNotes || undefined, tagsArray);

      localStorage.setItem(`restaurant_name_${restaurantId}`, selectedRestaurant.name);
      localStorage.setItem(`restaurant_data_${restaurantId}`, JSON.stringify(selectedRestaurant));
      localStorage.setItem(`wishlist_added_${restaurantId}`, new Date().toISOString());
      localStorage.setItem(`wishlist_item_${restaurantId}`, JSON.stringify({
        createdAt: new Date().toISOString(),
        notes: newNotes,
        tags: tagsArray,
      }));

      setSelectedRestaurant(null);
      setSearchQuery("");
      setNewNotes("");
      setNewTags("");
      setSearchResults([]);
      setShowSearchResults(false);

      await loadWishlist();

      alert(`"${selectedRestaurant.name}" added to wishlist!`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add to wishlist");
    }
  }

  async function handleRemove(restaurantId: string, displayName: string) {
    if (!restaurantId || restaurantId === 'undefined' || restaurantId === 'null' || restaurantId === 'unknown') {
      console.error('Invalid restaurantId for removal:', restaurantId);
      alert('Cannot remove: Invalid restaurant ID');
      return;
    }

    console.log('Removing from wishlist with restaurantId:', restaurantId);

    if (!confirm(`Remove "${displayName}" from your wishlist?`)) {
      return;
    }

    setRemovingId(restaurantId);
    try {
      await removeFromWishlist(restaurantId);
      setItems(items.filter(item => item.restaurantId !== restaurantId));

      localStorage.removeItem(`restaurant_name_${restaurantId}`);
      localStorage.removeItem(`restaurant_data_${restaurantId}`);
      localStorage.removeItem(`wishlist_added_${restaurantId}`);
      localStorage.removeItem(`wishlist_item_${restaurantId}`);
    } catch (err) {
      console.error("Failed to remove:", err);
      alert("Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  }

  function getDisplayInfo(item: WishlistItemWithDetails): { name: string; id: string } {
    const name = item.displayName ||
      item.restaurantDetails?.name ||
      localStorage.getItem(`restaurant_name_${item.restaurantId}`) ||
      `Restaurant #${item.restaurantId}`;
    return {
      name,
      id: item.restaurantId,
    };
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
        <div>

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

          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{
              background: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              color: "#2D3436",
              marginBottom: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              {items.length} {items.length === 1 ? "restaurant" : "restaurants"} saved
            </span>
          </div>

        </div>

        {/* Add Form */}
        <form
          onSubmit={handleAdd}
          style={{

            background: "white",

            padding: "25px",

            borderRadius: "18px",

            marginBottom: "30px",

            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",

          }}
        >

          <h3 style={{ marginTop: 0 }}>Add Restaurant</h3>

          <div ref={searchRef} style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input
                placeholder="Search restaurant by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setShowSearchResults(false);
                    setSelectedRestaurant(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    performSearch();
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim() && searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                required
                style={{

                  flex: 1,

                  minWidth: "200px",

                  padding: "12px",

                  borderRadius: "10px",

                  border: "1px solid #E8E1D9",

                  fontSize: "15px",

                  marginBottom: "10px"

                }}
              />

              {selectedRestaurant && (
                <span style={{

                  position: "absolute",

                  right: "12px",

                  top: "50%",

                  transform: "translateY(-50%)",

                  color: "#4caf50",

                  fontSize: "20px",

                }}>
                  ✓
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={performSearch}
              disabled={isSearching}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: "1px solid #E8E1D9",
                background: "#f5f5f5",
                cursor: isSearching ? "not-allowed" : "pointer",
                fontWeight: 600,
                color: "#2D3436",
                marginBottom: "10px"
              }}
            >
              {isSearching ? "Searching..." : "🔍 Search"}
            </button>

            {showSearchResults && (
              <div style={{

                position: "absolute",

                zIndex: 10,

                background: "white",

                border: "1px solid #E8E1D9",

                borderRadius: "10px",

                marginTop: "5px",

                maxHeight: "300px",

                overflowY: "auto",

                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",

                width: "60%",

              }}>
                {isSearching ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                    No restaurants found. Try a different search.
                  </div>
                ) : (
                  searchResults.map((restaurant) => {
                    const isAlreadyInWishlist = items.some(
                      item => item.restaurantId === (restaurant.place_id || restaurant.id.toString())
                    );

                    return (
                      <div
                        key={restaurant.id}
                        onClick={() => !isAlreadyInWishlist && handleSelectRestaurant(restaurant)}
                        style={{

                          padding: "12px 16px",

                          cursor: "pointer",

                          borderBottom: "1px solid #f0f0f0",

                          display: "flex",

                          justifyContent: "space-between",

                          alignItems: "center",

                          opacity: isAlreadyInWishlist ? 0.6 : 1,

                          background: isAlreadyInWishlist ? "#f9f9f9" : "white",

                        }}
                      >
                        <div style={{ flex: 1 }}>

                          <div style={{ fontWeight: 600 }}>
                            {restaurant.name}
                            {isAlreadyInWishlist && (
                              <span style={{
                                marginLeft: "8px",
                                fontSize: "12px",
                                color: "#4caf50",
                                fontWeight: "normal",
                              }}>
                                ✓ Already saved
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: "13px", color: "#777" }}>
                            ID: {restaurant.place_id || restaurant.id}
                            {restaurant.address && ` · ${restaurant.address}`}
                            {restaurant.cuisine_type && restaurant.cuisine_type !== "unknown" && (
                              <span> · 🍽 {restaurant.cuisine_type.charAt(0).toUpperCase() + restaurant.cuisine_type.slice(1)}</span>
                            )}
                          </div>

                        </div>

                        <div style={{ fontSize: "13px", color: "#555", textAlign: "right" }}>

                          {restaurant.composite_score > 0 && (
                            <span>⭐ {restaurant.composite_score.toFixed(1)}</span>
                          )}
                          {restaurant.price_level > 0 && (
                            <span style={{ marginLeft: "8px" }}>
                              💰 {"$".repeat(Math.min(restaurant.price_level, 4))}
                            </span>
                          )}
                          {restaurant.distance && (
                            <div style={{ fontSize: "12px", color: "#999" }}>
                              {restaurant.distance.toFixed(0)}m away
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {selectedRestaurant && (
            <div style={{

              background: "#f0fff0",

              padding: "12px 16px",

              borderRadius: "10px",

              marginBottom: "15px",

              border: "1px solid #c8e6c9",

              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

            }}>
              <div>

                <strong>{selectedRestaurant.name}</strong>

                <span style={{ marginLeft: "10px", color: "#777", fontSize: "14px" }}>
                  ID: {selectedRestaurant.place_id || selectedRestaurant.id}
                </span>

                {selectedRestaurant.address && (
                  <span style={{ marginLeft: "10px", color: "#777", fontSize: "14px" }}>
                    · {selectedRestaurant.address}
                  </span>
                )}

                {selectedRestaurant.cuisine_type && selectedRestaurant.cuisine_type !== "unknown" && (
                  <span style={{ marginLeft: "10px", color: "#777", fontSize: "14px" }}>
                    🍽 {selectedRestaurant.cuisine_type.charAt(0).toUpperCase() + selectedRestaurant.cuisine_type.slice(1)}
                  </span>
                )}

              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRestaurant(null);
                  setSearchQuery("");
                }}
                style={{

                  background: "transparent",

                  border: "none",

                  color: "#c62828",

                  cursor: "pointer",

                  fontSize: "16px",

                  padding: "4px 8px",

                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
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

            <button
              type="submit"
              disabled={!selectedRestaurant}
              style={{

                padding: "12px 24px",

                borderRadius: "10px",

                border: "none",

                background: selectedRestaurant ? "#E67E22" : "#ccc",

                color: "white",

                fontWeight: 700,

                cursor: selectedRestaurant ? "pointer" : "not-allowed",

              }}
            >
              ❤️ Add to Wishlist
            </button>
          </div>
        </form>

        {/* Wishlist Items */}
        {
          loading ? (<p>Loading...</p>) :

            items.length === 0 ? (
              <div style={{

                textAlign: "center",

                padding: "60px",

                background: "white",

                borderRadius: "18px",

                color: "#777",
              }}>

                <h3>Your wishlist is empty 🍽</h3>

                <p>Search for restaurants and add them here!</p>

              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {items.filter(item => item.restaurantId && item.restaurantId !== 'undefined' && item.restaurantId !== 'null')
                  .map((item, index) => {
                    const { name, id } = getDisplayInfo(item);
                    const restaurant = item.restaurantDetails;
                    const isRemoving = removingId === item.restaurantId;
                    const key = item.restaurantId || `item-${index}`;

                    return (
                      <div key={key}
                        style={{

                          background: "white",

                          padding: "20px",

                          borderRadius: "16px",

                          boxShadow: "0 4px 15px rgba(0,0,0,0.06)",

                          display: "flex",

                          justifyContent: "space-between",

                          alignItems: "center",

                        }}
                      >
                        <div>

                          <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
                            {name}
                          </h3>

                          <div style={{ fontSize: "13px", color: "#999", marginBottom: "8px" }}>
                            ID: {id}
                          </div>

                          {restaurant && (
                            <div style={{

                              display: "flex",

                              gap: "15px",

                              fontSize: "14px",

                              color: "#555",

                              flexWrap: "wrap",

                              marginBottom: "8px",

                            }}>

                              {restaurant.address && (
                                <span>📍 {restaurant.address}</span>
                              )}

                              {restaurant.cuisine_type && restaurant.cuisine_type !== "unknown" && (
                                <span>🍽 {restaurant.cuisine_type.charAt(0).toUpperCase() + restaurant.cuisine_type.slice(1)}</span>
                              )}

                              {restaurant.price_level > 0 && (
                                <span>💰 {"$".repeat(Math.min(restaurant.price_level, 4))}</span>
                              )}

                              {restaurant.composite_score > 0 && (
                                <span>⭐ {restaurant.composite_score.toFixed(1)}</span>
                              )}

                              {restaurant.verified_review_count > 0 && (
                                <span style={{ color: "#2e7d32" }}>✓ {restaurant.verified_review_count} verified</span>
                              )}

                            </div>
                          )}

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
                            Added: {new Date(item.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => {
                              const restaurantId = item.restaurantId;
                              if (restaurantId && restaurantId !== 'undefined') {
                                navigate(`/restaurant/${restaurantId}`);
                              } else {
                                alert('Cannot view: Invalid restaurant ID');
                              }
                            }}
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
                            onClick={() => handleRemove(item.restaurantId, name)}
                            disabled={isRemoving || !item.restaurantId || item.restaurantId === 'undefined'}
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
                            {isRemoving ? "Removing..." : "Remove"}
                          </button>

                        </div>
                      </div>
                    );
                  }
                  )}
              </div>
            )
        }
      </div >
    </div >
  );
}
