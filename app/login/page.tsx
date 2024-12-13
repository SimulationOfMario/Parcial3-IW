'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './login.css';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
    if (res?.error) {
      setError(res.error as string);
    }
    if (res?.ok) {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    const res = await signIn("google", { redirect: false });
    if (res?.error) {
      setError(res.error as string);
    }
    if (res?.ok) {
      router.push('/');
    }
  };

  return (
    <section className="form-container">
      <form
        className="form"
        onSubmit={handleSubmit}
      >
        {error && <div className="error">{error}</div>}
        <h1 className="form-title">Sign In</h1>

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

        <button className="form-button">Sign In</button>

        <button
          type="button"
          className="form-button"
          onClick={handleGoogleSignIn}
        >
          Sign In with Google
        </button>

        <Link
          href="/registro"
          className="form-link"
        >
          Don't have an account?
        </Link>
      </form>
    </section>
  );
}