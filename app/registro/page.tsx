"use client";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { register } from "@/actions/register";
import './registro.css';

export default function Register() {
  const [error, setError] = useState<string>();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const r = await register({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
    });
    ref.current?.reset();
    if (r?.error) {
      setError(r.error);
      return;
    } else {
      // Autologin después del registro
      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });
      if (res?.ok) {
        router.push("/");
      } else {
        setError("Error al iniciar sesión automáticamente");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signIn("google", { redirect: false });
    if (res?.error) {
      setError(res.error as string);
    }
    if (res?.ok) {
      router.push("/");
    }
  };

  return (
    <section className="form-container">
      <form
        ref={ref}
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }}
        className="form"
      >
        {error && <div className="error">{error}</div>}
        <h1 className="form-title">Register</h1>

        <label className="form-label">Full Name</label>
        <input
          type="text"
          placeholder="Full Name"
          className="form-input"
          name="name"
        />

        <label className="form-label">Email</label>
        <input
          type="email"
          placeholder="Email"
          className="form-input"
          name="email"
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="form-input"
          name="password"
        />

        <button className="form-button">Sign up</button>

        <button
          type="button"
          className="form-button"
          onClick={handleGoogleSignIn}
        >
          Sign up with Google
        </button>

        <Link
          href="/login"
          className="form-link"
        >
          Already have an account?
        </Link>
      </form>
    </section>
  );
}