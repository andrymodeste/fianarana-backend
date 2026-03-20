import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { FiSearch, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

interface User { id: number; nom: string; prenom: string; email: string; role: string; ville?: string; est_actif: number; cree_le: string; }

export default function UserManagement() {
  const [users, setUsers]     = useState<User[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");

  const load = (q?: string) => {
    setLoading(true);
    api.get("/admin/utilisateurs", { params: q ? { search: q } : {} })
      .then(r => setUsers(r.data?.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(search); };

  const toggleActive = async (id: number, actif: number) => {
    await api.put(`/admin/utilisateurs/${id}/actif`, { actif: actif ? 0 : 1 });
    setUsers(users.map(u => u.id === id ? { ...u, est_actif: actif ? 0 : 1 } : u));
    setMsg(`Compte ${actif ? "désactivé" : "activé"}`);
    setTimeout(() => setMsg(""), 2000);
  };

  const changeRole = async (id: number, role: string) => {
    const newRole = prompt("Nouveau rôle (eleve, professeur, admin)", role);
    if (!newRole || newRole === role) return;
    try { await api.put(`/admin/utilisateurs/${id}/role`, { role: newRole }); setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u)); }
    catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try { await api.delete(`/admin/utilisateurs/${id}`); setUsers(users.filter(u => u.id !== id)); }
    catch (err: any) { alert(err.response?.data?.message || "Erreur"); }
  };

  const roleColor: Record<string, string> = { eleve: "blue", professeur: "purple", admin: "red" };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Gestion des utilisateurs</h1><p>{users.length} utilisateurs</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <form onSubmit={handleSearch} className="search-bar">
        <input type="search" placeholder="Rechercher par nom, email ou ville..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-primary"><FiSearch /></button>
      </form>
      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Ville</th><th>Statut</th><th>Inscrit le</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.prenom} {u.nom}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`badge-role role-${roleColor[u.role] || "gray"}`}>{u.role}</span></td>
                  <td>{u.ville || "-"}</td>
                  <td><span className={u.est_actif ? "badge-success" : "badge-error"}>{u.est_actif ? "Actif" : "Inactif"}</span></td>
                  <td>{new Date(u.cree_le).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <div className="table-actions">
                      <button title={u.est_actif ? "Désactiver" : "Activer"} className={`btn btn-sm ${u.est_actif ? "btn-outline" : "btn-primary"}`} onClick={() => toggleActive(u.id, u.est_actif)}>
                        {u.est_actif ? <FiX /> : <FiCheck />}
                      </button>
                      <button title="Changer le rôle" className="btn btn-sm btn-outline" onClick={() => changeRole(u.id, u.role)}><FiEdit2 /></button>
                      <button title="Supprimer" className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
