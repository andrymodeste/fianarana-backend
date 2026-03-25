import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { photoUrl } from "../../utils/photoUrl";
import { FiSend, FiUser, FiPlus, FiArrowLeft, FiSearch, FiEdit2, FiTrash2, FiXCircle, FiX, FiCheck } from "react-icons/fi";

interface Conversation {
  contact_id: number; contact_nom: string; contact_prenom: string;
  contact_photo?: string; dernier_message: string; nb_non_lus: number; mis_a_jour: string;
}
interface Message {
  id: number; expediteur_id: number; destinataire_id: number;
  contenu: string; est_lu: number; envoye_le: string;
  est_modifie?: number; est_supprime_expediteur?: number; est_supprime_destinataire?: number;
}
interface Contact {
  id: number; nom: string; prenom: string; photo_url?: string;
  role: string; cours_titre?: string; cours_id?: number;
}

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  // Actions sur les messages
  const [menuMsgId, setMenuMsgId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const avatar = (photo?: string | null, prenom?: string, nom?: string) =>
    photoUrl(photo) || `https://ui-avatars.com/api/?name=${prenom}+${nom}&background=7B5EA7&color=fff&size=80`;

  // Charger les conversations
  useEffect(() => {
    api.get("/messages/conversations")
      .then(r => setConversations(r.data?.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  // Charger les messages d'une conversation
  useEffect(() => {
    if (!selected) return;
    api.get(`/messages/${selected.contact_id}`).then(r => {
      setMessages(r.data?.messages || []);
    });
    setMenuMsgId(null);
    setEditingId(null);
  }, [selected]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (selected) setTimeout(() => inputRef.current?.focus(), 100); }, [selected]);
  useEffect(() => { if (editingId) setTimeout(() => editRef.current?.focus(), 50); }, [editingId]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handler = () => setMenuMsgId(null);
    if (menuMsgId) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuMsgId]);

  // Charger les contacts disponibles
  const openNewChat = async () => {
    setShowNewChat(true);
    setLoadingContacts(true);
    try {
      const r = await api.get("/messages/contacts");
      setContacts(r.data?.contacts || []);
    } catch { setContacts([]); }
    finally { setLoadingContacts(false); }
  };

  // Démarrer une conversation avec un contact
  const startConversation = (contact: Contact) => {
    const existing = conversations.find(c => c.contact_id === contact.id);
    if (existing) {
      setSelected(existing);
    } else {
      const newConv: Conversation = {
        contact_id: contact.id, contact_nom: contact.nom, contact_prenom: contact.prenom,
        contact_photo: contact.photo_url, dernier_message: "", nb_non_lus: 0, mis_a_jour: new Date().toISOString()
      };
      setConversations([newConv, ...conversations]);
      setSelected(newConv);
      setMessages([]);
    }
    setShowNewChat(false);
    setContactSearch("");
  };

  // Envoyer un message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      const res = await api.post("/messages/envoyer", { destinataire_id: selected.contact_id, contenu: text });
      const newMsg: Message = {
        id: res.data?.messageId || Date.now(), expediteur_id: user!.id,
        destinataire_id: selected.contact_id, contenu: text, est_lu: 0, envoye_le: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      setConversations(prev => prev.map(c =>
        c.contact_id === selected.contact_id ? { ...c, dernier_message: text, mis_a_jour: new Date().toISOString() } : c
      ));
      setText("");
    } catch { } finally { setSending(false); }
  };

  // ── Actions sur les messages ──

  // Modifier
  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.contenu);
    setMenuMsgId(null);
  };

  const confirmEdit = async () => {
    if (!editingId || !editText.trim()) return;
    try {
      await api.put(`/messages/${editingId}`, { contenu: editText.trim() });
      setMessages(prev => prev.map(m => m.id === editingId ? { ...m, contenu: editText.trim(), est_modifie: 1 } : m));
      setEditingId(null);
      setEditText("");
    } catch { }
  };

  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  // Retirer pour moi
  const handleDeleteForMe = async (msgId: number) => {
    setMenuMsgId(null);
    try {
      await api.put(`/messages/${msgId}/retirer`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { }
  };

  // Supprimer pour tout le monde
  const handleDeleteForAll = async (msgId: number) => {
    setMenuMsgId(null);
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, contenu: "Ce message a été supprimé", est_supprime_expediteur: 1, est_supprime_destinataire: 1 } : m
      ));
    } catch { }
  };

  // Toggle menu contextuel
  const toggleMenu = (e: React.MouseEvent, msgId: number) => {
    e.stopPropagation();
    setMenuMsgId(menuMsgId === msgId ? null : msgId);
  };

  // Filtrer les contacts
  const filteredContacts = contacts.filter(c => {
    if (!contactSearch) return true;
    const search = contactSearch.toLowerCase();
    return `${c.prenom} ${c.nom}`.toLowerCase().includes(search) || (c.cours_titre || "").toLowerCase().includes(search);
  });

  const groupedContacts: Record<string, Contact[]> = {};
  filteredContacts.forEach(c => {
    if (!groupedContacts[c.id]) groupedContacts[c.id] = [];
    groupedContacts[c.id].push(c);
  });

  const roleLabel = user?.role === "eleve" ? "Mes professeurs" : user?.role === "professeur" ? "Mes élèves" : "Utilisateurs";

  const isMine = (m: Message) => m.expediteur_id === user?.id;
  const isDeleted = (m: Message) => m.est_supprime_expediteur && m.est_supprime_destinataire;

  return (
    <div className="messaging-layout">
      {/* ── Panneau gauche : conversations ── */}
      <div className="conversations-panel">
        <div className="panel-header">
          <h2>Messages</h2>
          <button className="btn-new-chat" onClick={openNewChat} title="Nouvelle conversation"><FiPlus size={18} /></button>
        </div>

        {showNewChat && (
          <div className="new-chat-panel">
            <div className="new-chat-header">
              <button className="btn-back" onClick={() => { setShowNewChat(false); setContactSearch(""); }}><FiArrowLeft size={16} /></button>
              <span>Nouvelle conversation</span>
            </div>
            <div className="new-chat-search">
              <FiSearch size={14} />
              <input type="text" placeholder="Rechercher..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} autoFocus />
            </div>
            {loadingContacts ? (
              <div className="contacts-loading"><div className="spinner" /></div>
            ) : Object.keys(groupedContacts).length === 0 ? (
              <div className="contacts-empty">
                <p>{user?.role === "eleve" ? "Inscrivez-vous à un cours pour contacter son professeur." : "Aucun contact disponible."}</p>
              </div>
            ) : (
              <div className="contacts-list">
                <div className="contacts-section-label">{roleLabel}</div>
                {Object.values(groupedContacts).map(items => {
                  const c = items[0];
                  const courseNames = items.map(i => i.cours_titre).filter(Boolean);
                  return (
                    <div key={c.id} className="contact-item" onClick={() => startConversation(c)}>
                      <img src={avatar(c.photo_url, c.prenom, c.nom)} alt="" />
                      <div className="contact-info">
                        <div className="contact-name">{c.prenom} {c.nom}</div>
                        {courseNames.length > 0 && <div className="contact-course">{courseNames.join(", ")}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!showNewChat && (
          loading ? <div className="spinner" style={{ margin: "24px auto" }} /> : conversations.length === 0 ? (
            <div className="empty-conversations">
              <FiUser size={32} />
              <p>Aucune conversation.</p>
              <button className="btn btn-sm btn-primary" onClick={openNewChat}><FiPlus size={14} /> Nouvelle conversation</button>
            </div>
          ) : (
            conversations.map(c => (
              <div key={c.contact_id} className={`conversation-item ${selected?.contact_id === c.contact_id ? "active" : ""}`} onClick={() => setSelected(c)}>
                <img src={avatar(c.contact_photo, c.contact_prenom, c.contact_nom)} alt="" />
                <div className="conv-info">
                  <div className="conv-name">{c.contact_prenom} {c.contact_nom}</div>
                  <div className="conv-preview">{c.dernier_message}</div>
                </div>
                {c.nb_non_lus > 0 && <span className="conv-badge">{c.nb_non_lus}</span>}
              </div>
            ))
          )
        )}
      </div>

      {/* ── Panneau droit : chat ── */}
      <div className="chat-panel">
        {!selected ? (
          <div className="chat-empty">
            <FiUser size={48} />
            <p>Sélectionnez une conversation</p>
            <button className="btn btn-sm btn-outline" onClick={openNewChat}><FiPlus size={14} /> Nouvelle conversation</button>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <img src={avatar(selected.contact_photo, selected.contact_prenom, selected.contact_nom)} alt="" />
              <div><h3>{selected.contact_prenom} {selected.contact_nom}</h3></div>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-start-msg"><p>Commencez la conversation avec {selected.contact_prenom} !</p></div>
              )}
              {messages.map(m => (
                <div key={m.id} className={`message ${isMine(m) ? "sent" : "received"} ${isDeleted(m) ? "deleted" : ""}`}>

                  {/* Mode édition */}
                  {editingId === m.id ? (
                    <div className="message-edit-wrap">
                      <input ref={editRef} className="message-edit-input" value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }}
                      />
                      <div className="message-edit-actions">
                        <button className="msg-edit-btn confirm" onClick={confirmEdit} title="Valider"><FiCheck size={14} /></button>
                        <button className="msg-edit-btn cancel" onClick={cancelEdit} title="Annuler"><FiX size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Bulle de message */}
                      <div className={`message-bubble ${isDeleted(m) ? "bubble-deleted" : ""}`}>
                        {isDeleted(m) ? (
                          <span className="deleted-text"><FiXCircle size={13} /> Ce message a été supprimé</span>
                        ) : m.contenu}
                      </div>

                      {/* Heure + modifié */}
                      <div className="message-meta">
                        <span className="message-time">
                          {new Date(m.envoye_le).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {m.est_modifie === 1 && !isDeleted(m) && <span className="message-edited">modifié</span>}
                      </div>

                      {/* Menu contextuel : seulement sur ses propres messages non supprimés */}
                      {isMine(m) && !isDeleted(m) && (
                        <div className="message-actions-wrap">
                          <button className="msg-menu-trigger" onClick={e => toggleMenu(e, m.id)}>...</button>
                          {menuMsgId === m.id && (
                            <div className="msg-context-menu" onClick={e => e.stopPropagation()}>
                              <button onClick={() => startEdit(m)}><FiEdit2 size={13} /> Modifier</button>
                              <button onClick={() => handleDeleteForMe(m.id)}><FiXCircle size={13} /> Retirer pour moi</button>
                              <button className="danger" onClick={() => handleDeleteForAll(m.id)}><FiTrash2 size={13} /> Supprimer pour tous</button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="chat-input" onSubmit={handleSend}>
              <input ref={inputRef} type="text" placeholder="Écrire un message..." value={text} onChange={e => setText(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-send" disabled={sending || !text.trim()}><FiSend size={18} /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
