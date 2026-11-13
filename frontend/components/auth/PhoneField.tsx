"use client";
import { useEffect, useRef, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import CountryFlag from "./CountryFlag";
import { phoneCountries } from "@/data/phoneCountries";

type PhoneFieldProps = {
  id: string;
  label: string;
  countryCode: string;
  onCountryCodeChange: (countryCode: string) => void;
  error?: string;
  registration: UseFormRegisterReturn;
  autoComplete?: string;
};

export default function PhoneField({
  id,
  label,
  countryCode,
  onCountryCodeChange,
  error,
  registration,
  autoComplete = "tel-national",
}: PhoneFieldProps) {
  const [countryListOpen, setCountryListOpen] = useState(false);
  const countryPickerRef = useRef<HTMLDivElement>(null);
  const selectedCountry = phoneCountries.find(({ code }) => code === countryCode) ?? phoneCountries[0];
  const countryListId = `${id}-country-list`;

  useEffect(() => {
    if (!countryListOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !countryPickerRef.current?.contains(event.target)) {
        setCountryListOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCountryListOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [countryListOpen]);

  return (
    <div className="fgroup">
      <label htmlFor={id}>{label}</label>
      <div ref={countryPickerRef} className={`auth-phone-control${error ? " bad" : ""}`}>
        <button
          type="button"
          className="auth-phone-country-button"
          aria-label={`Choisir le pays : ${selectedCountry.name}, ${selectedCountry.code}`}
          aria-expanded={countryListOpen}
          aria-controls={countryListId}
          onClick={() => setCountryListOpen((open) => !open)}
        >
          <CountryFlag country={selectedCountry.country} />
          <span className="auth-phone-dial">{selectedCountry.code}</span>
          <svg className="auth-phone-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {countryListOpen && (
          <div id={countryListId} className="auth-phone-country-list" role="group" aria-label="Pays et indicatifs téléphoniques">
            {phoneCountries.map((country) => (
              <button
                key={country.country}
                type="button"
                className="auth-phone-country-option"
                aria-pressed={country.country === selectedCountry.country}
                onClick={() => {
                  onCountryCodeChange(country.code);
                  setCountryListOpen(false);
                }}
              >
                <CountryFlag country={country.country} />
                <span>{country.name}</span>
                <span className="auth-phone-option-code">{country.code}</span>
              </button>
            ))}
          </div>
        )}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          placeholder="Entrez votre numéro de téléphone"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="auth-phone-input"
          {...registration}
        />
      </div>
      {error && <span id={`${id}-error`} className="err">{error}</span>}
    </div>
  );
}
