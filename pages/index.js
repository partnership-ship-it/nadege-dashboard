import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';

// ─── MOT DE PASSE ────────────────────────────────────────────────────────────
const PASSWORD = 'Nadege99!';
// ─────────────────────────────────────────────────────────────────────────────

const statusMap = {
  'Client':        { cls: 'badge-client',    label: 'Client',        order: 0 },
  'Répondu':       { cls: 'badge-repondu',   label: 'Répondu',       order: 1 },
  'Relance J+10':  { cls: 'badge-relance',   label: 'Relance J+10',  order: 2 },
  'Relance J+5':   { cls: 'badge-relance5',  label: 'Relance J+5',   order: 3 },
  'Email envoyé':  { cls: 'badge-email',     label: 'Email envoyé',  order: 4 },
  'À contacter':   { cls: 'badge-contacter', label: 'À contacter',   order: 5 },
  'Pas intéressé': { cls: 'badge-non',       label: 'Pas intéressé', order: 6 },
};

const actionColors = {
  '✅ En cours - suivi actif':  '#E8F5E9',
  '⏳ Attendre retour':         '#FFF8E1',
  '📞 Relancer maintenant':     '#FFF3E0',
  '📅 Relancer en septembre':   '#E3F2FD',
  '🎁 Gifting en attente':      '#F3E5F5',
  '📄 Docs envoyés - attendre': '#F5F5F5',
  '❌ Abandonner':              '#FFEBEE',
};

const actionTextColors = {
  '✅ En cours - suivi actif':  '#2E7D32',
  '⏳ Attendre retour':         '#8B5E00',
  '📞 Relancer maintenant':     '#E65100',
  '📅 Relancer en septembre':   '#1565C0',
  '🎁 Gifting en attente':      '#6A1B9A',
  '📄 Docs envoyés - attendre': '#616161',
  '❌ Abandonner':              '#B71C1C',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ScoreStars({ score }) {
  if (!score) return <span style={{ color: '#ccc' }}>—</span>;
  const count = (score.match(/⭐/g) || []).length;
  return (
    <span style={{ fontSize: '14px', letterSpacing: '-1px' }}>
      {'⭐'.repeat(count)}<span style={{ opacity: 0.2 }}>{'⭐'.repeat(5 - count)}</span>
    </span>
  );
}

// ─── PAGE LOGIN ──────────────────────────────────────────────────────────────
function LoginPage({ onSuccess }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pwd === PASSWORD) {
        sessionStorage.setItem('nadege_auth', '1');
        onSuccess();
      } else {
        setError('Mot de passe incorrect.');
        setPwd('');
      }
      setLoading(false);
    }, 400);
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FAF9F6;min-height:100vh;display:flex;align-items:center;justify-content:center;-webkit-font-smoothing:antialiased}
        .login-wrap{width:100%;max-width:380px;padding:0 20px}
        .login-card{background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,.06)}
        .login-logo{font-family:'DM Serif Display',serif;font-size:22px;color:#18171A;margin-bottom:6px}
        .login-sub{font-size:13px;color:#7A7870;margin-bottom:32px}
        .login-label{display:block;font-size:11px;font-weight:600;color:#7A7870;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
        .login-input{width:100%;border:1px solid rgba(0,0,0,.12);border-radius:8px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s;background:#FAFAFA}
        .login-input:focus{border-color:#C45D2E;background:#fff}
        .login-btn{width:100%;margin-top:16px;background:#C45D2E;color:#fff;border:none;border-radius:8px;padding:12px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s}
        .login-btn:hover{background:#A84D24}
        .login-btn:disabled{opacity:.6;cursor:not-allowed}
        .login-error{margin-top:12px;background:#FFEBEE;color:#B71C1C;border-radius:8px;padding:10px 14px;font-size:13px}
      `}</style>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">Nadège 100Gène</div>
          <div className="login-sub">Tableau de bord partenariats — accès privé</div>
          <form onSubmit={handleSubmit}>
            <label className="login-label">Mot de passe</label>
            <input
              className="login-input"
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoFocus
            />
            {error && <div className="login-error">{error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Vérification...' : 'Accéder au dashboard →'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── DASHBOARD PRINCIPAL ─────────────────────────────────────────────────────
export default function Home() {
  const [auth, setAuth] = useState(null); // null = pas encore vérifié
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [actionFilter, setActionFilter] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [brand, setBrand] = useState('');
  const [sector, setSector] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Vérification auth au montage
  useEffect(() => {
    const ok = sessionStorage.getItem('nadege_auth') === '1';
    setAuth(ok);
  }, []);

  async function loadCRM() {
    setLoading(true);
    try {
      const r = await fetch('/api/crm');
      const data = await r.json();
      setContacts(data.contacts || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    if (auth) loadCRM();
  }, [auth]);

  const scoreOrder = { '⭐⭐⭐⭐⭐': 5, '⭐⭐⭐⭐': 4, '⭐⭐⭐': 3, '⭐⭐': 2, '⭐': 1, '': 0 };

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter !== 'Tous') list = list.filter(c => c.statut === filter);
    if (actionFilter !== 'Toutes') list = list.filter(c => c.action === actionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.entreprise.toLowerCase().includes(q) ||
        c.nom.toLowerCase().includes(q) ||
        (c.domaine || '').toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let va, vb;
      if (sortBy === 'score')  { va = scoreOrder[a.score] ?? 0; vb = scoreOrder[b.score] ?? 0; }
      else if (sortBy === 'date')  { va = a.date || ''; vb = b.date || ''; }
      else if (sortBy === 'marque') { va = a.entreprise.toLowerCase(); vb = b.entreprise.toLowerCase(); }
      else if (sortBy === 'statut') { va = statusMap[a.statut]?.order ?? 9; vb = statusMap[b.statut]?.order ?? 9; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [contacts, filter, actionFilter, search, sortBy, sortDir]);

  const stats = {
    total:   contacts.length,
    clients: contacts.filter(c => c.statut === 'Client').length,
    repondu: contacts.filter(c => c.statut === 'Répondu').length,
    chauds:  contacts.filter(c => c.score === '⭐⭐⭐⭐⭐' || c.score === '⭐⭐⭐⭐').length,
    actions: contacts.filter(c => c.action === '📞 Relancer maintenant' || c.action === '✅ En cours - suivi actif').length,
  };

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  }

  async function submitBrand(e) {
    e.preventDefault();
    if (!brand.trim()) return;
    setSubmitting(true); setSuccessMsg(''); setErrorMsg('');
    try {
      const r = await fetch('/api/add-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, sector, reason }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSuccessMsg(`✓ "${brand}" envoyée à Jérémy !`);
      setBrand(''); setSector(''); setReason('');
      setShowForm(false);
    } catch(e) { setErrorMsg('Erreur : ' + e.message); }
    setSubmitting(false);
  }

  // Pas encore vérifié
  if (auth === null) return null;

  // Non authentifié → page login
  if (!auth) return <LoginPage onSuccess={() => setAuth(true)} />;

  const statusFilters = ['Tous','Client','Répondu','Email envoyé','Relance J+5','Relance J+10','À contacter','Pas intéressé'];
  const actionFilters = ['Toutes','✅ En cours - suivi actif','📞 Relancer maintenant','⏳ Attendre retour','📅 Relancer en septembre','🎁 Gifting en attente','❌ Abandonner'];
  const SortIcon = ({ col }) => <span style={{ opacity: 0.4, fontSize: '11px' }}>{sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ' ↕'}</span>;

  return (
    <>
      <Head>
        <title>Nadège 100Gène — Partenariats</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#FAF9F6;--surface:#FFF;--surface2:#F0EFE9;--border:rgba(0,0,0,.07);--border2:rgba(0,0,0,.12);--text:#18171A;--muted:#7A7870;--accent:#C45D2E;--radius:10px;--radius-lg:16px}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}
        .topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
        .logo{font-family:'DM Serif Display',serif;font-size:19px;color:var(--text)}
        .logo-accent{color:var(--accent)}
        .topbar-right{display:flex;align-items:center;gap:12px}
        .live-dot{display:flex;align-items:center;gap:5px;font-size:12px;color:#2E7D32;font-weight:500}
        .live-dot::before{content:'';width:7px;height:7px;border-radius:50%;background:#2E7D32;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .suggest-btn{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s}
        .suggest-btn:hover{background:#A84D24}
        .logout-btn{background:none;border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--muted);cursor:pointer}
        .logout-btn:hover{color:var(--text)}
        .container{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}
        .stats-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:2rem}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px 18px}
        .stat-label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px}
        .stat-value{font-family:'DM Serif Display',serif;font-size:32px;color:var(--text);line-height:1}
        .stat-value.accent{color:var(--accent)}
        .stat-value.hot{color:#C45D2E}
        .stat-sub{font-size:12px;color:var(--muted);margin-top:4px}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px}
        .section-title{font-family:'DM Serif Display',serif;font-size:18px}
        .controls{display:flex;align-items:center;gap:8px}
        .search-box{display:flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:7px 12px}
        .search-box input{border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);background:transparent;width:180px}
        .refresh-btn{background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:7px 12px;font-size:15px;cursor:pointer;color:var(--muted);transition:all .15s}
        .refresh-btn:hover{color:var(--accent)}
        .filter-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
        .filter-btn{border:1px solid var(--border2);background:var(--surface);border-radius:20px;padding:5px 12px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;color:var(--muted);transition:all .15s;white-space:nowrap}
        .filter-btn:hover{border-color:var(--accent);color:var(--accent)}
        .filter-btn.active{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:600}
        .result-count{font-size:12px;color:var(--muted);margin-bottom:8px}
        .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
        .col-header{display:grid;grid-template-columns:1.6fr 1fr 1.2fr 1.4fr .8fr .7fr;padding:10px 16px;border-bottom:1px solid var(--border);background:var(--surface2)}
        .col-header>*{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;cursor:pointer;user-select:none}
        .col-header>*:hover{color:var(--text)}
        .pipeline-row{display:grid;grid-template-columns:1.6fr 1fr 1.2fr 1.4fr .8fr .7fr;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .12s;align-items:center}
        .pipeline-row:last-child{border-bottom:none}
        .pipeline-row:hover{background:var(--surface2)}
        .brand-name{font-weight:500;font-size:14px}
        .brand-domain{font-size:11px;color:var(--muted);margin-top:2px}
        .contact-cell{display:flex;flex-direction:column;gap:2px}
        .contact-name{font-size:13px;color:var(--text)}
        .contact-poste{font-size:11px;color:var(--muted)}
        .date-text{font-size:13px;color:var(--muted)}
        .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
        .badge-client{background:#E8F5E9;color:#2E7D32}
        .badge-repondu{background:#E3F2FD;color:#1565C0}
        .badge-relance{background:#FFEBEE;color:#C62828}
        .badge-relance5{background:#FFF3E0;color:#E65100}
        .badge-email{background:#F3E5F5;color:#6A1B9A}
        .badge-contacter{background:#F5F5F5;color:#616161}
        .badge-non{background:#FAFAFA;color:#9E9E9E;border:1px solid #E0E0E0}
        .action-pill{display:inline-block;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:500}
        .empty{padding:48px;text-align:center;color:var(--muted);font-size:14px}
        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:200;display:flex;justify-content:flex-end}
        .drawer{width:360px;background:var(--surface);height:100%;overflow-y:auto;padding:28px 24px;box-shadow:-4px 0 24px rgba(0,0,0,.08)}
        .drawer-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}
        .drawer-brand{font-family:'DM Serif Display',serif;font-size:22px;line-height:1.2}
        .drawer-close{background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted);padding:4px}
        .drawer-section{margin-bottom:18px}
        .drawer-label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
        .drawer-value{font-size:14px;color:var(--text)}
        .drawer-resume{font-size:13px;color:var(--text);line-height:1.6;background:var(--surface2);border-radius:8px;padding:12px}
        .drawer-divider{border:none;border-top:1px solid var(--border);margin:16px 0}
        .drawer-mail{font-size:13px;color:var(--accent)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal{background:var(--surface);border-radius:var(--radius-lg);padding:32px;width:100%;max-width:440px;box-shadow:0 8px 40px rgba(0,0,0,.12)}
        .modal-title{font-family:'DM Serif Display',serif;font-size:20px;margin-bottom:4px}
        .modal-sub{font-size:13px;color:var(--muted);margin-bottom:22px}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .field{display:flex;flex-direction:column;gap:5px}
        .field label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
        .field input,.field select,.field textarea{border:1px solid var(--border2);border-radius:8px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);outline:none;background:#FAFAFA;transition:border-color .15s}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--accent);background:#fff}
        .field select option{background:#fff}
        .modal-actions{display:flex;gap:8px;margin-top:20px}
        .btn-primary{flex:1;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:11px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer}
        .btn-primary:hover{background:#A84D24}
        .btn-primary:disabled{opacity:.6;cursor:not-allowed}
        .btn-secondary{padding:11px 18px;border:1px solid var(--border2);border-radius:8px;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--muted);cursor:pointer}
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1B5E20;color:#fff;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:500;z-index:400;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.2)}
        @media(max-width:768px){
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .stat-card:last-child{grid-column:span 2}
          .col-header,.pipeline-row{grid-template-columns:1.5fr 1fr}
          .col-header>*:nth-child(n+3),.pipeline-row>*:nth-child(n+3){display:none}
          .drawer{width:100%;top:auto;height:80vh;border-radius:16px 16px 0 0}
        }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo">Nadège <span className="logo-accent">100Gène</span></div>
        <div className="topbar-right">
          <div className="live-dot">Live</div>
          <button className="suggest-btn" onClick={() => setShowForm(true)}>+ Suggérer une marque</button>
          <button className="logout-btn" onClick={() => { sessionStorage.removeItem('nadege_auth'); setAuth(false); }}>Déconnexion</button>
        </div>
      </div>

      <div className="container">

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total contacts</div>
            <div className="stat-value">{loading ? '—' : stats.total}</div>
            <div className="stat-sub">dans le CRM</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Clients actifs</div>
            <div className="stat-value accent">{loading ? '—' : stats.clients}</div>
            <div className="stat-sub">contrats signés</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ont répondu</div>
            <div className="stat-value">{loading ? '—' : stats.repondu}</div>
            <div className="stat-sub">en discussion</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Prospects chauds</div>
            <div className="stat-value hot">{loading ? '—' : stats.chauds}</div>
            <div className="stat-sub">⭐⭐⭐⭐ et plus</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Actions urgentes</div>
            <div className="stat-value hot">{loading ? '—' : stats.actions}</div>
            <div className="stat-sub">à traiter</div>
          </div>
        </div>

        {/* PIPELINE */}
        <div className="section-header">
          <div className="section-title">Pipeline partenariats</div>
          <div className="controls">
            <div className="search-box">
              <span style={{ color: 'var(--muted)' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
            </div>
            <button className="refresh-btn" onClick={loadCRM}>↻</button>
          </div>
        </div>

        <div className="filter-row">
          {statusFilters.map(f => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="filter-row" style={{ marginBottom: '8px' }}>
          {actionFilters.map(f => (
            <button key={f} className={`filter-btn${actionFilter === f ? ' active' : ''}`} onClick={() => setActionFilter(f)}>{f}</button>
          ))}
        </div>

        {!loading && <div className="result-count">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</div>}

        <div className="table-wrap">
          <div className="col-header">
            <span onClick={() => toggleSort('marque')}>Marque <SortIcon col="marque" /></span>
            <span onClick={() => toggleSort('statut')}>Statut <SortIcon col="statut" /></span>
            <span>Contact</span>
            <span>Action</span>
            <span onClick={() => toggleSort('date')}>Date <SortIcon col="date" /></span>
            <span onClick={() => toggleSort('score')}>Score <SortIcon col="score" /></span>
          </div>
          <div>
            {loading
              ? <div className="empty">Chargement...</div>
              : filtered.length === 0
                ? <div className="empty">Aucun résultat.</div>
                : filtered.map(c => {
                    const s = statusMap[c.statut] || { cls: 'badge-email', label: c.statut };
                    const bg = actionColors[c.action] || '#F5F5F5';
                    const col = actionTextColors[c.action] || '#616161';
                    return (
                      <div key={c.id} className="pipeline-row" onClick={() => setSelected(c)}>
                        <div>
                          <div className="brand-name">{c.entreprise}</div>
                          {c.domaine && <div className="brand-domain">{c.domaine}</div>}
                        </div>
                        <div><span className={`badge ${s.cls}`}>{s.label}</span></div>
                        <div className="contact-cell">
                          <div className="contact-name">{c.nom}</div>
                          {c.poste && <div className="contact-poste">{c.poste}</div>}
                        </div>
                        <div>{c.action ? <span className="action-pill" style={{ background: bg, color: col }}>{c.action}</span> : <span style={{ color: '#ccc' }}>—</span>}</div>
                        <div className="date-text">{fmtDate(c.date)}</div>
                        <div><ScoreStars score={c.score} /></div>
                      </div>
                    );
                  })
            }
          </div>
        </div>
      </div>

      {/* DRAWER DÉTAIL */}
      {selected && (
        <div className="drawer-overlay" onClick={() => setSelected(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="drawer-brand">{selected.entreprise}</div>
                <div style={{ marginTop: '6px' }}>
                  <span className={`badge ${statusMap[selected.statut]?.cls || 'badge-email'}`}>{selected.statut}</span>
                </div>
              </div>
              <button className="drawer-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            {selected.score && (
              <div className="drawer-section">
                <div className="drawer-label">Score de conversion</div>
                <div style={{ fontSize: '22px' }}><ScoreStars score={selected.score} /></div>
              </div>
            )}

            {selected.action && (
              <div className="drawer-section">
                <div className="drawer-label">Action à faire</div>
                <span className="action-pill" style={{ background: actionColors[selected.action] || '#F5F5F5', color: actionTextColors[selected.action] || '#616161', fontSize: '13px', padding: '5px 12px' }}>
                  {selected.action}
                </span>
              </div>
            )}

            {selected.resume && (
              <div className="drawer-section">
                <div className="drawer-label">Résumé de la situation</div>
                <div className="drawer-resume">{selected.resume}</div>
              </div>
            )}

            <hr className="drawer-divider" />

            <div className="drawer-section">
              <div className="drawer-label">Contact</div>
              <div className="drawer-value">{selected.nom}</div>
              {selected.poste && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{selected.poste}</div>}
            </div>

            {selected.mail && (
              <div className="drawer-section">
                <div className="drawer-label">Email</div>
                <div className="drawer-mail">{selected.mail}</div>
              </div>
            )}

            <div className="drawer-section">
              <div className="drawer-label">Dernier contact</div>
              <div className="drawer-value">{fmtDate(selected.date)}</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUGGESTION */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-title">Suggérer une marque</div>
            <div className="modal-sub">Jérémy s'occupe de tout le reste.</div>
            <form onSubmit={submitBrand}>
              <div className="form-grid">
                <div className="field">
                  <label>Nom *</label>
                  <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="ex: Sephora" />
                </div>
                <div className="field">
                  <label>Secteur</label>
                  <select value={sector} onChange={e => setSector(e.target.value)}>
                    <option value="">Choisir...</option>
                    {['Beauté / Cosmétique','Mode / Luxe','Alimentation','Maison / Déco','Tech / Digital','Santé / Bien-être','Finance','Sport / Loisirs','Humour / Médias','Voyage','Autre'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Pourquoi ?</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="ex: Correspond à mon univers humour/quotidien" />
              </div>
              {errorMsg && <div style={{ background: '#FFEBEE', color: '#B71C1C', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginTop: '12px' }}>{errorMsg}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Envoi...' : 'Envoyer →'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {successMsg && <div className="toast" onClick={() => setSuccessMsg('')}>{successMsg}</div>}
    </>
  );
}
