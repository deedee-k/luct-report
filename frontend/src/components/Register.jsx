import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({});

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", form);
      alert("Registered successfully! Now login.");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="card p-4">
      <h3>Register</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <select
          className="form-control mb-2"
          name="role"
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="prl">Principal Lecturer</option>
          <option value="pl">Program Leader</option>
        </select>
        <button className="btn btn-success">Register</button>
      </form>
    </div>
  );
}
