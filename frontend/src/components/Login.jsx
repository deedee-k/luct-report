import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", form);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      navigate("/"); // go to dashboard
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="card p-4">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
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
        <button className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}
