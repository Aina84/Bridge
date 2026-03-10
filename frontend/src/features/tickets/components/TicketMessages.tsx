import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Avatar, Button, Textarea } from '@/components/ui';
import { formatDateTime } from '@/utils/date';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TicketMessage } from '@/types/ticket.types';

interface Props {
  messages: TicketMessage[];
  onSend: (content: string, files?: File[]) => void;
  isResolved?: boolean;
}

export const TicketMessages: React.FC<Props> = ({ messages, onSend, isResolved }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments);
    setContent('');
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-sm font-semibold text-slate-700">
        Conversation ({messages.length})
      </h3>

      {/* Messages */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucun message pour l'instant.</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.author.id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar
                  firstName={msg.author.firstName}
                  lastName={msg.author.lastName}
                  size="sm"
                  className="flex-shrink-0"
                />
                <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">
                      {isOwn ? 'Vous' : `${msg.author.firstName} ${msg.author.lastName}`}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(msg.createdAt)}</span>
                  </div>
                  <div
                    className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${isOwn
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                      }`}
                  >
                    {msg.content}
                  </div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {msg.attachments.map((att) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.fileName);
                        return isImage ? (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group transition-transform hover:scale-[1.02]"
                          >
                            <img
                              src={att.url}
                              alt={att.fileName}
                              className="h-32 w-32 object-cover rounded-lg border border-slate-200"
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors rounded-lg" />
                          </a>
                        ) : (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium group transition-all shrink-0 ${isOwn
                              ? 'bg-primary-700/40 border-primary-400/50 text-white hover:bg-primary-700/60'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 shadow-sm'
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg ${isOwn ? 'bg-primary-500/30 text-white' : 'bg-primary-50 text-primary-600'}`}>
                              <Paperclip className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0 pr-1">
                              <span className="truncate max-w-[140px] leading-tight">{att.fileName}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      {!isResolved ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <span className="text-xs text-slate-600 truncate max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="text-sm font-bold">&times;</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Votre réponse… (Ctrl+Entrée pour envoyer)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={isResolved}
              />
            </div>
            <div className="flex flex-col gap-2 pt-0.5">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                title="Joindre un fichier"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!content.trim() && attachments.length === 0}
                className="h-9 w-9 p-0"
                title="Envoyer (Ctrl+Entrée)"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 py-2 border-t border-slate-100">
          Ce ticket est fermé — les nouvelles réponses sont désactivées.
        </p>
      )}
    </div>
  );
};
