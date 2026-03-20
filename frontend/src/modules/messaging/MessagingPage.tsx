import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { FiSend, FiUser } from "react-icons/fi";

interface Conversation { contact_id: number; contact_nom: string; contact_prenom: string; contact_photo?: string; dernier_message: string; nb_non_lus: number; mis_a_jour: string; }
interface Message { id: number; expediteur_id: number; destinataire_id: number; contenu: string; est_lu: number; envoye_le: string; }

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected]  = useState<Conversation | null>(null);
  const [messages, setMessages]  = useState<Message[]>([]);
  const [text, setText]    = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/messages/conversations").then(r => setConversations(r.data?.conversations || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/messages/${selected.contact_id}`).then(r => setMessages(r.data?.messages || []));
  }, [selected]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      await api.post("/messages", { destinataire_id: selected.contact_id, contenu: text });
      const newMsg: Message = { id: Date.now(), expediteur_id: user!.id, destinataire_id: selected.contact_id, contenu: text, est_lu: 0, envoye_le: new Date().toISOString() };
      setMessages([...messages, newMsg]);
      setText("");
    } catch { } finally { setSending(false); }
  };

  return (
    <div className="messaging-layout">
      <div className="conversations-panel">
        <div className="panel-header"><h2>Messages</h2></div>
        {loading ? <div className="spinner" /> : conversations.length === 0 ? (
          <div className="empty-conversations"><p>Aucune conversation.</p></div>
        ) : (
          conversations.map(c => (
            <div key={c.contact_id} className={`conversation-item ${selected?.contact_id === c.contact_id ? "active" : ""}`}
              onClick={() => setSelected(c)}>
              <img src={c.contact_photo || `https://ui-avatars.com/api/?name=${c.contact_prenom}+${c.contact_nom}&background=7B5EA7&color=fff`} alt="" />
              <div className="conv-info">
                <div className="conv-name">{c.contact_prenom} {c.contact_nom}</div>
                <div className="conv-preview">{c.dernier_message}</div>
              </div>
              {c.nb_non_lus > 0 && <span className="conv-badge">{c.nb_non_lus}</span>}
            </div>
          ))
        )}
      </div>

      <div className="chat-panel">
        {!selected ? (
          <div className="chat-empty"><FiUser size={48} /><p>Sélectionnez une conversation</p></div>
        ) : (
          <>
            <div className="chat-header">
              <img src={selected.contact_photo || `https://ui-avatars.com/api/?name=${selected.contact_prenom}+${selected.contact_nom}&background=7B5EA7&color=fff`} alt="" />
              <h3>{selected.contact_prenom} {selected.contact_nom}</h3>
            </div>
            <div className="chat-messages">
              {messages.map(m => (
                <div key={m.id} className={`message ${m.expediteur_id === user?.id ? "sent" : "received"}`}>
                  <div className="message-bubble">{m.contenu}</div>
                  <div className="message-time">{new Date(m.envoye_le).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input type="text" placeholder="Écrire un message..." value={text} onChange={e => setText(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}><FiSend /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
