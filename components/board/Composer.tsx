"use client";

import React, { useEffect, useState } from "react";
import { SECTIONS, TINTS } from "@/lib/constants";
import { M3Button } from "@/components/m3/Button";
import { M3IconButton } from "@/components/m3/IconButton";
import { M3TextField } from "@/components/m3/TextField";
import type { NewPostInput } from "@/hooks/usePosts";

const TYPES = [
  { id: "text",  icon: "notes",         label: "메모",   active: true },
  { id: "image", icon: "image",         label: "이미지", active: false },
  { id: "link",  icon: "link",          label: "링크",   active: true },
  { id: "video", icon: "smart_display", label: "영상",   active: true },
  { id: "file",  icon: "description",   label: "파일",   active: false },
];

interface Props {
  open: boolean;
  defaultSection: string;
  onClose: () => void;
  onCreate: (input: NewPostInput) => void | Promise<void>;
}

export function Composer({ open, defaultSection, onClose, onCreate }: Props) {
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tint, setTint] = useState("butter");
  const [section, setSection] = useState(defaultSection || "well");
  const [submitting, setSubmitting] = useState(false);

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
    }
  }, [open, defaultSection]);

  if (!open) return null;

  const needsUrl = type === "link" || type === "video";
  const needsTitle = type === "link" || type === "video";

  const canCreate =
    type === "text"
      ? text.trim().length > 0
      : needsUrl
        ? url.trim().length > 0
        : false;

  const deriveDomain = (raw: string): string => {
    try {
      return new URL(raw).hostname;
    } catch {
      return raw || "";
    }
  };

  const submit = async () => {
    if (!canCreate || submitting) return;

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
    } else {
      // video
      input = {
        type: "video",
        section,
        tint,
        title: title.trim() || "새 영상",
        url: url.trim(),
        rot,
      };
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
            const disabled = !t.active;
            return (
              <div key={t.id} style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (!disabled) setType(t.id);
                  }}
                  disabled={disabled}
                  title={disabled ? "곧 지원 예정" : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    padding: "0 14px",
                    borderRadius: 9999,
                    cursor: disabled ? "not-allowed" : "pointer",
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
                    opacity: disabled ? 0.38 : 1,
                  }}
                >
                  <span className="md-icon" style={{ fontSize: 18 }}>
                    {t.icon}
                  </span>
                  {t.label}
                </button>
                {disabled && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -2,
                      fontSize: 9,
                      fontFamily: "var(--md-sys-typescale-plain-font)",
                      fontWeight: 600,
                      color: "var(--md-sys-color-on-surface-variant)",
                      background: "var(--md-sys-color-surface-container-highest)",
                      borderRadius: 4,
                      padding: "1px 4px",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    곧 지원
                  </span>
                )}
              </div>
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

        {/* Text / memo field */}
        <M3TextField
          label={needsTitle ? "메모 추가 (선택)" : "어떤 생각을 공유할까요?"}
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
            게시
          </M3Button>
        </div>
      </div>
    </div>
  );
}
