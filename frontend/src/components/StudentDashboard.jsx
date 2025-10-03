import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentDashboard({ user }) {
  const [lectures, setLectures] = useState([]);
  const [ratings, setRatings] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLectures() {
      const res = await axios.get("http://localhost:5000/api/lectures");
      setLectures(res.data);
    }
    fetchLectures();
  }, []);

  const handleRate = async (lectureId, rating) => {
    await axios.post("http://localhost:5000/api/ratings", {
      user_id: user.id,
      lecture_id: lectureId,
      rating,
    });
    setRatings({ ...ratings, [lectureId]: rating });
  };

  const filtered = lectures.filter(
    (lec) =>
      lec.course_name.toLowerCase().includes(search.toLowerCase()) ||
      lec.lecturer_name.toLowerCase().includes(search.toLowerCase()) ||
      lec.topic.toLowerCase().includes(search.toLowerCase())
  );

  const downloadReport = () => {
    window.open(`http://localhost:5000/api/reports/student/${user.id}`, "_blank");
  };

  return (
    <div>
      <h3>Student Dashboard</h3>
      <button className="download-btn" onClick={downloadReport}>
        Download My Report (Excel)
      </button>

      <input
        type="text"
        placeholder="Search lectures..."
        className="form-control mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((lec) => (
        <div key={lec.id} className="card mb-2 p-2">
          <h5>{lec.course_name} ({lec.course_code})</h5>
          <p><b>Topic:</b> {lec.topic}</p>
          <p><b>Lecturer:</b> {lec.lecturer_name}</p>
          <select
            className="rating-select"
            value={ratings[lec.id] || ""}
            onChange={(e) => handleRate(lec.id, e.target.value)}
          >
            <option value="">Rate Lecture</option>
            <option value="1">⭐</option>
            <option value="2">⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
          </select>
        </div>
      ))}
    </div>
  );
}
