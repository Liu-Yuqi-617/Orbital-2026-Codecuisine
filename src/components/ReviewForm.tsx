import { useState } from "react";

export default function ReviewForm({
  addReview
}: {
  addReview: (review: any) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [taste, setTaste] = useState(5);
  const [value, setValue] = useState(5);
  const [ambiance, setAmbiance] = useState(5);
  const [orderID, setOrderID] = useState("");
  const [verified, setVerified] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    addReview({
      title,
      taste,
      value,
      ambiance,
      orderID,
      verified: false,
      image: file ? URL.createObjectURL(file) : null
    });

    setTitle("");
    setFile(null);
    setOrderID("");
  }

  return (
    <form onSubmit={submit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title"
      />

      <input
        type="number"
        min="1"
        max="5"
        value={taste}
        onChange={(e) => setTaste(Number(e.target.value))}
      />

      <input
        type="number"
        min="1"
        max="5"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />

      <input
        type="number"
        min="1"
        max="5"
        value={ambiance}
        onChange={(e) => setAmbiance(Number(e.target.value))}
      />

      <input
        value={orderID}
        onChange={(e) => setOrderID(e.target.value)}
        placeholder="Order ID (for verification)"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button type="submit">Submit</button>
    </form>
  );
}