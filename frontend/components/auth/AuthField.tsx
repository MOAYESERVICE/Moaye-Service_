"use client";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export default function AuthField({
  id, label, type = "text", placeholder, auto, inputMode, maxLength, error, registration,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  auto?: string;
  inputMode?: "numeric" | "text" | "decimal" | "search" | "email" | "tel" | "url" | "none";
  maxLength?: number;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const input = (
    <input
      id={id}
      type={isPassword && passwordVisible ? "text" : type}
      placeholder={placeholder}
      autoComplete={auto}
      inputMode={inputMode}
      maxLength={maxLength}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`${error ? "inp bad" : "inp"}${isPassword ? " auth-password-input" : ""}`}
      {...registration}
    />
  );

  return (
    <div className="fgroup">
      <label htmlFor={id}>{label}</label>
      {isPassword ? (
        <div className="auth-password-control">
          {input}
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={passwordVisible}
            title={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A10.7 10.7 0 0112 5c6.4 0 10 7 10 7a15.7 15.7 0 01-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.7 10.7 0 004.1-.8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      ) : input}
      {error && <span id={`${id}-error`} className="err">{error}</span>}
    </div>
  );
}
