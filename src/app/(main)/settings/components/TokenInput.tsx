"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function TokenInput() {
  const { token, setToken } = useAuthStore();
  const [inputValue, setInputValue] = useState(token ?? "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // now we are on the client. EDIT: how did we get ontop of the client, past me?
  }, []);

  useEffect(() => {
    if (mounted) setInputValue(token ?? "");
  }, [token, mounted]);

  if (!mounted) return null; // avoid SSR mismatch, TODO figure this out further too
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToken(inputValue);
    console.log("Token updated:", inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="token" className="font-medium">
        Enter Token:
      </label>
      <input
        id="token"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="rounded border p-2"
        placeholder="Type your token here"
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Save Token
      </button>

      {token && (
        <p className="mt-2 text-green-600">
          Current token in store: <strong>{token}</strong>
        </p>
      )}
    </form>
  );
}
