import { useState } from "react";

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
}: {
  addReview: (review: any) => void;
  isLoading?: boolean
}) {
  const [restaurantId, setRestaurantId] = useState(0);
  const [title, setTitle] = useState("");
  const [taste, setTaste] = useState(5);
  const [value, setValue] = useState(5);
  const [ambiance, setAmbiance] = useState(5);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const formData: ReviewFormData = {
      restaurantId: restaurantId,
      title: title,
      body: body,
      taste: taste,
      value: value,
      ambiance: ambiance,
      receipt: file || undefined,
    };

    addReview(formData);

    setRestaurantId(0);
    setTitle("");
    setBody("");
    setTaste(3);
    setValue(3);
    setAmbiance(3);
    setFile(null);
  }

  function fileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large, max 5MB");
      return;
    }

    setFile(file);
  }

  return (
    <form onSubmit={submit}
      style={{
        border: "1px solid #ddd",
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Restaurant ID:
        </label>

        <input
          value={restaurantId || ""}
          onChange={(e) => setRestaurantId(Number(e.target.value) || 0)}
          placeholder="Enter restaurant ID"
          required
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Title:
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter review title"
          required
          maxLength={150}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "15px",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Taste:
          </label>

          <select
            value={taste}
            onChange={(e) => setTaste(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ccc",
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Value:
          </label>
          <select
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ccc",
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Ambiance *
          </label>
          <select
            value={ambiance}
            onChange={(e) => setAmbiance(parseInt(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ccc",
            }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Receipt Photo (optional)
        </label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={fileChange}
          style={{ padding: "5px 0" }}
        />
        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
          Upload a receipt to verify your visit (JPG/PNG, max 5MB)
        </p>
        {file && (
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#28a745" }}>
            Selected: {file.name}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          color: "white",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Submitting..." : "Submit Review"}
      </button>

    </form>
  );
}