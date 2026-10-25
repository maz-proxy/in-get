import { useMemo, useState } from 'react'

type IconName = 'grid' | 'receipt' | 'cart' | 'box' | 'chart' | 'users' | 'settings' | 'search' | 'bell' | 'chevron' | 'plus' | 'arrow' | 'dots' | 'wallet' | 'clock' | 'close' | 'calendar'
type Transaction = { name: string; category: string; date: string; amount: number; kind: 'in' | 'out'; initials: string; color: string }

const iconPaths: Record<IconName, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  receipt: 'M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8M8 16h4',
  cart: 'M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6M10 20h.01M17 20h.01',
  box: 'm12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9',
  chart: 'M4 19V5M4 19h17M8 15l4-4 3 2 5-7',
  users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.9.1l-.2.1h-3.6l-.1-.2a1.7 1.7 0 0 0-1.6-1.1 1.7 1.7 0 0 0-1.1.4l-.2.1-3.1-1.8.1-.2a1.7 1.7 0 0 0-.1-1.9l-.1-.2v-3.6l.2-.1a1.7 1.7 0 0 0 .7-2.7l-.1-.2 1.8-3.1.2.1a1.7 1.7 0 0 0 1.9-.1l.2-.1h3.6l.1.2a1.7 1.7 0 0 0 2.7.7l.2-.1 3.1 1.8-.1.2a1.7 1.7 0 0 0 .1 1.9l.1.2v3.6l-.2.1a1.7 1.7 0 0 0-.7 1.1Z',
  search: 'm20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  chevron: 'm9 18 6-6-6-6',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M7 17 17 7M7 7h10v10',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  wallet: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5zM4 8h16M16 13h.01',
  clock: 'M12 8v4l2.5 1.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  close: 'M18 6 6 18M6 6l12 12',
  calendar: 'M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z',
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>
}

const initialTransactions: Transaction[] = [
  { name: 'PT Sinar Pagi', category: 'Pelunasan invoice INV-0241', date: 'Hari ini, 10:42', amount: 12500000, kind: 'in', initials: 'SP', color: 'peach' },
  { name: 'Kopi Tengah Kota', category: 'Pembelian bahan baku', date: 'Hari ini, 09:18', amount: 2480000, kind: 'out', initials: 'KT', color: 'mint' },
  { name: 'Studio Karsa', category: 'Pembayaran invoice INV-0238', date: 'Kemarin, 16:25', amount: 8750000, kind: 'in', initials: 'SK', color: 'lavender' },
  { name: 'Ruang Rasa Supply', category: 'Tagihan pemasok', date: 'Kemarin, 14:06', amount: 3950000, kind: 'out', initials: 'RR', color: 'yellow' },
]

const navGroups: { label: string; items: { name: string; icon: IconName }[] }[] = [
  { label: 'RUANG KERJA', items: [{ name: 'Ringkasan', icon: 'grid' }, { name: 'Transaksi', icon: 'receipt' }] },
  { label: 'OPERASIONAL', items: [{ name: 'Penjualan', icon: 'cart' }, { name: 'Pembelian', icon: 'box' }, { name: 'Persediaan', icon: 'box' }, { name: 'Kontak', icon: 'users' }] },
  { label: 'ANALISIS', items: [{ name: 'Laporan', icon: 'chart' }] },
]

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function CashflowChart() {
  return <div className="chart-wrap">
    <div className="chart-y"><span>40 jt</span><span>30 jt</span><span>20 jt</span><span>10 jt</span><span>0</span></div>
    <svg className="chart" viewBox="0 0 660 220" preserveAspectRatio="none" role="img" aria-label="Grafik pemasukan dan pengeluaran enam bulan terakhir">
      <defs><linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2f8068" stopOpacity=".17"/><stop offset="100%" stopColor="#2f8068" stopOpacity="0"/></linearGradient></defs>
      {[15, 61, 107, 153, 199].map(y => <line key={y} x1="0" y1={y} x2="660" y2={y} className="grid-line" />)}
      <path d="M0 139 C38 132 55 100 110 112 S175 85 220 98 S285 64 330 81 S397 38 440 58 S508 36 550 46 S613 17 660 25 L660 199 L0 199Z" fill="url(#incomeFill)" />
      <path d="M0 139 C38 132 55 100 110 112 S175 85 220 98 S285 64 330 81 S397 38 440 58 S508 36 550 46 S613 17 660 25" className="income-line" />
      <path d="M0 172 C42 162 68 178 110 160 S180 149 220 165 S288 142 330 151 S397 126 440 144 S505 111 550 130 S615 120 660 105" className="expense-line" />
      <circle cx="660" cy="25" r="4.5" className="income-dot"/><circle cx="660" cy="105" r="4.5" className="expense-dot"/>
    </svg>
    <div className="chart-x"><span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span></div>
  </div>
}

function App() {
  const [active, setActive] = useState('Ringkasan')
  const [transactions, setTransactions] = useState(initialTransactions)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'Pemasukan' | 'Pengeluaran' | 'Buat invoice' | null>(null)
  const [toast, setToast] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const filteredTransactions = useMemo(() => transactions.filter(item => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [transactions, search])
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }

  function submitEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!modal) return
    if (modal === 'Buat invoice') { showToast('Invoice baru berhasil disiapkan'); setModal(null); setDescription(''); setAmount(''); return }
    const numericAmount = Number(amount)
    if (!numericAmount || !description.trim()) return
    setTransactions([{ name: description.trim(), category: modal === 'Pemasukan' ? 'Pemasukan baru' : 'Pengeluaran baru', date: 'Baru saja', amount: numericAmount, kind: modal === 'Pemasukan' ? 'in' : 'out', initials: description.trim().slice(0, 2).toUpperCase(), color: 'mint' }, ...transactions])
    setModal(null); setDescription(''); setAmount(''); showToast(`${modal} berhasil dicatat`)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span/><span/><span/></div><span>arunika<span className="brand-period">.</span></span></div>
      <button className="company-switch"><div className="company-avatar">N</div><div className="company-copy"><strong>Nusa Kreatif</strong><small>Bisnis utama</small></div><span className="switch-chevron"><Icon name="chevron" size={15}/></span></button>
      <nav className="side-nav" aria-label="Navigasi utama">
        {navGroups.map(group => <div className="nav-group" key={group.label}><p className="nav-label">{group.label}</p>{group.items.map(item => <button key={item.name} className={`nav-item ${active === item.name ? 'selected' : ''}`} onClick={() => setActive(item.name)}><Icon name={item.icon}/><span>{item.name}</span>{item.name === 'Penjualan' && <span className="nav-count">3</span>}</button>)}</div>)}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-orb">✳</div><strong>Butuh bantuan?</strong><p>Tim kami siap bantu kapan saja.</p><button onClick={() => showToast('Tim bantuan akan segera menghubungi Anda')}>Hubungi tim <Icon name="arrow" size={14}/></button></div><button className={`nav-item settings-link ${active === 'Pengaturan' ? 'selected' : ''}`} onClick={() => setActive('Pengaturan')}><Icon name="settings"/><span>Pengaturan</span></button><div className="profile"><div className="profile-avatar">AD</div><div className="profile-copy"><strong>Aditya Darma</strong><small>Administrator</small></div><button className="icon-button profile-menu" aria-label="Menu profil"><Icon name="dots"/></button></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14}/><strong>{active}</strong></div><div className="top-actions"><label className="search-box"><Icon name="search" size={17}/><input aria-label="Cari" placeholder="Cari apa saja..." value={search} onChange={event => setSearch(event.target.value)}/><kbd>⌘ K</kbd></label><button className="icon-button notification" aria-label="Notifikasi" onClick={() => showToast('Kamu sudah melihat semua notifikasi')}><Icon name="bell"/><i/></button><div className="top-avatar">AD</div></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> SENIN, 26 OKTOBER 2026</div><h1>Selamat pagi, Aditya <span className="wave">✳</span></h1><p className="subheading">Ini yang sedang terjadi dengan bisnismu hari ini.</p></div><button className="date-filter" onClick={() => showToast('Periode laporan: 1–31 Oktober 2026')}><Icon name="calendar" size={16}/> 1 – 31 Okt 2026 <Icon name="chevron" size={14}/></button></div>
        <section className="metric-grid" aria-label="Ringkasan keuangan">
          <article className="metric-card balance-card"><div className="metric-head"><span>Saldo kas & bank</span><span className="metric-icon"><Icon name="wallet" size={17}/></span></div><strong className="metric-value">Rp 248.650.000</strong><div className="metric-foot"><span className="trend positive">↗ 12,8%</span><span>dari bulan lalu</span><button className="metric-more" aria-label="Detail saldo" onClick={() => showToast('Menampilkan rincian saldo kas dan bank')}><Icon name="dots"/></button></div><div className="balance-spark"><svg viewBox="0 0 120 34" preserveAspectRatio="none"><path d="M0 29 C12 27 13 22 25 24 S40 15 51 19 S65 10 75 15 S91 6 100 10 S111 3 120 5"/></svg></div></article>
          <article className="metric-card"><div className="metric-head"><span>Total pemasukan</span><span className="metric-icon icon-green"><Icon name="arrow" size={16}/></span></div><strong className="metric-value">Rp 86.420.000</strong><div className="metric-foot"><span className="trend positive">↗ 8,2%</span><span>dari bulan lalu</span><span className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/></span></div></article>
          <article className="metric-card"><div className="metric-head"><span>Total pengeluaran</span><span className="metric-icon icon-coral"><Icon name="arrow" size={16}/></span></div><strong className="metric-value">Rp 32.180.000</strong><div className="metric-foot"><span className="trend negative">↘ 3,4%</span><span>dari bulan lalu</span><span className="mini-bars bars-coral"><i/><i/><i/><i/><i/><i/><i/><i/><i/></span></div></article>
          <article className="metric-card"><div className="metric-head"><span>Piutang berjalan</span><span className="metric-icon icon-violet"><Icon name="clock" size={16}/></span></div><strong className="metric-value">Rp 18.750.000</strong><div className="metric-foot"><span className="due-text"><span className="due-dot"/> 4 invoice belum lunas</span><button className="text-link" onClick={() => { setActive('Penjualan'); showToast('Menampilkan invoice belum lunas') }}>Lihat <Icon name="arrow" size={13}/></button></div></article>
        </section>

        <section className="middle-grid"><article className="panel cashflow-panel"><div className="panel-header"><div><h2>Arus kas</h2><p>Pemasukan dan pengeluaran bisnis</p></div><button className="select-period" onClick={() => showToast('Menampilkan data 6 bulan terakhir')}>6 bulan terakhir <Icon name="chevron" size={14}/></button></div><div className="chart-legend"><span><i className="legend-income"/> Pemasukan</span><span><i className="legend-expense"/> Pengeluaran</span><div className="chart-total"><small>Arus bersih</small><strong>+ Rp 54,2 jt</strong></div></div><CashflowChart/></article>
          <article className="panel receivable-panel"><div className="panel-header"><div><h2>Perlu perhatian</h2><p>Hal yang butuh ditindaklanjuti</p></div><button className="icon-button subtle" aria-label="Opsi"><Icon name="dots"/></button></div><div className="attention-list"><button className="attention-item" onClick={() => showToast('Membuka daftar piutang jatuh tempo')}><div className="attention-icon overdue"><Icon name="clock" size={17}/></div><div className="attention-copy"><strong>Piutang jatuh tempo</strong><small>2 invoice · PT Sinar Pagi + 1</small></div><div className="attention-value"><strong>Rp 8,5 jt</strong><Icon name="chevron" size={15}/></div></button><button className="attention-item" onClick={() => showToast('Membuka daftar tagihan yang akan jatuh tempo')}><div className="attention-icon upcoming"><Icon name="calendar" size={17}/></div><div className="attention-copy"><strong>Tagihan minggu ini</strong><small>3 tagihan perlu dibayar</small></div><div className="attention-value"><strong>Rp 4,2 jt</strong><Icon name="chevron" size={15}/></div></button><div className="attention-note"><span className="note-star">✦</span><span>Semua rekening bank sudah <strong>terhubung</strong> dan tersinkron.</span></div></div></article></section>

        <section className="lower-grid"><article className="panel transactions-panel"><div className="panel-header"><div><h2>Transaksi terbaru</h2><p>Aktivitas keuangan terkini</p></div><button className="view-all" onClick={() => setActive('Transaksi')}>Lihat semua <Icon name="arrow" size={14}/></button></div><div className="transaction-table"><div className="table-head"><span>TRANSAKSI</span><span>KATEGORI</span><span>TANGGAL</span><span>NOMINAL</span></div>{filteredTransactions.length ? filteredTransactions.slice(0, 4).map((item, index) => <div className="table-row" key={`${item.name}-${index}`}><div className="transaction-name"><span className={`transaction-avatar ${item.color}`}>{item.initials}</span><strong>{item.name}</strong></div><span className="transaction-category">{item.category}</span><span className="transaction-date">{item.date}</span><strong className={`transaction-amount ${item.kind}`}>{item.kind === 'in' ? '+' : '−'} {rupiah(item.amount)}</strong></div>) : <div className="empty-search">Tidak ada transaksi yang cocok dengan “{search}”.</div>}</div></article>
          <article className="panel quick-panel"><div className="panel-header"><div><h2>Mulai sesuatu</h2><p>Akses cepat untuk harimu</p></div></div><div className="quick-actions"><button className="quick-action" onClick={() => setModal('Pemasukan')}><span className="quick-icon income-quick"><Icon name="plus"/></span><span><strong>Catat pemasukan</strong><small>Uang masuk ke bisnis</small></span><Icon name="chevron" size={15}/></button><button className="quick-action" onClick={() => setModal('Pengeluaran')}><span className="quick-icon expense-quick"><Icon name="receipt"/></span><span><strong>Catat pengeluaran</strong><small>Catat biaya operasional</small></span><Icon name="chevron" size={15}/></button><button className="quick-action" onClick={() => setModal('Buat invoice')}><span className="quick-icon invoice-quick"><Icon name="arrow"/></span><span><strong>Buat invoice</strong><small>Kirim tagihan ke pelanggan</small></span><Icon name="chevron" size={15}/></button></div></article></section>
        <footer className="page-footer"><span>© 2026 Arunika Finance</span><span>Dibuat untuk bisnis yang terus bertumbuh <span className="footer-spark">✳</span></span></footer>
      </div>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}><form className="entry-modal" onSubmit={submitEntry}><div className="modal-top"><div><span className="modal-eyebrow">TRANSAKSI BARU</span><h2>{modal}</h2></div><button type="button" className="icon-button" aria-label="Tutup" onClick={() => setModal(null)}><Icon name="close"/></button></div><label className="field-label">{modal === 'Buat invoice' ? 'Nama pelanggan' : 'Deskripsi transaksi'}<input autoFocus required value={description} onChange={event => setDescription(event.target.value)} placeholder={modal === 'Buat invoice' ? 'Contoh: PT Sinar Pagi' : 'Contoh: Penjualan produk'} /></label><label className="field-label">Nominal (Rp)<input required type="number" min="1" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0" /></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModal(null)}>Batal</button><button className="primary-button" type="submit">{modal === 'Buat invoice' ? 'Siapkan invoice' : 'Simpan transaksi'} <Icon name="arrow" size={15}/></button></div></form></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </div>
}

export default App
