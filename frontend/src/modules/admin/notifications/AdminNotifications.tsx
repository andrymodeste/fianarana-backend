import { useState } from "react";
import api from "../../../api/axios";
import { FiSend } from "react-icons/fi";

export default function AdminNotifications() {
  const [form, setForm] = useState({ titre: "", message: "", cible: "tous" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre || !form.message) return;
    setLoading(true); setMsg("");
    try {
      const res = await api.post("/admin/notifications/bulk", form);
      setMsg(res.data.message);
      setForm({ titre: "", message: "", cible: "tous" });
    } catch (err: any) { setMsg(err.response?.data?.message || "Erreur"); }
    finally { setLoading(false); }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-container">
      <div className="page-header"><h1>Notifications système</h1></div>
      <div className="form-card" style={{ maxWidth: 600 }}>
        <h2>Envoyer une notification</h2>
        {msg && <div className={`alert ${msg.includes("Erreur") ? "alert-error" : "alert-success"}`}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destinataires</label>
            <select value={form.cible} onChange={set("cible")}>
              <option value="tous">Tous les utilisateurs</option>
              <option value="eleves">Tous les élèves</option>
              <option value="professeurs">Tous les professeurs</option>
            </select>
          </div>
          <div className="form-group"><label>Titre *</label><input value={form.titre} onChange={set("titre")} placeholder="Ex: Maintenance prévue" required /></div>
          <div className="form-group"><label>Message *</label><textarea value={form.message} onChange={set("message")} rows={4} placeholder="Votre message..." required /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSend /> {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}
