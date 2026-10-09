"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4">
      <form
        action={action}
        className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold">Masuk Admin</h1>
          <p className="text-sm text-zinc-500">KabarBahagia</p>
        </div>
        <div>
          <label htmlFor="email" className="adm-label">
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="adm-input" />
        </div>
        <div>
          <label htmlFor="password" className="adm-label">
            Kata sandi
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="adm-input"
          />
        </div>
        {state?.error && (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="adm-btn w-full">
          {pending ? "Masuk…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
