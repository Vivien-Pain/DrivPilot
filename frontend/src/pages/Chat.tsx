import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../services/apiService';
import { useAuth } from '../store/useAuth';
import { Send, MessageSquare, UserCircle2 } from 'lucide-react';

interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    sender_first_name: string;
}

export const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchContacts = async () => {
        const response = await apiFetch('/messages/contacts');
        setContacts(response.data ?? []);
    };

    const fetchMessages = async (contactId: string) => {
        const response = await apiFetch(`/messages/${contactId}`);
        setMessages(response.data ?? []);
        scrollToBottom();
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (selectedContact) {
            fetchMessages(selectedContact.id);
            const interval = setInterval(() => fetchMessages(selectedContact.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        const content = newMessage;
        setNewMessage('');

        await apiFetch('/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId: selectedContact.id, content }),
        });

        fetchMessages(selectedContact.id);
    };

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-rose-100 text-rose-700',
        INSTRUCTOR: 'bg-blue-100 text-blue-700',
        STUDENT: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10 h-screen flex flex-col">
                <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:flex-row">

                    <aside className="w-full border-r border-slate-200 bg-slate-50 md:w-80 flex flex-col">
                        <div className="border-b border-slate-200 p-6 bg-white">
                            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <MessageSquare className="text-[#FF7F50]" size={24} />
                                Messagerie
                            </h1>
                            <p className="mt-1 text-xs text-slate-500">Contactez votre équipe ou vos élèves.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {contacts.length === 0 && (
                                <div className="text-center text-sm text-slate-400 mt-10">Aucun contact disponible.</div>
                            )}
                            {contacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left transition ${selectedContact?.id === contact.id ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-100'}`}
                                >
                                    <UserCircle2 size={40} className="text-slate-300" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900 truncate">{contact.first_name} {contact.last_name}</div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${roleColors[contact.role]}`}>
                                            {contact.role === 'ADMIN' ? 'Gérant' : contact.role === 'INSTRUCTOR' ? 'Moniteur' : 'Élève'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className="flex-1 flex flex-col bg-white h-full relative">
                        {selectedContact ? (
                            <>
                                <div className="border-b border-slate-100 p-6 flex items-center gap-3 bg-white/50 backdrop-blur z-10 sticky top-0">
                                    <UserCircle2 size={40} className="text-slate-300" />
                                    <div>
                                        <h2 className="font-bold text-slate-900">{selectedContact.first_name} {selectedContact.last_name}</h2>
                                        <div className="text-xs text-slate-500">Conversation sécurisée</div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {messages.map((msg) => {
                                        const isMe = String(msg.sender_id) === String(user.userId || user.id);
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm leading-relaxed ${isMe ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                                                    {!isMe && <div className="text-xs font-bold mb-1 opacity-50">{msg.sender_first_name}</div>}
                                                    {msg.content}
                                                    <div className={`text-[10px] mt-2 ${isMe ? 'text-slate-400 text-right' : 'text-slate-400 text-left'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-4 bg-white">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Écrivez votre message..."
                                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 outline-none focus:border-[#FF7F50] focus:ring-4 focus:ring-orange-100"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="rounded-2xl bg-[#FF7F50] px-5 py-3 text-white transition hover:bg-[#E66E45] disabled:opacity-50 flex items-center justify-center"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                                <MessageSquare size={64} className="opacity-20 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">Aucune conversation ouverte</h3>
                                <p className="mt-2 text-sm">Sélectionnez un contact dans le menu latéral pour démarrer un échange.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};