import { useState, useEffect } from "react";
import axios from "axios";

export default function PRLDashboard() {
  const [lectures, setLectures] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLectures() {
      const res = await axios.get("http://localhost:5000/api/lectures");
      setLectures(res.data);
    }
    fetchLectures();
  }, []);

  const handleFeedback = async (id) => {
    const feedback = feedbacks[id];
    await axios.put(`http://localhost:5000/api/lectures/${id}/feedback`, { feedback });
    alert("Feedback submitted!");
  };

  const filtered = lectures.filter(
    (lec) =>
      lec.course_name.toLowerCase().includes(search.toLowerCase()) ||
      lec.lecturer_name.toLowerCase().includes(search.toLowerCase()) ||
      lec.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h3>PRL Dashboard</h3>

      <input
        type="text"
        placeholder="Search lectures..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((lec) => (
        <div key={lec.id} className="card mb-2 p-3">
          <h5>{lec.course_name} ({lec.course_code})</h5>
          <p><b>Topic:</b> {lec.topic}</p>
          <p><b>Lecturer:</b> {lec.lecturer_name}</p>
          <p><b>Recommendations:</b> {lec.recommendations}</p>
          <p><b>Current Feedback:</b> {lec.prl_feedback || "None yet"}</p>

          <textarea
            className="form-control mb-2 feedback-area"
            placeholder="Enter feedback..."
            value={feedbacks[lec.id] || ""}
            onChange={(e) => setFeedbacks({ ...feedbacks, [lec.id]: e.target.value })}
          />

          <button className="btn btn-primary" onClick={() => handleFeedback(lec.id)}>
            Submit Feedback
          </button>
        </div>
      ))}
    </div>
  );
}
