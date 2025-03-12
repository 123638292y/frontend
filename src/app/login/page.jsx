"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./login-form.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers /home
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/home");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.role) {
      setError("Veuillez sélectionner un rôle (admin ou super-admin).");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      console.log("Connexion réussie:", data);

      // Stocker le token et le nom d'utilisateur dans le localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      // Forcer la redirection et le rechargement
      router.push("/home");
      window.location.href = "/home";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>DJERBAEXPLORE</h1>
        <p className={styles.welcomeText}>
          Welcome back! Please login to your account.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>

          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === "admin"}
                onChange={handleChange}
              />
              <span className={styles.radioText}>Admin</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="super-admin"
                checked={formData.role === "super-admin"}
                onChange={handleChange}
              />
              <span className={styles.radioText}>Super Admin</span>
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>

        <div className={styles.footer}>
          <a href="/terms" className={styles.footerLink}>
            Term of use
          </a>
          <span className={styles.footerDot}>·</span>
          <a href="/privacy" className={styles.footerLink}>
            Privacy policy
          </a>
        </div>
      </div>
    </div>
  );
}
