"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import styles from "./admin-form.module.css";

export default function AdminPage() {
  // États pour le formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    role: "admin",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // États pour la liste des administrateurs
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [errorAdmins, setErrorAdmins] = useState("");

  // Gestion des changements dans le formulaire
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Supprimer l'erreur dès que l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Réinitialiser les erreurs

    try {
      const response = await fetch("http://localhost:5000/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text(); // Récupère la réponse brute
      console.log("Réponse brute du serveur:", text);

      let data;
      try {
        data = JSON.parse(text); // Essayez de parser en JSON
      } catch (e) {
        throw new Error("La réponse du serveur n'est pas un JSON valide");
      }

      if (!response.ok) {
        console.error("Erreur backend:", data);
        if (data.errors) {
          setErrors(data.errors); // Gestion des erreurs spécifiques
        } else {
          setErrors({ general: data.message || "Une erreur est survenue." });
        }
        throw new Error(data.message || "Erreur lors de l'ajout.");
      }

      // Réinitialiser le formulaire après succès
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        role: "admin",
      });

      // Afficher le message de succès
      setErrors({ general: "Administrateur ajouté avec succès." });

      // Recharger la liste des administrateurs
      loadAdmins();
    } catch (error: any) {
      console.error("Erreur frontend:", error.message);
      setErrors({ general: error.message }); // Afficher l'erreur générale
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer tous les administrateurs
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/all");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des administrateurs.");
      }
      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setErrorAdmins(err.message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Supprimer un administrateur
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'administrateur.");
      }
      // Recharger la liste après suppression
      loadAdmins();
    } catch (err) {
      setErrorAdmins(err.message);
    }
  };

  // Charger les administrateurs au montage du composant
  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className={styles.container}>
      {/* Formulaire d'ajout d'administrateur */}
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Ajouter un administrateur</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName">Prénom</label>
            <input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="lastName">Nom</label>
            <input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <p className={styles.error}>{errors.username}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === "admin"}
                onChange={handleChange}
              />
              Admin
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="super-admin"
                checked={formData.role === "super-admin"}
                onChange={handleChange}
              />
              Super Admin
            </label>
          </div>

          {errors.general && <p className={styles.error}>{errors.general}</p>}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? "Ajout en cours..." : "Ajouter l'administrateur"}
          </button>
        </form>
      </div>

      {/* Liste des administrateurs */}
      <div className={styles.listWrapper}>
        <h1>Liste des Administrateurs</h1>
        {loadingAdmins ? (
          <p>Chargement en cours...</p>
        ) : errorAdmins ? (
          <p className={styles.error}>{errorAdmins}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Nom d'utilisateur</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.firstName}</td>
                  <td>{admin.lastName}</td>
                  <td>{admin.username}</td>
                  <td>{admin.role}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className={styles.deleteButton}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}