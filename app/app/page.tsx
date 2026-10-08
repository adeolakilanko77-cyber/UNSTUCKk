"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const CATEGORIES = ["School", "Career", "Work", "Relationships", "Family", "Money", "Personal growth", "A decision I must make", "Something else"];

export default function Home() {
  const [f, setF] = useState({ name: "", email: "", phone: "", category: CATEGORIES[0], problem: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [caseNo, setCaseNo] = useState("");

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit(e: any) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    for (let i = 0; i < 4; i++) {
      const num = "UNSTUCK-" + Math.floor(10000 + Math.random() * 90000);
      const { error } = await supabase.from("cases").insert({
        case_number: num, name: f.name.trim(), email: f.email.trim(),
        phone: f.phone.trim(), category: f.category, problem: f.problem.trim(),
      });
      if (!error) { setCaseNo(num); setBusy(false); return; }
      if (error.code !== "23505") { setErr("We could not send your case. Check your connection and try again."); setBusy(false); return; }
    }
    setErr("Something went wrong. Please try again.");
    setBusy(false);
  }

  return (
    <main className="wrap">
      <section className="hero">
        <h1>Feeling <span>stuck?</span></h1>
        <p>Tell us what is going on. A real person reads your case and gets back to you by email or phone. You are not alone in this.</p>
      </section>
      <section className="panel">
        {caseNo ? (
          <div className="done">
            <h2>We have your case</h2>
            <div className="num">{caseNo}</div>
            <p>Keep this number. We will reach out to you on the email or phone you gave us.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2>Share your problem</h2>
            <p className="sub">Only the UNSTUCK team can see this.</p>
            <div className="grid">
              <div><label htmlFor="n">Your name</label><input id="n" required value={f.name} onChange={set("name")} /></div>
              <div><label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} onChange={set("email")} /></div>
              <div><label htmlFor="p">Phone number</label><input id="p" type="tel" required value={f.phone} onChange={set("phone")} /></div>
              <div><label htmlFor="c">What is it about?</label>
                <select id="c" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="full"><label htmlFor="t">Tell us what is happening</label><textarea id="t" required value={f.problem} onChange={set("problem")} /></div>
            </div>
            {err && <p className="err">{err}</p>}
            <p><button disabled={busy}>{busy ? "Sending..." : "Send my case"}</button></p>
          </form>
        )}
      </section>
    </main>
  );
         }
