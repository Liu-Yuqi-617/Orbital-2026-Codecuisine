import { useState } from "react";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import type { Review } from "../types";


export default function Reviews() {


  const [reviews, setReviews] =
    useState<Review[]>([]);


  const [isLoading, setIsLoading] =
    useState(false);


  const { user } =
    useAuth();




  async function addReview(review: any) {


    const formData =
      new FormData();



    formData.append(
      "restaurantId",
      review.restaurantId.toString()
    );


    formData.append(
      "title",
      review.title
    );


    formData.append(
      "body",
      review.body
    );


    formData.append(
      "tasteRating",
      review.taste.toString()
    );


    formData.append(
      "valueRating",
      review.value.toString()
    );


    formData.append(
      "ambianceRating",
      review.ambiance.toString()
    );



    if (review.receipt) {

      formData.append(
        "receipt",
        review.receipt
      );

    }



    if (user) {

      formData.append(
        "email",
        user.email
      );

    }




    try {


      setIsLoading(true);



      const res =
        await fetch(
          "http://localhost:3001/api/review",
          {
            method: "POST",
            body: formData,
          }
        );



      const data =
        await res.json();



      if (!res.ok) {

        alert(
          data.message ||
          "Failed to submit review"
        );

        return;

      }



      setReviews(
        prev => [
          ...prev,
          data,
        ]
      );



    }

    catch (error) {

      console.error(error);

      alert(
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
                letterSpacing: "-0.5px",
              }}
            >
              🍽 Restaurant Reviews
            </h1>


            <p
              style={{
                color: "#2D3436",
                fontSize: "19px",
                fontWeight: 500,
                lineHeight: "1.6",
              }}
            >
              Discover trusted dining experiences
              from real customers.
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
                color: "#2D3436"
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

              🌟 Latest Reviews

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