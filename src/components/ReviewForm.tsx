import { useState, useEffect } from "react";


interface ReviewFormData {

  restaurantId: number;

  title: string;

  body: string;

  taste: number;

  value: number;

  ambiance: number;

  receipt?: File;

}



export default function ReviewForm({

  addReview,

  isLoading = false,

  initialRestaurantId,

}: {

  addReview: (review: ReviewFormData) => void;

  isLoading?: boolean;

  initialRestaurantId?: number;

}) {


  const [restaurantId, setRestaurantId] =
    useState<number>(initialRestaurantId || 0);

  const [title, setTitle] =
    useState("");

  const [body, setBody] =
    useState("");

  const [taste, setTaste] =
    useState(5);

  const [value, setValue] =
    useState(5);

  const [ambiance, setAmbiance] =
    useState(5);

  const [receipt, setReceipt] =
    useState<File | null>(null);

  useEffect(() => {
    if (initialRestaurantId) {
      setRestaurantId(initialRestaurantId);
    }
  }, [initialRestaurantId]);


  function submit(
    e: React.FormEvent
  ) {

    e.preventDefault();


    if (!restaurantId || restaurantId <= 0) {

      alert("Please enter a valid restaurant ID");

      return;

    }


    addReview({

      restaurantId,

      title,

      body,

      taste,

      value,

      ambiance,

      receipt:
        receipt || undefined,

    });



    // reset

    setTitle("");

    setBody("");

    setTaste(5);

    setValue(5);

    setAmbiance(5);

    setReceipt(null);

  }





  function fileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {


    const file =
      e.target.files?.[0];


    if (!file)
      return;



    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Maximum file size is 5MB"
      );

      return;

    }


    setReceipt(file);

  }





  const inputStyle = {

    width: "100%",

    padding: "12px",

    borderRadius: "10px",

    border: "1px solid #E8E1D9",

    fontSize: "15px",

    fontFamily:
      "Inter, Segoe UI, Arial, sans-serif",

    color: "#2D3436",

    outline: "none",

    boxSizing: "border-box" as const,

  };





  function RatingBox({

    title,

    value,

    setValue,

  }: {

    title: string;

    value: number;

    setValue: (v: number) => void;

  }) {


    return (

      <div

        style={{

          flex: 1,

          background: "#fafafa",

          padding: "15px",

          borderRadius: "12px",

          textAlign: "center",

        }}

      >

        <strong>
          {title}
        </strong>


        <select

          value={value}

          onChange={
            (e) =>
              setValue(
                Number(
                  e.target.value
                )
              )
          }


          style={{

            marginTop: "10px",

            width: "100%",

            padding: "8px",

            borderRadius: "8px",

            border:
              "1px solid #E8E1D9",

          }}

        >

          {
            [1, 2, 3, 4, 5]
              .map(
                (n) => (

                  <option
                    key={n}
                    value={n}
                  >
                    {"⭐".repeat(n)}
                  </option>

                ))

          }

        </select>


      </div>

    );

  }





  return (

    <form

      onSubmit={submit}


      style={{

        background: "white",

        borderRadius: "18px",

        padding: "30px",

        boxShadow:
          "0 6px 20px rgba(0,0,0,0.08)",

        maxWidth: "700px",

        marginBottom: "40px",

      }}

    >




      <p
        style={{
          color: "#777",
        }}
      >
        Share your dining experience
        with other customers.
      </p>





      <label>
        Restaurant ID
      </label>


      <input

        type="number"

        value={
          restaurantId || ""
        }


        onChange={
          (e) =>
            setRestaurantId(
              Number(
                e.target.value
              )
            )
        }


        placeholder="Enter Restaurant ID"

        required

        disabled={!!initialRestaurantId}

        style={{
          ...inputStyle,

          marginTop: "8px",

          marginBottom: "20px",

          background: initialRestaurantId ? "#f5f5f5" : "white",

          cursor: initialRestaurantId ? "not-allowed" : "text",

        }}

      />



      <label>
        Review Title
      </label>


      <input

        value={title}

        onChange={
          (e) =>
            setTitle(
              e.target.value
            )
        }


        placeholder=
        "Give your review a title"


        required


        style={{

          ...inputStyle,

          marginTop: "8px",

          marginBottom: "20px",

          color: "#ffffff",

          caretColor: "#ffffff",

        }}

      />






      <label>
        Your Experience
      </label>


      <textarea


        value={body}


        onChange={
          (e) =>
            setBody(
              e.target.value
            )
        }


        placeholder=
        "Tell us about the food, service, and atmosphere..."


        rows={6}


        style={{

          ...inputStyle,

          marginTop: "8px",

          marginBottom: "25px",

          color: "#ffffff",

          caretColor: "#ffffff",

          resize: "vertical",

          fontFamily: "inherit",

        }}

      />







      <h3>
        Ratings
      </h3>


      <div

        style={{

          display: "flex",

          gap: "15px",

          marginBottom: "25px",

        }}

      >


        <RatingBox

          title="Taste"

          value={taste}

          setValue={setTaste}

        />


        <RatingBox

          title="Value"

          value={value}

          setValue={setValue}

        />


        <RatingBox

          title="Ambiance"

          value={ambiance}

          setValue={setAmbiance}

        />


      </div>



      <div

        style={{

          background: "#fafafa",

          padding: "18px",

          borderRadius: "12px",

          marginBottom: "25px",

        }}

      >

        <h3>
          📷 Receipt Verification
        </h3>


        <p
          style={{
            color: "#777",
            fontSize: "14px",
          }}
        >
          Upload your receipt to improve
          your Trust Score.
        </p>


        <input

          type="file"

          accept=".jpg,.jpeg,.png"

          onChange={fileChange}

        />


        {receipt &&

          (
            <p style={{ color: "#2e7d32", marginTop: "8px", fontSize: "14px" }}>

              ✓ {receipt.name} ({(receipt.size / 1024).toFixed(1)} KB)

            </p>
          )

        }


      </div>







      <button

        type="submit"

        disabled={isLoading}


        style={{

          width: "100%",

          padding: "14px",

          borderRadius: "12px",

          border: "none",

          background:
            isLoading
              ?
              "#aaa"
              :
              "#ff7043",


          color: "white",

          fontSize: "17px",

          fontWeight: "bold",

          cursor:
            isLoading
              ?
              "not-allowed"
              :
              "pointer",

        }}

      >

        {
          isLoading
            ?
            "Submitting..."
            :
            "Submit Review"
        }

      </button>


    </form>

  );

}