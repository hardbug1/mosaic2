"use client";

import React, { useEffect, useRef, useState } from "react";
import { SECTIONS, TINTS } from "@/lib/constants";
import { M3Button } from "@/components/m3/Button";
import { M3IconButton } from "@/components/m3/IconButton";
import { M3TextField } from "@/components/m3/TextField";
import { createClient } from "@/lib/supabase/client";
import type { NewPostInput } from "@/hooks/usePosts";

const TYPES = [
  { id: "text",  icon: "notes",         label: "메모",   active: true },
  { id: "image", icon: "image",         label: "이미지", active: true },
  { id: "link",  icon: "link",          label: "링크",   active: true },
  { id: "video", icon: "smart_display", label: "영상",   active: true },
  { id: "file",  icon: "description",   label: "파일",   active: true },
];

interface Props {
  open: boolean;
  defaultSection: string;
  boardId: string;
  onClose: () => void;
  onCreate: (input: NewPostInput) => void | Promise<void>;
}

/** Converts bytes to a human-readable string like "2.4 MB" or "340 KB". */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** Extracts the lowercased extension from a file name, or "bin" as fallback. */
function getExt(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "bin";
}

/** 업로드 허용 최대 크기 (M5: 무제한 업로드 방지). */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export function Composer({ open, defaultSection, boardId, onClose, onCreate }: Props) {
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tint, setTint] = useState("butter");
  const [section, setSection] = useState(defaultSection || "well");
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File state for image/file types
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state whenever dialog opens
  useEffect(() => {
    if (open) {
      setType("text");
      setText("");
      setTitle("");
      setUrl("");
      setTint("butter");
      setSection(defaultSection || "well");
      setSubmitting(false);
      setUploadError(null);
      setPickedFile(null);
      setPreviewUrl(null);
    }
  }, [open, defaultSection]);

  // Revoke object URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  const needsUrl = type === "link" || type === "video";
  const needsTitle = type === "link" || type === "video";
  const needsFile = type === "image" || type === "file";

  const canCreate =
    type === "text"
      ? text.trim().length > 0
      : needsUrl
        ? url.trim().length > 0
        : needsFile
          ? pickedFile !== null
          : false;

  const deriveDomain = (raw: string): string => {
    try {
      return new URL(raw).hostname;
    } catch {
      return raw || "";
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadError(null);
    if (!file) {
      setPickedFile(null);
      setPreviewUrl(null);
      return;
    }
    setPickedFile(file);
    if (type === "image") {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const submit = async () => {
    if (!canCreate || submitting) return;
    setUploadError(null);

    let input: NewPostInput;
    const rot = Math.random() * 3 - 1.5;

    if (type === "text") {
      input = { type: "text", section, tint, text: text.trim(), rot };
    } else if (type === "link") {
      input = {
        type: "link",
        section,
        tint,
        title: title.trim() || "제목 없는 링크",
        url: url.trim(),
        domain: deriveDomain(url.trim()),
        rot,
      };
    } else if (type === "video") {
      input = {
        type: "video",
        section,
        tint,
        title: title.trim() || "새 영상",
        url: url.trim(),
        rot,
      };
    } else if ((type === "image" || type === "file") && pickedFile) {
      if (pickedFile.size > MAX_UPLOAD_BYTES) {
        setUploadError(
          `파일이 너무 큽니다 (최대 ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB).`,
        );
        return;
      }
      const ext = getExt(pickedFile.name);
      const path = `${boardId}/${crypto.randomUUID()}.${ext}`;

      setSubmitting(true);
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("board-media")
        .upload(path, pickedFile);

      if (upErr) {
        setUploadError(`업로드 실패: ${upErr.message}`);
        setSubmitting(false);
        return;
      }

      if (type === "image") {
        input = {
          type: "image",
          section,
          tint,
          text: text.trim() || null,
          media_path: path,
          rot,
        };
      } else {
        input = {
          type: "file",
          section,
          tint,
          text: text.trim() || null,
          media_path: path,
          file_name: pickedFile.name,
          file_size: formatFileSize(pickedFile.size),
          file_ext: ext.toUpperCase(),
          rot,
        };
      }

      try {
        await onCreate(input);
        onClose();
      } catch {
        // M5: 게시물 저장 실패 시 업로드된 orphan object 보상 삭제
        await supabase.storage.from("board-media").remove([path]);
        setUploadError("게시물 저장에 실패했습니다.");
      } finally {
        setSubmitting(false);
      }
      return;
    } else {
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(input);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const tintKeys = Object.keys(TINTS);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--md-sys-color-surface-container-high)",
          borderRadius: 28,
          padding: 24,
          boxShadow: "var(--md-sys-elevation-level3)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            className="md-headline-small"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            새 게시물
          </div>
          <M3IconButton icon="close" onClick={onClose} />
        </div>

        {/* Type chooser */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TYPES.map((t) => {
            const sel = type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  setPickedFile(null);
                  setPreviewUrl(null);
                  setUploadError(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 9999,
                  cursor: "pointer",
                  border: "none",
                  background: sel
                    ? "var(--md-sys-color-secondary-container)"
                    : "transparent",
                  boxShadow: sel
                    ? "none"
                    : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                  color: sel
                    ? "var(--md-sys-color-on-secondary-container)"
                    : "var(--md-sys-color-on-surface-variant)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <span className="md-icon" style={{ fontSize: 18 }}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* URL input for link / video */}
        {needsUrl && (
          <M3TextField
            label={type === "link" ? "링크 주소" : "영상 URL"}
            value={url}
            onChange={setUrl}
          />
        )}

        {/* Title field for link / video */}
        {needsTitle && (
          <M3TextField
            label={type === "link" ? "링크 제목 (선택)" : "영상 제목 (선택)"}
            value={title}
            onChange={setTitle}
          />
        )}

        {/* File picker for image / file */}
        {needsFile && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={type === "image" ? "image/*" : undefined}
              style={{ display: "none" }}
              onChange={handleFilePick}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--md-sys-color-outline-variant)",
                borderRadius: 12,
                padding: 16,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 96,
                background: pickedFile
                  ? "var(--md-sys-color-surface-container)"
                  : "transparent",
                transition: "background 120ms",
              }}
            >
              {type === "image" && previewUrl ? (
                /* Image preview */
                <div style={{ width: "100%", position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{
                      width: "100%",
                      maxHeight: 160,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "var(--md-sys-color-on-surface-variant)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                      textAlign: "center",
                    }}
                  >
                    {pickedFile?.name}
                  </div>
                </div>
              ) : pickedFile ? (
                /* File chosen (non-image) */
                <div style={{ textAlign: "center" }}>
                  <span className="md-icon" style={{ fontSize: 32, color: "var(--md-sys-color-primary)" }}>
                    description
                  </span>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--md-sys-color-on-surface)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                    }}
                  >
                    {pickedFile.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--md-sys-color-on-surface-variant)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                    }}
                  >
                    {formatFileSize(pickedFile.size)}
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div style={{ textAlign: "center" }}>
                  <span
                    className="md-icon"
                    style={{
                      fontSize: 32,
                      color: "var(--md-sys-color-on-surface-variant)",
                    }}
                  >
                    {type === "image" ? "add_photo_alternate" : "upload_file"}
                  </span>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "var(--md-sys-color-on-surface-variant)",
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                    }}
                  >
                    {type === "image" ? "클릭하여 이미지 선택" : "클릭하여 파일 선택"}
                  </div>
                </div>
              )}
            </div>
            {uploadError && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "var(--md-sys-color-error)",
                  fontFamily: "var(--md-sys-typescale-plain-font)",
                }}
              >
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Text / memo field */}
        <M3TextField
          label={needsTitle ? "메모 추가 (선택)" : needsFile ? "설명 추가 (선택)" : "어떤 생각을 공유할까요?"}
          value={text}
          onChange={setText}
          multiline
          rows={3}
        />

        {/* Tint picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="md-label-medium"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            색상
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {tintKeys.map((k) => (
              <button
                key={k}
                onClick={() => setTint(k)}
                title={k}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9999,
                  cursor: "pointer",
                  border: "none",
                  background: TINTS[k].bg,
                  boxShadow:
                    tint === k
                      ? "0 0 0 2px var(--md-sys-color-surface-container-high), 0 0 0 4px var(--md-sys-color-primary)"
                      : `inset 0 0 0 1px ${TINTS[k].line}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Section picker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            className="md-label-medium"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            섹션
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SECTIONS.map((s) => {
              const sel = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  style={{
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 9999,
                    cursor: "pointer",
                    border: "none",
                    background: sel
                      ? "var(--md-sys-color-primary)"
                      : "transparent",
                    boxShadow: sel
                      ? "none"
                      : "inset 0 0 0 1px var(--md-sys-color-outline-variant)",
                    color: sel
                      ? "var(--md-sys-color-on-primary)"
                      : "var(--md-sys-color-on-surface-variant)",
                    fontFamily: "var(--md-sys-typescale-plain-font)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 4,
          }}
        >
          <M3Button variant="text" onClick={onClose} disabled={submitting}>
            취소
          </M3Button>
          <M3Button
            variant="filled"
            icon="add"
            onClick={submit}
            disabled={!canCreate || submitting}
          >
            {submitting && needsFile ? "업로드 중…" : "게시"}
          </M3Button>
        </div>
      </div>
    </div>
  );
}
