"use client";
import { useEffect, useState } from "react";
import { supabase, ADMIN_EMAIL } from "../../lib/supabase";

const STATUSES = ["New", "In progress", "Resolved"];

export default function Admin() {
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [cases, setCases] = useState<any[]>([]);

  async function load() {
    const { data } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
    setCases(data || []);
  }

  async function check() {
    const { data } = await supabase.auth.getSession();
    const mail = data.session?.user?.email?.toLowerCase();
    if (mail === ADMIN_EMAIL) { setOk(true); load(); }
    else { if (mail) await supabase.auth.signOut(); setOk(false); }
    setReady(true);
  }
  useEffect(() => { check(); }, []);

  async function login(e: any) {
    e.preventDefault();
    setErr("");
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) { setErr("This email is not allowed here."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) { setErr("Wrong email or password."); return; }
    check();
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("cases").update({ status }).eq("id", id);
    load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this case for good?")) return;
    await supabase.from("cases").delete().eq("id", id);
    load();
  }

  if (!ready) return <main className="wrap"><p>Loading...</p></main>;

  if (!ok)
    return (
      <main className="wrap">
        <form className="panel login" onSubmit={login}>
          <h2>Admin sign in</h2>
          <p className="sub">Only the owner can enter.</p>
          <label htmlFor="a">Email</label>
          <input id="a" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <p />
          <label htmlFor="b">Password</label>
          <input id="b" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} />
          {err && <p className="err">{err}</p>}
          <p><button>Sign in</button></p>
        </form>
      </main>
    );

  return (
    <main className="wrap">
      <div className="bar">
        <h1 style={{ margin: 0 }}>Cases ({cases.length})</h1>
        <div className="row" style={{ margin: 0 }}>
          <button className="ghost" onClick={load}>Refresh</button>
          <button className="ghost" onClick={async () => { await supabase.auth.signOut(); setOk(false); }}>Sign out</button>
        </div>
      </div>
      {cases.length === 0 && <p>No cases yet. When someone sends a problem, it appears here.</p>}
      {cases.map((c) => (
        <article className="case" key={c.id}>
          <h3>{c.case_number}</h3>
          <p className="meta">
            {c.name} | <a href={`mailto:${c.email}`}>{c.email}</a> | <a href={`tel:${c.phone}`}>{c.phone}</a><br />
            {c.category} | {new Date(c.created_at).toLocaleString()}
          </p>
          <div className="problem">{c.problem}</div>
          <div className="row">
            <select value={c.status} onChange={(e) => setStatus(c.id, e.target.value)} aria-label="Status">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="ghost" onClick={() => remove(c.id)}>Delete</button>
          </div>
        </article>
      ))}
    </main>
  );
}
