import { useState } from "react";


interface ReviewFormData {
  title: string;
  body: string;
  taste: number;
  value: number;
  ambiance: number;
  receipt?: File;
}


interface ReviewFormProps {
  addReview: (
    review: ReviewFormData
  ) => void | Promise<void>;

  isLoading?: boolean;

  restaurantSelected: boolean;
}


export default function ReviewForm({
  addReview,
  isLoading = false,
  restaurantSelected,
}: ReviewFormProps) {

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


  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();


    if (!restaurantSelected) {

      alert(
        "Please select a restaurant first."
      );

      return;

    }


    try {

      await addReview({
        title,
        body,
        taste,
        value,
        ambiance,
        receipt:
          receipt || undefined,
      });


      // Reset form after successful submit

      setTitle("");

      setBody("");

      setTaste(5);

      setValue(5);

      setAmbiance(5);

      setReceipt(null);

    }

    catch (err) {

      console.error(
        "Failed to submit review:",
        err
      );

    }

  }


  function fileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      e.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Maximum file size is 5MB"
      );

      e.target.value = "";

      return;

    }


    setReceipt(file);

  }


  const inputStyle = {

    width: "100%",

    padding: "12px",

    borderRadius: "10px",

    border:
      "1px solid #E8E1D9",

    fontSize: "15px",

    fontFamily:
      "Inter, Segoe UI, Arial, sans-serif",

    color: "#2D3436",

    background: "#FFFFFF",

    caretColor: "#2D3436",

    outline: "none",

    boxSizing:
      "border-box" as const,

  };


  function RatingBox({
    title,
    value,
    setValue,
  }: {
    title: string;
    value: number;
    setValue: (
      v: number
    ) => void;
  }) {

    return (

      <div
        style={{
          flex: 1,
          minWidth: "150px",
          background: "#FAFAFA",
          padding: "15px",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >

        <strong
          style={{
            color: "#2D3436",
          }}
        >
          {title}
        </strong>


        <select
          value={value}

          onChange={(e) =>
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
            background: "white",
            color: "#2D3436",
          }}
        >

          {
            [1, 2, 3, 4, 5].map(
              (n) => (

                <option
                  key={n}
                  value={n}
                >
                  {"⭐".repeat(n)}
                </option>

              )
            )
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
          marginTop: 0,
          marginBottom: "25px",
        }}
      >
        Share your dining experience
        with other customers.
      </p>


      {/* Restaurant status */}

      {
        !restaurantSelected && (

          <div
            style={{
              background:
                "#FFF3E8",
              border:
                "1px solid #FFD0A8",
              color:
                "#A85612",
              padding:
                "12px 15px",
              borderRadius:
                "10px",
              marginBottom:
                "20px",
              fontSize:
                "14px",
            }}
          >
            🍽 Please search and select
            a restaurant above before
            submitting your review.
          </div>

        )
      }


      {/* Review Title */}

      <label
        style={{
          color: "#2D3436",
          fontWeight: 600,
        }}
      >
        Review Title
      </label>


      <input
        value={title}

        onChange={(e) =>
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
        }}
      />


      {/* Review Body */}

      <label
        style={{
          color: "#2D3436",
          fontWeight: 600,
        }}
      >
        Your Experience
      </label>


      <textarea
        value={body}

        onChange={(e) =>
          setBody(
            e.target.value
          )
        }

        placeholder=
          "Tell us about the food, service, and atmosphere..."

        rows={6}

        required

        style={{
          ...inputStyle,
          marginTop: "8px",
          marginBottom: "25px",
          resize: "vertical",
        }}
      />


      {/* Ratings */}

      <h3
        style={{
          color: "#2D3436",
        }}
      >
        Ratings
      </h3>


      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
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


      {/* Receipt */}

      <div
        style={{
          background: "#FAFAFA",
          padding: "18px",
          borderRadius: "12px",
          marginBottom: "25px",
        }}
      >

        <h3
          style={{
            marginTop: 0,
            color: "#2D3436",
          }}
        >
          📷 Receipt Verification
        </h3>


        <p
          style={{
            color: "#777",
            fontSize: "14px",
          }}
        >
          Upload your receipt to
          improve your Trust Score.
          Maximum file size is 5MB.
        </p>


        <input
          type="file"

          accept=
            ".jpg,.jpeg,.png"

          onChange={
            fileChange
          }
        />


        {
          receipt && (

            <p
              style={{
                color: "#2E7D32",
                fontSize: "14px",
                marginBottom: 0,
              }}
            >
              ✓ {receipt.name}
            </p>

          )
        }

      </div>


      {/* Submit */}

      <button
        type="submit"

        disabled={
          isLoading ||
          !restaurantSelected
        }

        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",

          background:
            isLoading ||
            !restaurantSelected
              ? "#AAA"
              : "#FF7043",

          color: "white",

          fontSize: "17px",

          fontWeight: "bold",

          cursor:
            isLoading ||
            !restaurantSelected
              ? "not-allowed"
              : "pointer",
        }}
      >

        {
          isLoading
            ? "Submitting..."
            : !restaurantSelected
            ? "Select a Restaurant First"
            : "Submit Review"
        }

      </button>

    </form>

  );

}