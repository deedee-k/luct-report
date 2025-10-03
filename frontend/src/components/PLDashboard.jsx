import { useState, useEffect } from "react";
import axios from "axios";

export default function PLDashboard() {
  const [lectures, setLectures] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLectures() {
      const res = await axios.get("http://localhost:5000/api/lectures/with-ratings");
      setLectures(res.data);
    }
    fetchLectures();
  }, []);

  const downloadReport = () => {
    window.open("http://localhost:5000/api/reports/excel", "_blank");
  };

  const filtered = lectures.filter(
    (lec) =>
      lec.course_name.toLowerCase().includes(search.toLowerCase()) ||
      lec.lecturer_name.toLowerCase().includes(search.toLowerCase()) ||
      lec.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h3>Program Leader Dashboard</h3>
      <button className="download-btn" onClick={downloadReport}>
        Download Excel Report
      </button>

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
          <p><b>Students:</b> {lec.actual_students}/{lec.total_students}</p>
          <p><b>PRL Feedback:</b> {lec.prl_feedback || "No feedback yet"}</p>
          <p>
            <b>Average Rating:</b>{" "}
            {Number(lec.avg_rating).toFixed(1)} ⭐ ({lec.rating_count} ratings)
          </p>
        </div>
      ))}
    </div>
  );
}
