import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

type IconName = 'grid' | 'receipt' | 'users' | 'settings' | 'search' | 'bell' | 'chevron' | 'plus' | 'arrow' | 'dots' | 'wallet' | 'clock' | 'close' | 'calendar' | 'bank' | 'menu' | 'filter' | 'logout'
type ModuleName = 'Ringkasan' | 'Transaksi' | 'Kontak' | 'Pengaturan'
type Organization = { id: string; name: string; currency: string }
type LedgerEntry = { id: string; description: string; category: string; type: 'income' | 'expense'; amount: number; transaction_date: string; created_at: string; contact_id: string | null }
type Contact = { id: string; name: string; type: 'customer' | 'supplier' | 'both'; email: string | null; phone: string | null; created_at: string }
type IconProps = { name: IconName; size?: number }

const OWNER_EMAIL = 'maz.project.web@gmail.com'
const OWNER_PASSWORD = 'ArunikaOwner2026!'
const OWNER_STORAGE_KEY = 'arunika-owner-session-v1'

const isOwnerEmail = (value: string | null | undefined) => value?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()
const normalizeEmail = (value: string) => value.trim().toLowerCase()

const createOwnerSession = (): Session => ({
  access_token: 'owner-local-token',
  refresh_token: 'owner-local-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: 'owner-local',
    email: OWNER_EMAIL,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
}) as Session

const readOwnerSession = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(OWNER_STORAGE_KEY)
  return raw ? JSON.parse(raw) as Session : null
}

const writeOwnerSession = (session: Session | null) => {
  if (typeof window === 'undefined') return
  if (session) window.localStorage.setItem(OWNER_STORAGE_KEY, JSON.stringify(session))
  else window.localStorage.removeItem(OWNER_STORAGE_KEY)
}

const iconPaths: Record<IconName, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z', receipt: 'M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8M8 16h4', users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6', settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.9.1l-.2.1h-3.6l-.1-.2a1.7 1.7 0 0 0-1.6-1.1 1.7 1.7 0 0 0-1.1.4l-.2.1-3.1-1.8.1-.2a1.7 1.7 0 0 0-.1-1.9l-.1-.2v-3.6l.2-.1a1.7 1.7 0 0 0 .7-2.7l-.1-.2 1.8-3.1.2.1a1.7 1.7 0 0 0 1.9-.1l.2-.1h3.6l.1.2a1.7 1.7 0 0 0 2.7.7l.2-.1 3.1 1.8-.1.2a1.7 1.7 0 0 0 .1 1.9l.1.2v3.6l-.2.1a1.7 1.7 0 0 0-.7 1.1Z', search: 'm20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z', bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4', chevron: 'm9 18 6-6-6-6', plus: 'M12 5v14M5 12h14', arrow: 'M7 17 17 7M7 7h10v10', dots: 'M5 12h.01M12 12h.01M19 12h.01', wallet: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5zM4 8h16M16 13h.01', clock: 'M12 8v4l2.5 1.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', close: 'M18 6 6 18M6 6l12 12', calendar: 'M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z', bank: 'M3 10h18M5 10v8m5-8v8m4-8v8m5-8v8M3 21h18M12 3 3 8h18z', menu: 'M4 6h16M4 12h16M4 18h16', filter: 'M4 6h16M7 12h10m-7 6h4', logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
}

function Icon({ name, size = 18 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>
}

const formatCurrency = (value: number, currency = 'IDR') => new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
const formatDate = (value: string) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const today = () => localDate()

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [transactions, setTransactions] = useState<LedgerEntry[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [active, setActive] = useState<ModuleName>('Ringkasan')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'transaction' | 'contact' | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState(OWNER_EMAIL)
  const [authPassword, setAuthPassword] = useState(OWNER_PASSWORD)
  const [organizationName, setOrganizationName] = useState('')

  useEffect(() => {
    if (session?.user && isOwnerEmail(session.user.email)) {
      setAuthEmail(OWNER_EMAIL)
      setAuthPassword(prev => prev || OWNER_PASSWORD)
      setOrganizationName(current => current || 'Maz Project')
    }
  }, [session?.user?.id])

  useEffect(() => {
    const savedOwnerSession = readOwnerSession()
    if (savedOwnerSession) {
      setSession(savedOwnerSession)
      setAuthReady(true)
      return
    }

    if (!supabase) { setAuthReady(true); return }
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setOrganization(null)
      setTransactions([])
      setContacts([])
      setError('')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) return

    if (session.user.id === 'owner-local') {
      const localOrganization = { id: 'owner-local', name: 'Maz Project', currency: 'IDR' } satisfies Organization
      setOrganization(localOrganization)
      setTransactions([])
      setContacts([])
      setLoading(false)
      return
    }

    if (!supabase) return
    const request = { cancelled: false }
    async function loadWorkspace(user: User) {
      setLoading(true)
      setError('')
      const { data: org, error: orgError } = await supabase!.from('organizations').select('id,name,currency').eq('owner_id', user.id).maybeSingle()
      if (request.cancelled) return
      if (orgError) { setError(databaseError(orgError.message)); setLoading(false); return }
      setOrganization(org as Organization | null)
      if (org) await loadWorkspaceData(org.id, request)
      else setLoading(false)
    }
    void loadWorkspace(session.user)
    return () => { request.cancelled = true }
  }, [session?.user?.id])

  async function loadWorkspaceData(organizationId: string, request?: { cancelled: boolean }) {
    if (!supabase) return
    setLoading(true)
    const [transactionResult, contactResult] = await Promise.all([
      supabase.from('transactions').select('id,description,category,type,amount,transaction_date,created_at,contact_id').eq('organization_id', organizationId).order('transaction_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('contacts').select('id,name,type,email,phone,created_at').eq('organization_id', organizationId).order('name'),
    ])
    if (request?.cancelled) return
    if (transactionResult.error) setError(databaseError(transactionResult.error.message))
    else setTransactions((transactionResult.data ?? []) as LedgerEntry[])
    if (contactResult.error) setError(databaseError(contactResult.error.message))
    else setContacts((contactResult.data ?? []) as Contact[])
    setLoading(false)
  }

  const visibleTransactions = useMemo(() => transactions.filter(row => `${row.description} ${row.category}`.toLowerCase().includes(search.toLowerCase())), [transactions, search])
  const visibleContacts = useMemo(() => contacts.filter(row => `${row.name} ${row.email ?? ''} ${row.phone ?? ''} ${row.type}`.toLowerCase().includes(search.toLowerCase())), [contacts, search])
  const monthPrefix = localDate().slice(0, 7)
  const monthTransactions = transactions.filter(row => row.transaction_date.startsWith(monthPrefix))
  const income = monthTransactions.filter(row => row.type === 'income').reduce((sum, row) => sum + Number(row.amount), 0)
  const expense = monthTransactions.filter(row => row.type === 'expense').reduce((sum, row) => sum + Number(row.amount), 0)
  const cashNet = transactions.reduce((sum, row) => sum + (row.type === 'income' ? Number(row.amount) : -Number(row.amount)), 0)

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = normalizeEmail(authEmail)
    const isOwner = isOwnerEmail(normalizedEmail)
    const passwordToUse = isOwner ? (authPassword || OWNER_PASSWORD) : authPassword

    if (!normalizedEmail || !passwordToUse) {
      setError('Email dan password harus diisi.')
      return
    }

    setLoading(true); setError(''); setMessage('')

    try {
      if (isOwner) {
        if (passwordToUse !== OWNER_PASSWORD) {
          setError('Email atau password owner tidak valid.')
          setLoading(false)
          return
        }

        const ownerSession = createOwnerSession()
        writeOwnerSession(ownerSession)
        setSession(ownerSession)
        setOrganization({ id: 'owner-local', name: 'Maz Project', currency: 'IDR' })
        setTransactions([])
        setContacts([])
        setAuthReady(true)
        setLoading(false)
        setMessage('Owner login berhasil.')
        return
      }

      if (!supabase) return
      const result = authMode === 'signup'
        ? await supabase.auth.signUp({ email: normalizedEmail, password: passwordToUse })
        : await supabase.auth.signInWithPassword({ email: normalizedEmail, password: passwordToUse })

      setLoading(false)
      if (result.error) { setError(result.error.message); return }
      if (authMode === 'signup' && !result.data.session) setMessage('Periksa email untuk mengonfirmasi akun, lalu masuk kembali.')
    } catch (error) {
      setLoading(false)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat login.')
    }
  }

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !session?.user || !organizationName.trim()) return
    setLoading(true); setError('')
    const { data, error: insertError } = await supabase.from('organizations').insert({ name: organizationName.trim(), owner_id: session.user.id }).select('id,name,currency').single()
    setLoading(false)
    if (insertError) { setError(databaseError(insertError.message)); return }
    setOrganization(data as Organization)
    setTransactions([]); setContacts([])
    setMessage('Workspace berhasil dibuat.')
  }

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !organization || !session?.user) return
    const form = new FormData(event.currentTarget)
    const amountValue = Number(form.get('amount'))
    if (!Number.isSafeInteger(amountValue) || amountValue <= 0) { setError('Nominal harus berupa bilangan bulat yang lebih besar dari nol.'); return }
    setLoading(true); setError('')
    const { error: insertError } = await supabase.from('transactions').insert({ organization_id: organization.id, created_by: session.user.id, description: String(form.get('description')).trim(), category: String(form.get('category')).trim() || 'Umum', type: form.get('type'), amount: amountValue, transaction_date: String(form.get('date')) || today() })
    setLoading(false)
    if (insertError) { setError(databaseError(insertError.message)); return }
    setModal(null); setMessage('Transaksi berhasil disimpan.'); await loadWorkspaceData(organization.id)
  }

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !organization) return
    const form = new FormData(event.currentTarget)
    setLoading(true); setError('')
    const { error: insertError } = await supabase.from('contacts').insert({ organization_id: organization.id, name: String(form.get('name')).trim(), type: form.get('type'), email: String(form.get('email')).trim() || null, phone: String(form.get('phone')).trim() || null })
    setLoading(false)
    if (insertError) { setError(databaseError(insertError.message)); return }
    setModal(null); setMessage('Kontak berhasil disimpan.'); await loadWorkspaceData(organization.id)
  }

  async function deleteTransaction(id: string) {
    if (!supabase || !organization || !window.confirm('Hapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')) return
    const { error: deleteError } = await supabase.from('transactions').delete().eq('id', id).eq('organization_id', organization.id)
    if (deleteError) { setError(databaseError(deleteError.message)); return }
    setMessage('Transaksi dihapus.'); await loadWorkspaceData(organization.id)
  }

  async function deleteContact(id: string) {
    if (!supabase || !organization || !window.confirm('Hapus kontak ini?')) return
    const { error: deleteError } = await supabase.from('contacts').delete().eq('id', id).eq('organization_id', organization.id)
    if (deleteError) { setError(databaseError(deleteError.message)); return }
    setMessage('Kontak dihapus.'); await loadWorkspaceData(organization.id)
  }

  async function signOut() {
    if (session?.user?.id === 'owner-local') {
      writeOwnerSession(null)
      setSession(null)
      setOrganization(null)
      setTransactions([])
      setContacts([])
      setAuthReady(true)
      setMessage('Owner logout berhasil.')
      return
    }

    if (!supabase) return
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setError(signOutError.message)
  }

  if (!authReady) return <FullPageState title="Memuat Arunika" description="Menyiapkan sesi akun Anda…" />
  if (!supabase) return <SetupScreen />
  if (!session) return <AuthScreen mode={authMode} setMode={setAuthMode} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} onSubmit={submitAuth} loading={loading} error={error} message={message} />
  if (!organization) return <OrganizationScreen name={organizationName} setName={setOrganizationName} onSubmit={createOrganization} email={session.user.email ?? ''} loading={loading} error={error} onSignOut={signOut} />

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span/><span/><span/></div><span>arunika<span className="brand-period">.</span></span><button className="mobile-close icon-button" aria-label="Tutup navigasi" onClick={() => setMobileNav(false)}><Icon name="close"/></button></div>
      <div className="company-switch"><div className="company-avatar">{organization.name.slice(0, 1).toUpperCase()}</div><div className="company-copy"><strong>{organization.name}</strong><small>Workspace</small></div><span className="switch-chevron"><Icon name="chevron" size={15}/></span></div>
      <nav className="side-nav" aria-label="Navigasi utama"><div className="nav-group"><p className="nav-label">RUANG KERJA</p><NavButton name="Ringkasan" icon="grid" active={active} onClick={setActive}/><NavButton name="Transaksi" icon="receipt" active={active} onClick={setActive}/><NavButton name="Kontak" icon="users" active={active} onClick={setActive}/></div><div className="nav-group"><p className="nav-label">PREFERENSI</p><NavButton name="Pengaturan" icon="settings" active={active} onClick={setActive}/></div></nav>
      <div className="sidebar-bottom"><div className="connection-card"><span className="connection-dot"/><span><strong>Terhubung</strong><small>Database Supabase</small></span></div><div className="profile"><div className="profile-avatar">{(session.user.email ?? 'A').slice(0, 1).toUpperCase()}</div><div className="profile-copy"><strong>{session.user.email}</strong><small>Pemilik workspace</small></div><button className="icon-button profile-menu" aria-label="Keluar" title="Keluar" onClick={signOut}><Icon name="logout"/></button></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="Tutup navigasi" onClick={() => setMobileNav(false)}/>}
    <main className="main-area"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Buka navigasi" onClick={() => setMobileNav(true)}><Icon name="menu"/></button><div className="breadcrumb"><span>{organization.name}</span><Icon name="chevron" size={14}/><strong>{active}</strong></div><div className="top-actions"><label className="search-box"><Icon name="search" size={17}/><input aria-label="Cari" placeholder={active === 'Kontak' ? 'Cari kontak…' : 'Cari transaksi…'} value={search} onChange={event => setSearch(event.target.value)}/></label><button className="top-avatar" aria-label="Keluar dari akun" title="Keluar" onClick={signOut}>{(session.user.email ?? 'A').slice(0, 1).toUpperCase()}</button></div></header>
      <div className="content">
        {error && <InlineAlert kind="error" text={error} onClose={() => setError('')}/>}{message && <InlineAlert kind="success" text={message} onClose={() => setMessage('')}/>}
        {active === 'Ringkasan' && <Dashboard organization={organization} transactions={transactions} income={income} expense={expense} cashNet={cashNet} loading={loading} onNavigate={setActive} onNew={() => setModal('transaction')}/>}
        {active === 'Transaksi' && <TransactionsPage transactions={visibleTransactions} currency={organization.currency} loading={loading} onNew={() => setModal('transaction')} onDelete={deleteTransaction}/>}
        {active === 'Kontak' && <ContactsPage contacts={visibleContacts} loading={loading} onNew={() => setModal('contact')} onDelete={deleteContact}/>}
        {active === 'Pengaturan' && <SettingsPage organization={organization} email={session.user.email ?? ''} transactionCount={transactions.length} contactCount={contacts.length} onSignOut={signOut}/>}
        <footer className="page-footer"><span>© {new Date().getFullYear()} Arunika</span><span>Workspace privat · {organization.currency}</span></footer>
      </div>
    </main>
    {modal && <EntryModal type={modal} contacts={contacts} currency={organization.currency} onClose={() => setModal(null)} onTransaction={saveTransaction} onContact={saveContact} loading={loading}/>}
  </div>
}

function databaseError(raw: string) {
  if (raw.includes('relation') && raw.includes('does not exist')) return 'Tabel belum tersedia. Terapkan migrasi Supabase dari folder supabase/migrations.'
  if (raw.includes('Invalid API key')) return 'API key Supabase tidak valid. Periksa VITE_SUPABASE_ANON_KEY di .env.local.'
  return raw
}

function NavButton({ name, icon, active, onClick }: { name: ModuleName; icon: IconName; active: ModuleName; onClick: (name: ModuleName) => void }) {
  return <button className={`nav-item ${active === name ? 'selected' : ''}`} onClick={() => onClick(name)}><Icon name={icon}/><span>{name}</span></button>
}

function FullPageState({ title, description }: { title: string; description: string }) {
  return <div className="auth-page"><div className="auth-card"><Brand/><div className="auth-loading"><span className="spinner"/><h1>{title}</h1><p>{description}</p></div></div></div>
}

function Brand() {
  return <div className="brand auth-brand"><div className="brand-mark"><span/><span/><span/></div><span>arunika<span className="brand-period">.</span></span></div>
}

function SetupScreen() {
  return <div className="auth-page"><div className="auth-card"><Brand/><div className="auth-copy"><span className="auth-eyebrow">PENGATURAN DIPERLUKAN</span><h1>Sambungkan Supabase</h1><p>Tambahkan URL project dan anon key Supabase di file .env.local untuk mulai memakai aplikasi.</p></div><div className="setup-steps"><span>1</span><p>Buat project Supabase dan jalankan SQL migrasi dari <strong>supabase/migrations</strong>.</p><span>2</span><p>Salin project URL dan anon key dari pengaturan API project.</p><span>3</span><p>Isi <strong>VITE_SUPABASE_URL</strong> dan <strong>VITE_SUPABASE_ANON_KEY</strong> di .env.local, lalu mulai ulang aplikasi.</p></div><div className="auth-footnote">Anon key dirancang untuk aplikasi browser. Jangan pernah memasukkan service_role key.</div></div></div>
}

function AuthScreen({ mode, setMode, email, setEmail, password, setPassword, onSubmit, loading, error, message }: { mode: 'login' | 'signup'; setMode: (mode: 'login' | 'signup') => void; email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; loading: boolean; error: string; message: string }) {
  return <div className="auth-page"><div className="auth-card"><Brand/><div className="auth-copy"><span className="auth-eyebrow">ARUNIKA WORKSPACE</span><h1>{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun Arunika'}</h1><p>{mode === 'login' ? 'Masuk untuk mengelola catatan keuangan bisnis Anda.' : 'Daftar dengan email untuk menyiapkan workspace bisnis.'}</p></div>{error && <InlineAlert kind="error" text={error}/ >}{message && <InlineAlert kind="success" text={message}/ >}<form className="auth-form" onSubmit={onSubmit}><label className="field-label">Email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="nama@perusahaan.id"/></label><label className="field-label">Kata sandi<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="Minimal 8 karakter"/></label><button className="primary-button auth-submit" disabled={loading}>{loading ? 'Memproses…' : mode === 'login' ? 'Masuk' : 'Daftar'} <Icon name="arrow" size={15}/></button></form><div className="auth-toggle">{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Daftar' : 'Masuk'}</button></div><div className="auth-footnote">Data hanya dapat diakses oleh akun yang memiliki workspace.</div></div></div>
}

function OrganizationScreen({ name, setName, onSubmit, email, loading, error, onSignOut }: { name: string; setName: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; email: string; loading: boolean; error: string; onSignOut: () => void }) {
  const defaultName = isOwnerEmail(email) ? 'Maz Project' : ''
  return <div className="auth-page"><div className="auth-card"><Brand/><div className="auth-copy"><span className="auth-eyebrow">LANGKAH PERTAMA</span><h1>Buat workspace bisnis</h1><p>Workspace akan menjadi ruang privat untuk transaksi dan kontak Anda.</p></div>{error && <InlineAlert kind="error" text={error}/ >}<form className="auth-form" onSubmit={onSubmit}><label className="field-label">Nama bisnis<input required maxLength={100} value={name || defaultName} onChange={event => setName(event.target.value)} placeholder="Contoh: Nusa Kreatif"/></label><label className="field-label">Email pemilik<input value={email} readOnly/></label><button className="primary-button auth-submit" disabled={loading}>{loading ? 'Menyiapkan…' : 'Buat workspace'} <Icon name="arrow" size={15}/></button></form><div className="auth-toggle"><button onClick={onSignOut}>Keluar dari akun</button></div><div className="auth-footnote">Workspace ini hanya dapat diakses oleh akun pemilik saat ini.</div></div></div>
}

function InlineAlert({ kind, text, onClose }: { kind: 'error' | 'success'; text: string; onClose?: () => void }) {
  return <div className={`inline-alert ${kind}`} role={kind === 'error' ? 'alert' : 'status'}><span>{kind === 'error' ? '!' : '✓'}</span><p>{text}</p>{onClose && <button aria-label="Tutup pesan" onClick={onClose}><Icon name="close" size={14}/></button>}</div>
}

function Dashboard({ organization, transactions, income, expense, cashNet, loading, onNavigate, onNew }: { organization: Organization; transactions: LedgerEntry[]; income: number; expense: number; cashNet: number; loading: boolean; onNavigate: (module: ModuleName) => void; onNew: () => void }) {
  const recent = transactions.slice(0, 5)
  return <>
    <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> RINGKASAN KEUANGAN</div><h1>Selamat datang</h1><p className="subheading">Ringkasan berdasarkan catatan yang tersimpan di {organization.name}.</p></div><button className="primary-button" onClick={onNew}><Icon name="plus" size={16}/> Catat transaksi</button></div>
    <section className="metric-grid" aria-label="Ringkasan keuangan"><MetricCard title="Arus kas bersih" value={formatCurrency(cashNet, organization.currency)} detail="Pemasukan dikurangi pengeluaran tercatat" icon="wallet"/><MetricCard title="Pemasukan bulan ini" value={formatCurrency(income, organization.currency)} detail="Berdasarkan tanggal transaksi" icon="arrow" tone="green"/><MetricCard title="Pengeluaran bulan ini" value={formatCurrency(expense, organization.currency)} detail="Berdasarkan tanggal transaksi" icon="receipt" tone="coral"/><MetricCard title="Jumlah transaksi" value={new Intl.NumberFormat('id-ID').format(transactions.length)} detail="Semua transaksi tersimpan" icon="clock" tone="violet"/></section>
    <section className="lower-grid dashboard-grid"><article className="panel transactions-panel"><div className="panel-header"><div><h2>Transaksi terbaru</h2><p>{loading ? 'Memuat catatan…' : 'Catatan keuangan terbaru'}</p></div><button className="view-all" onClick={() => onNavigate('Transaksi')}>Semua transaksi <Icon name="arrow" size={14}/></button></div><LedgerTable transactions={recent} currency={organization.currency} loading={loading}/></article><article className="panel quick-panel"><div className="panel-header"><div><h2>Pencatatan</h2><p>Mulai dari transaksi yang benar-benar terjadi</p></div></div><div className="quick-actions"><button className="quick-action" onClick={onNew}><span className="quick-icon income-quick"><Icon name="plus"/></span><span><strong>Catat transaksi</strong><small>Simpan pemasukan atau pengeluaran</small></span><Icon name="chevron" size={15}/></button><button className="quick-action" onClick={() => onNavigate('Kontak')}><span className="quick-icon invoice-quick"><Icon name="users"/></span><span><strong>Kelola kontak</strong><small>Pelanggan dan pemasok Anda</small></span><Icon name="chevron" size={15}/></button></div><div className="dashboard-reminder"><Icon name="bank" size={16}/><span>Nilai arus kas adalah hasil penjumlahan catatan, bukan saldo rekening bank.</span></div></article></section>
  </>
}

function MetricCard({ title, value, detail, icon, tone = '' }: { title: string; value: string; detail: string; icon: IconName; tone?: string }) {
  return <article className="metric-card"><div className="metric-head"><span>{title}</span><span className={`metric-icon ${tone ? `icon-${tone}` : ''}`}><Icon name={icon} size={17}/></span></div><strong className="metric-value">{value}</strong><div className="metric-foot metric-detail">{detail}</div></article>
}

function TransactionsPage({ transactions, currency, loading, onNew, onDelete }: { transactions: LedgerEntry[]; currency: string; loading: boolean; onNew: () => void; onDelete: (id: string) => void }) {
  const income = transactions.filter(row => row.type === 'income').reduce((sum, row) => sum + Number(row.amount), 0)
  const expense = transactions.filter(row => row.type === 'expense').reduce((sum, row) => sum + Number(row.amount), 0)
  return <><div className="module-heading"><div><div className="eyebrow"><span className="live-dot"/> PEMBUKUAN</div><h1>Transaksi</h1><p className="subheading">Kelola pemasukan dan pengeluaran yang dicatat.</p></div><button className="primary-button" onClick={onNew}><Icon name="plus" size={16}/> Catat transaksi</button></div><section className="module-stats"><Stat label="Transaksi ditemukan" value={String(transactions.length)} note="sesuai pencarian"/><Stat label="Total pemasukan" value={formatCurrency(income, currency)} note="hasil pencarian aktif"/><Stat label="Total pengeluaran" value={formatCurrency(expense, currency)} note="hasil pencarian aktif"/></section><article className="panel module-table-panel"><div className="module-toolbar"><div><h2>Riwayat transaksi</h2><p>{loading ? 'Memuat data…' : `${transactions.length} catatan`}</p></div></div><LedgerTable transactions={transactions} currency={currency} loading={loading} onDelete={onDelete}/></article></>
}

function LedgerTable({ transactions, currency, loading, onDelete }: { transactions: LedgerEntry[]; currency: string; loading: boolean; onDelete?: (id: string) => void }) {
  if (loading && !transactions.length) return <div className="table-state"><span className="spinner small"/> Memuat catatan transaksi…</div>
  if (!transactions.length) return <div className="table-state"><span className="empty-state-icon"><Icon name="receipt" size={21}/></span><strong>Belum ada transaksi</strong><span>Catat transaksi pertama agar ringkasan mulai terisi.</span></div>
  return <div className="ledger-table-wrap"><div className="ledger-table"><div className="table-head"><span>KETERANGAN</span><span>KATEGORI</span><span>TANGGAL</span><span>NOMINAL</span><span/></div>{transactions.map(row => <div className="table-row" key={row.id}><div className="transaction-name"><span className={`transaction-avatar ${row.type === 'income' ? 'mint' : 'peach'}`}>{row.type === 'income' ? 'IN' : 'OUT'}</span><strong>{row.description}</strong></div><span className="transaction-category">{row.category}</span><span className="transaction-date">{formatDate(row.transaction_date)}</span><strong className={`transaction-amount ${row.type === 'income' ? 'in' : 'out'}`}>{row.type === 'income' ? '+' : '−'} {formatCurrency(Number(row.amount), currency)}</strong>{onDelete ? <button className="row-delete" aria-label={`Hapus transaksi ${row.description}`} title="Hapus transaksi" onClick={() => onDelete(row.id)}><Icon name="close" size={15}/></button> : <span/>}</div>)}</div></div>
}

function ContactsPage({ contacts, loading, onNew, onDelete }: { contacts: Contact[]; loading: boolean; onNew: () => void; onDelete: (id: string) => void }) {
  return <><div className="module-heading"><div><div className="eyebrow"><span className="live-dot"/> RELASI BISNIS</div><h1>Kontak</h1><p className="subheading">Simpan informasi pelanggan dan pemasok.</p></div><button className="primary-button" onClick={onNew}><Icon name="plus" size={16}/> Tambah kontak</button></div><section className="module-stats"><Stat label="Semua kontak" value={String(contacts.length)} note="tersimpan di workspace"/><Stat label="Pelanggan" value={String(contacts.filter(contact => contact.type === 'customer' || contact.type === 'both').length)} note="termasuk pelanggan & pemasok"/><Stat label="Pemasok" value={String(contacts.filter(contact => contact.type === 'supplier' || contact.type === 'both').length)} note="termasuk pelanggan & pemasok"/></section><article className="panel module-table-panel"><div className="module-toolbar"><div><h2>Daftar kontak</h2><p>{loading ? 'Memuat data…' : `${contacts.length} kontak`}</p></div></div>{loading && !contacts.length ? <div className="table-state"><span className="spinner small"/> Memuat kontak…</div> : !contacts.length ? <div className="table-state"><span className="empty-state-icon"><Icon name="users" size={21}/></span><strong>Belum ada kontak</strong><span>Tambahkan kontak untuk menyimpan relasi bisnis Anda.</span></div> : <div className="ledger-table-wrap"><div className="ledger-table contact-table"><div className="table-head"><span>NAMA</span><span>JENIS</span><span>EMAIL</span><span>TELEPON</span><span/></div>{contacts.map(contact => <div className="table-row" key={contact.id}><div className="transaction-name"><span className="transaction-avatar lavender">{contact.name.slice(0, 2).toUpperCase()}</span><strong>{contact.name}</strong></div><span className="transaction-category">{contact.type === 'customer' ? 'Pelanggan' : contact.type === 'supplier' ? 'Pemasok' : 'Pelanggan & pemasok'}</span><span className="transaction-date">{contact.email || '—'}</span><span className="transaction-date">{contact.phone || '—'}</span><button className="row-delete" aria-label={`Hapus kontak ${contact.name}`} onClick={() => onDelete(contact.id)}><Icon name="close" size={15}/></button></div>)}</div></div>}</article></>
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="module-stat"><span className="stat-bullet"/><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>
}

function SettingsPage({ organization, email, transactionCount, contactCount, onSignOut }: { organization: Organization; email: string; transactionCount: number; contactCount: number; onSignOut: () => void }) {
  return <><div className="module-heading"><div><div className="eyebrow"><span className="live-dot"/> WORKSPACE</div><h1>Pengaturan</h1><p className="subheading">Informasi dasar workspace dan akun yang sedang aktif.</p></div></div><div className="settings-grid"><section className="panel settings-panel"><div className="panel-header"><div><h2>Informasi perusahaan</h2><p>Data workspace yang digunakan untuk pencatatan.</p></div></div><div className="settings-list"><Setting label="Nama bisnis" value={organization.name}/><Setting label="Mata uang" value={`${organization.currency} · Rupiah Indonesia`}/><Setting label="Pemilik workspace" value={email}/></div></section><section className="panel settings-panel"><div className="panel-header"><div><h2>Data tersimpan</h2><p>Jumlah catatan pada workspace ini.</p></div></div><div className="settings-list"><Setting label="Transaksi" value={`${transactionCount} catatan`}/><Setting label="Kontak" value={`${contactCount} kontak`}/><Setting label="Penyimpanan" value="Supabase Database"/></div><button className="signout-button" onClick={onSignOut}><Icon name="logout" size={16}/> Keluar dari akun</button></section></div></>
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div className="setting-row"><span>{label}</span><strong>{value}</strong></div>
}

function EntryModal({ type, contacts, currency, onClose, onTransaction, onContact, loading }: { type: 'transaction' | 'contact'; contacts: Contact[]; currency: string; onClose: () => void; onTransaction: (event: FormEvent<HTMLFormElement>) => void; onContact: (event: FormEvent<HTMLFormElement>) => void; loading: boolean }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><form className="entry-modal" onSubmit={type === 'transaction' ? onTransaction : onContact}><div className="modal-top"><div><span className="modal-eyebrow">{type === 'transaction' ? 'PEMBUKUAN' : 'RELasi BISNIS'}</span><h2>{type === 'transaction' ? 'Catat transaksi' : 'Tambah kontak'}</h2></div><button type="button" className="icon-button" aria-label="Tutup" onClick={onClose}><Icon name="close"/></button></div>{type === 'transaction' ? <><label className="field-label">Jenis transaksi<select name="type" required defaultValue="expense"><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label><label className="field-label">Keterangan<input name="description" required maxLength={180} placeholder="Contoh: Pembayaran jasa"/></label><label className="field-label">Kategori<input name="category" maxLength={80} placeholder="Contoh: Penjualan"/></label><label className="field-label">Nominal ({currency})<input name="amount" required type="number" min="1" step="1" inputMode="numeric" placeholder="0"/></label><label className="field-label">Tanggal<input name="date" type="date" defaultValue={today()} required/></label>{contacts.length > 0 && <p className="form-hint">Kontak tersimpan: {contacts.length}. Pengaitan kontak bisa dilakukan saat fitur invoice tersedia.</p>}</> : <><label className="field-label">Nama kontak<input name="name" required maxLength={120} placeholder="Nama pelanggan atau pemasok"/></label><label className="field-label">Jenis kontak<select name="type" defaultValue="customer"><option value="customer">Pelanggan</option><option value="supplier">Pemasok</option><option value="both">Pelanggan & pemasok</option></select></label><label className="field-label">Email<input name="email" type="email" maxLength={254} placeholder="email@perusahaan.id"/></label><label className="field-label">Nomor telepon<input name="phone" type="tel" maxLength={32} placeholder="Nomor telepon"/></label></>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Batal</button><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Menyimpan…' : 'Simpan'} <Icon name="arrow" size={15}/></button></div></form></div>
}

export default App
