"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import confetti from "canvas-confetti";

const BACKEND = import.meta.env.VITE_BACKEND; // 🔥 lisää URL tähän

export default function Home() {
  type TalkooInfo = {
    name: string;
    location: string;
    start: string;
    end: string;
  };

  type Task = {
  name: string;
  needed: number;
  };

  type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  allergies: string;
  };

  const [info, setInfo] = useState<TalkooInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedFirst, setSelectedFirst] = useState<string | null>(null);
  const [selectedSecond, setSelectedSecond] = useState<string | null>(null);

 
  const [form, setForm] = useState<FormData>({
  firstName: "",
  lastName: "",
  email: "",
  allergies: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // --- Fetch talkoo info ---
  useEffect(() => {
    fetch(`${BACKEND}?action=info`)
      .then((res) => res.json())
      .then(setInfo);

    fetch(`${BACKEND}?action=tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.firstName || !form.email || !form.allergies) {
      alert("Täytä pakolliset kentät.");
      return;
    }

    setSubmitting(true);

    const body = {
      ...form,
      firstChoice: selectedFirst,
      secondChoice: selectedSecond,
    };

    await fetch(BACKEND, {
      method: "POST",
      body: JSON.stringify(body),
    });

    setSubmitting(false);
    setSent(true);

    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  if (!info || tasks.length === 0) return <p>Ladataan…</p>;

  return (
    <div className="p-6 max-w-xl mx-auto font-sans">

      {/* --- Yläreunan tiedot --- */}
      <h1 className="text-3xl font-bold mb-1">{info.name}</h1>
      <p className="text-lg text-white-700">
        {info.location} • {new Date(info.start).toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" })} – {new Date(info.end).toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" })}
      </p>

      <hr className="my-6" />

      {sent ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Kiitos ilmoittautumisesta!</h2>
          <p>Sähköpostiisi lähetetään muistutus ennen tapahtumaa.</p>
        </div>
      ) : (
        <form onSubmit={submitForm} className="space-y-4">

          <div>
            <label className="font-semibold block">Etunimi*</label>
            <input
              name="firstName"
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="font-semibold block">Sukunimi</label>
            <input
              name="lastName"
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="font-semibold block">Sähköposti*</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="font-semibold block">Allergiat*</label>
            <input
              name="allergies"
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          {/* --- Ensisijainen tehtävä --- */}
          <div>
            <p className="font-semibold mb-1">Ensisijainen tehtävä (valinnainen)</p>
            <div className="flex flex-wrap gap-3">
              {tasks.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedFirst(t.name)}
                  className={clsx(
                    "px-4 py-2 border rounded-xl",
                    selectedFirst === t.name
                      ? "bg-blue-500 text-white border-blue-700"
                      : "bg-dark-100"
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* --- Toissijainen tehtävä --- */}
          <div>
            <p className="font-semibold mb-1">Toissijainen tehtävä (valinnainen)</p>
            <div className="flex flex-wrap gap-3">
              {tasks.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedSecond(t.name)}
                  className={clsx(
                    "px-4 py-2 border rounded-xl",
                    selectedSecond === t.name
                      ? "bg-green-500 text-white border-green-700"
                      : "bg-dark-100"
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {submitting ? "Lähetetään…" : "Lähetä ilmoittautuminen"}
          </button>
        </form>
      )}
    </div>
  );
}

