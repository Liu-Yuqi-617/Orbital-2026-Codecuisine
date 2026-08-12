import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Navbar from "../components/Navbar";

import {
  createReview,
  getMyReviews,
  uploadReceipt,
  searchRestaurants,
} from "../api";

import type {
  Review,
  CreateReviewRequest,
  SimpleRestaurant,
} from "../types";


export default function Reviews() {

  const navigate = useNavigate();


  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);


  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<SimpleRestaurant[]>([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [
    showSearchResults,
    setShowSearchResults,
  ] = useState(false);

  const [
    selectedRestaurant,
    setSelectedRestaurant,
  ] =
    useState<SimpleRestaurant | null>(
      null
    );

  const searchRef =
    useRef<HTMLDivElement>(null);


  useEffect(() => {

    loadMyReviews();


    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {

        setShowSearchResults(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);



  async function loadMyReviews() {

    try {

      const res =
        await getMyReviews();

      setReviews(
        res.data || []
      );

    }

    catch (err) {

      console.error(
        "Failed to load reviews:",
        err
      );

    }

  }



  async function performSearch() {

    if (!searchQuery.trim()) {
      return;
    }


    setIsSearching(true);

    setShowSearchResults(true);


    try {

      let lat = 1.3521;
      let lng = 103.8198;


      if (navigator.geolocation) {

        try {

          const pos =
            await new Promise<
              GeolocationPosition
            >(
              (resolve, reject) => {

                navigator.geolocation
                  .getCurrentPosition(
                    resolve,
                    reject,
                    {
                      enableHighAccuracy:
                        true,
                      timeout: 5000,
                    }
                  );

              }
            );


          lat =
            pos.coords.latitude;

          lng =
            pos.coords.longitude;

        }

        catch (err) {

          console.warn(
            "Geolocation failed, using default Singapore location:",
            err
          );

        }

      }


      const res =
        await searchRestaurants({
          query: searchQuery,
          lat,
          lng,
          radius: 10000,
          page: 1,
          page_size: 10,
        });


      setSearchResults(
        res.data.restaurants || []
      );

    }

    catch (err) {

      console.error(
        "Search failed:",
        err
      );


      alert(
        "Failed to search restaurants. Please try again."
      );

    }

    finally {

      setIsSearching(false);

    }

  }



  function handleSelectRestaurant(
    restaurant: SimpleRestaurant
  ) {

    setSelectedRestaurant(
      restaurant
    );

    setSearchQuery(
      restaurant.name
    );

    setShowSearchResults(
      false
    );

  }



  function clearSelectedRestaurant() {

    setSelectedRestaurant(null);

    setSearchQuery("");

    setSearchResults([]);

    setShowSearchResults(false);

  }



  async function addReview(
    reviewData: {
      title: string;
      body: string;
      taste: number;
      value: number;
      ambiance: number;
      receipt?: File;
    }
  ) {

    if (!selectedRestaurant) {

      alert(
        "Please select a restaurant first."
      );

      return;

    }


    try {

      setIsLoading(true);


      // IMPORTANT:
      // Review API requires NUMBER restaurantId
      const restaurantId =
        selectedRestaurant.id;

      localStorage.setItem(
        `restaurant_name_${restaurantId}`,
        selectedRestaurant.name
      );

      localStorage.setItem(
        `restaurant_info_${restaurantId}`,
        JSON.stringify({
          ...selectedRestaurant,
          place_id:
            selectedRestaurant.place_id ||
            String(restaurantId),
        })
      );

      const createData:
        CreateReviewRequest = {

        restaurantId,

        tasteRating:
          reviewData.taste,

        valueRating:
          reviewData.value,

        ambianceRating:
          reviewData.ambiance,

        title:
          reviewData.title,

        body:
          reviewData.body,

      };


      const res =
        await createReview(
          createData
        );


      const newReview:
        Review =
        res.data;


      if (
        reviewData.receipt &&
        newReview.id
      ) {

        try {

          await uploadReceipt(
            newReview.id,
            reviewData.receipt
          );


          newReview.isVerified =
            true;

        }

        catch (err) {

          console.error(
            "Receipt upload failed:",
            err
          );


          alert(
            "Review submitted but receipt upload failed."
          );

        }

      }


      await loadMyReviews();


      alert(
        "Review submitted successfully!"
      );


      navigate(
        `/restaurant/${restaurantId}`
      );

    }

    catch (err: any) {

      console.error(
        "Failed to submit review:",
        err
      );


      alert(
        err.response?.data?.message ||
        "Failed to submit review"
      );

    }

    finally {

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
                letterSpacing:
                  "-0.5px",
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
              Manage your dining experiences
              and verifications.
            </p>

          </div>



          {/* Write Review */}

          <section>

            <h2
              style={{
                fontSize: "28px",
                marginBottom: "15px",
                color: "#2D3436",
              }}
            >
              ✍️ Write a Review
            </h2>



            {/* Restaurant Search */}

            <div
              style={{
                background: "white",
                padding: "22px",
                borderRadius: "18px",
                marginBottom: "22px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.06)",
              }}
            >

              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "8px",
                  color: "#2D3436",
                }}
              >
                Select Restaurant
              </h3>


              <p
                style={{
                  color: "#777",
                  fontSize: "14px",
                  marginTop: 0,
                  marginBottom: "15px",
                }}
              >
                Search for the restaurant
                you want to review.
              </p>


              <div
                ref={searchRef}
                style={{
                  position: "relative",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >

                  <input
                    placeholder=
                    "Search restaurant by name..."

                    value={
                      searchQuery
                    }

                    onChange={(e) => {

                      const value =
                        e.target.value;


                      setSearchQuery(
                        value
                      );


                      if (
                        selectedRestaurant &&
                        value !==
                        selectedRestaurant.name
                      ) {

                        setSelectedRestaurant(
                          null
                        );

                      }


                      if (!value) {

                        setSearchResults(
                          []
                        );

                        setShowSearchResults(
                          false
                        );

                      }

                    }}

                    onKeyDown={(e) => {

                      if (
                        e.key === "Enter"
                      ) {

                        e.preventDefault();

                        performSearch();

                      }

                    }}

                    onFocus={() => {

                      if (
                        searchResults.length >
                        0
                      ) {

                        setShowSearchResults(
                          true
                        );

                      }

                    }}

                    style={{
                      flex: 1,
                      padding:
                        "13px 14px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #E8E1D9",
                      fontSize:
                        "15px",
                      outline:
                        "none",
                      color:
                        "#2D3436",
                      background:
                        "white",
                    }}
                  />


                  <button
                    type="button"

                    onClick={
                      performSearch
                    }

                    disabled={
                      isSearching
                    }

                    style={{
                      padding:
                        "12px 20px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid #E8E1D9",
                      background:
                        "#F5F5F5",
                      cursor:
                        isSearching
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        600,
                      color:
                        "#2D3436",
                    }}
                  >
                    {
                      isSearching
                        ? "Searching..."
                        : "🔍 Search"
                    }
                  </button>

                </div>



                {/* Search Results */}

                {
                  showSearchResults && (

                    <div
                      style={{
                        position:
                          "absolute",
                        top:
                          "calc(100% + 6px)",
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        background:
                          "white",
                        border:
                          "1px solid #E8E1D9",
                        borderRadius:
                          "10px",
                        maxHeight:
                          "320px",
                        overflowY:
                          "auto",
                        boxShadow:
                          "0 8px 25px rgba(0,0,0,0.15)",
                      }}
                    >

                      {
                        isSearching
                          ? (

                            <div
                              style={{
                                padding:
                                  "20px",
                                textAlign:
                                  "center",
                                color:
                                  "#777",
                              }}
                            >
                              Searching...
                            </div>

                          )

                          :

                          searchResults.length ===
                            0

                            ? (

                              <div
                                style={{
                                  padding:
                                    "20px",
                                  textAlign:
                                    "center",
                                  color:
                                    "#777",
                                }}
                              >
                                No restaurants found.
                              </div>

                            )

                            :

                            searchResults.map(
                              (
                                restaurant
                              ) => (

                                <div
                                  key={
                                    restaurant.id
                                  }

                                  onClick={() =>
                                    handleSelectRestaurant(
                                      restaurant
                                    )
                                  }

                                  style={{
                                    padding:
                                      "14px 16px",
                                    cursor:
                                      "pointer",
                                    borderBottom:
                                      "1px solid #F0F0F0",
                                    display:
                                      "flex",
                                    justifyContent:
                                      "space-between",
                                    alignItems:
                                      "center",
                                    gap:
                                      "15px",
                                    background:
                                      "white",
                                  }}
                                >

                                  <div
                                    style={{
                                      flex: 1,
                                    }}
                                  >

                                    <div
                                      style={{
                                        fontWeight:
                                          700,
                                        color:
                                          "#2D3436",
                                        marginBottom:
                                          "5px",
                                      }}
                                    >
                                      {
                                        restaurant.name
                                      }
                                    </div>


                                    <div
                                      style={{
                                        fontSize:
                                          "13px",
                                        color:
                                          "#777",
                                        lineHeight:
                                          "1.5",
                                      }}
                                    >

                                      ID: {
                                        restaurant.id
                                      }


                                      {
                                        restaurant.address && (

                                          <span>
                                            {" · "}
                                            📍 {
                                              restaurant.address
                                            }
                                          </span>

                                        )
                                      }


                                      {
                                        restaurant.cuisine_type &&
                                        restaurant.cuisine_type !==
                                        "unknown" && (

                                          <span>

                                            {" · "}🍽{" "}

                                            {
                                              restaurant.cuisine_type
                                                .charAt(0)
                                                .toUpperCase() +
                                              restaurant.cuisine_type
                                                .slice(1)
                                            }

                                          </span>

                                        )
                                      }

                                    </div>

                                  </div>


                                  <div
                                    style={{
                                      fontSize:
                                        "13px",
                                      color:
                                        "#555",
                                      textAlign:
                                        "right",
                                    }}
                                  >

                                    {
                                      restaurant.composite_score >
                                      0 && (

                                        <div>
                                          ⭐{" "}
                                          {
                                            restaurant.composite_score.toFixed(
                                              1
                                            )
                                          }
                                        </div>

                                      )
                                    }


                                    {
                                      restaurant.price_level >
                                      0 && (

                                        <div>
                                          💰{" "}
                                          {
                                            "$".repeat(
                                              Math.min(
                                                restaurant.price_level,
                                                4
                                              )
                                            )
                                          }
                                        </div>

                                      )
                                    }

                                  </div>

                                </div>

                              )
                            )
                      }

                    </div>

                  )
                }

              </div>



              {/* Selected Restaurant */}

              {
                selectedRestaurant && (

                  <div
                    style={{
                      background:
                        "#F0FFF0",
                      padding:
                        "14px 16px",
                      borderRadius:
                        "10px",
                      marginTop:
                        "16px",
                      border:
                        "1px solid #C8E6C9",
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap:
                        "15px",
                    }}
                  >

                    <div>

                      <div
                        style={{
                          fontSize:
                            "13px",
                          color:
                            "#2E7D32",
                          fontWeight:
                            600,
                          marginBottom:
                            "4px",
                        }}
                      >
                        ✓ Selected Restaurant
                      </div>


                      <strong
                        style={{
                          color:
                            "#2D3436",
                        }}
                      >
                        {
                          selectedRestaurant.name
                        }
                      </strong>


                      <div
                        style={{
                          color:
                            "#777",
                          fontSize:
                            "13px",
                          marginTop:
                            "4px",
                        }}
                      >
                        Restaurant ID:{" "}
                        {
                          selectedRestaurant.id
                        }
                      </div>


                      {
                        selectedRestaurant.address && (

                          <div
                            style={{
                              color:
                                "#777",
                              fontSize:
                                "13px",
                              marginTop:
                                "3px",
                            }}
                          >
                            📍{" "}
                            {
                              selectedRestaurant.address
                            }
                          </div>

                        )
                      }

                    </div>


                    <button
                      type="button"

                      onClick={
                        clearSelectedRestaurant
                      }

                      style={{
                        background:
                          "transparent",
                        border:
                          "none",
                        color:
                          "#C62828",
                        cursor:
                          "pointer",
                        fontSize:
                          "18px",
                        padding:
                          "5px 8px",
                      }}
                    >
                      ✕
                    </button>

                  </div>

                )
              }

            </div>



            <ReviewForm
              addReview={
                addReview
              }

              isLoading={
                isLoading
              }

              restaurantSelected={
                !!selectedRestaurant
              }
            />

          </section>



          {/* Trust Guide */}

          <div
            style={{
              background:
                "white",
              padding:
                "25px",
              borderRadius:
                "18px",
              marginTop:
                "35px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >

            <h2
              style={{
                fontSize:
                  "28px",
                marginBottom:
                  "15px",
                color:
                  "#2D3436",
              }}
            >
              🛡 Trust Score System
            </h2>


            <p>
              Reviews are ranked based
              on authenticity and detail.
            </p>


            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap:
                  "15px",
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


              <div>
                ✍️ Detailed Review
                <br />
                +15 points
              </div>


              <div>
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
              marginTop:
                "45px",
            }}
          >

            <h2
              style={{
                fontSize:
                  "28px",
                marginBottom:
                  "15px",
                color:
                  "#2D3436",
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