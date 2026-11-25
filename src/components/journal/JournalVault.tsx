"use client";

import React, { useEffect, useState } from "react";
import { Upload, FileText, Trash2, ExternalLink, Loader2, Lock } from "lucide-react";

interface JournalAttachment {
  id: string;
  title: string;
  notes?: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export function JournalVault() {
  const [attachments, setAttachments] = useState<JournalAttachment[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadAttachments = async () => {
    try {
      const res = await fetch("/api/journal");
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim() || file.name);
      if (notes.trim()) formData.append("notes", notes.trim());

      const res = await fetch("/api/journal", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.attachment) {
          setAttachments((prev) => [data.attachment, ...prev]);
        }
        setTitle("");
        setNotes("");
        setFile(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
    await fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  };

  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-bold text-foreground">
              Личный архив практик и заметок
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-sage/15 text-brand-sage">
              <Lock className="w-3 h-3" />
              <span>Private Neon Storage</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Сохраняйте заполненные таблицы А-В-С, рисунки состояний или текстовые рефлексии в приватное хранилище.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            Название заметки
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Дневник тревоги"
            className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-brand-sage"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            Комментарий
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Контекст или триггер"
            className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-brand-sage"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            Файл (фото, PDF, txt)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-sage/15 file:text-brand-sage hover:file:bg-brand-sage/25 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={!file || isUploading}
          className="px-4 py-2 rounded-xl bg-brand-dark dark:bg-brand-sage text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-1.5 h-9"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Загрузка...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Сохранить</span>
            </>
          )}
        </button>
      </form>

      {/* Saved Files List */}
      {isLoading ? (
        <div className="text-xs text-muted-foreground py-3">Загрузка архива из Neon...</div>
      ) : attachments.length === 0 ? (
        <div className="text-xs text-muted-foreground py-3 border-t border-border">
          Пока нет загруженных материалов. Прикрепите первый файл выше.
        </div>
      ) : (
        <div className="space-y-2 pt-3 border-t border-border">
          {attachments.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-brand-sage/15 text-brand-sage shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.fileName} &bull; {Math.max(1, Math.round(item.sizeBytes / 1024))} КБ
                    {item.notes ? ` • ${item.notes}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border hover:border-brand-sage text-xs font-medium text-foreground transition"
                >
                  <span>Открыть</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                  title="Удалить файл"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
