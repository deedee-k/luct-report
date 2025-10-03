import { useState } from "react";
import axios from "axios";

export default function LectureForm() {
  const [form, setForm] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/lectures", form);
    alert("Lecture submitted!");
    setForm({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <input className="form-control mb-2" name="faculty_name" placeholder="Faculty Name" onChange={handleChange} />
      <input className="form-control mb-2" name="class_name" placeholder="Class Name" onChange={handleChange} />
      <input className="form-control mb-2" name="week_of_reporting" placeholder="Week of Reporting" onChange={handleChange} />
      <input className="form-control mb-2" type="date" name="date_of_lecture" onChange={handleChange} />
      <input className="form-control mb-2" name="course_name" placeholder="Course Name" onChange={handleChange} />
      <input className="form-control mb-2" name="course_code" placeholder="Course Code" onChange={handleChange} />
      <input className="form-control mb-2" name="lecturer_name" placeholder="Lecturer Name" onChange={handleChange} />
      <input className="form-control mb-2" type="number" name="actual_students" placeholder="Actual Students" onChange={handleChange} />
      <input className="form-control mb-2" type="number" name="total_students" placeholder="Total Students" onChange={handleChange} />
      <input className="form-control mb-2" name="venue" placeholder="Venue" onChange={handleChange} />
      <input className="form-control mb-2" name="scheduled_time" placeholder="Scheduled Time" onChange={handleChange} />
      <input className="form-control mb-2" name="topic" placeholder="Topic" onChange={handleChange} />
      <textarea className="form-control mb-2" name="outcomes" placeholder="Learning Outcomes" onChange={handleChange} />
      <textarea className="form-control mb-2" name="recommendations" placeholder="Recommendations" onChange={handleChange} />
      <button className="btn btn-success">Submit</button>
    </form>
  );
}
