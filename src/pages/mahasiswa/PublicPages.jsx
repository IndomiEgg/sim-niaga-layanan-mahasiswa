import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brand, Button, Status } from '../../components/ui/Primitives';
import {
  getApiError,
  getPrograms,
  getPublicServices,
  getPublicServiceForm,
  getStudentDocumentUrl,
  getStudentDocuments,
  getTracking,
  getTrackingDownloadUrl,
  requestStudentAccess,
  resubmitRequest,
  submitCustomService,
  submitLetterRequest,
  submitReadinessApplication,
  verifyStudentOtp,
} from '../../services/publicApi';

const defaultServices = [
  { kode: 'C1', nama: 'Permohonan Surat', deskripsi: 'Ajukan permohonan surat akademik.' },
  { kode: 'C2', nama: 'Surat Peringatan', deskripsi: 'Lihat surat peringatan mahasiswa.' },
  { kode: 'C3', nama: 'Unduh Berkas Mahasiswa', deskripsi: 'Unduh berkas yang disiapkan Admin Prodi.' },
  { kode: 'C4', nama: 'Kesiapan Sidang', deskripsi: 'Daftar dan unggah dokumen persyaratan sidang.' },
];

function PublicHeader() {
  return <><div className="public-announcement">Layanan Mahasiswa Jurusan Administrasi Niaga</div><header className="figma-public-header"><Brand/><nav aria-label="Navigasi layanan"><Link to="/">Beranda</Link><Link to="/layanan/P-02">Permohonan Surat</Link><Link to="/layanan/P-06">Surat Peringatan</Link><Link to="/layanan/P-07">Unduh Berkas</Link><Link to="/layanan/P-08">Kesiapan Sidang</Link></nav><Link className="button button-secondary" to="/layanan/P-04">Lacak tiket</Link></header></>;
}

function PublicFooter() {
  return <footer className="figma-public-footer"><div><Brand/><p>Jurusan Administrasi Niaga<br/>Politeknik Negeri Medan</p></div><section><b>Layanan</b><Link to="/layanan/P-02">Permohonan Surat</Link><Link to="/layanan/P-06">Surat Peringatan</Link><Link to="/layanan/P-07">Unduh Berkas</Link></section><section><b>Bantuan</b><a href="#kontak">Informasi layanan</a></section><section id="kontak"><b>Kontak</b><a href="#kontak">Jurusan Administrasi Niaga</a></section></footer>;
}

function Breadcrumb({ items }) {
  return <nav className="figma-breadcrumb" aria-label="Jejak halaman">{items.map((item, index) => <span key={`${item.label}-${index}`}>{index > 0 && <i>›</i>}{item.to ? <Link to={item.to}>{item.label}</Link> : <b aria-current="page">{item.label}</b>}</span>)}</nav>;
}

function PublicShell({ children }) {
  return <div className="figma-public"><PublicHeader/>{children}<PublicFooter/></div>;
}

function usePrograms() {
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getPrograms().then((items) => { if (active) setPrograms(Array.isArray(items) ? items : []); })
      .catch((reason) => { if (active) setError(getApiError(reason)); });
    return () => { active = false; };
  }, []);
  return { programs, error };
}

function servicePath(service) {
  return ({ C1: '/layanan/P-02', C2: '/layanan/P-06', C3: '/layanan/P-07', C4: '/layanan/P-08' })[service.kode]
    || `/layanan/${encodeURIComponent(service.kode)}`;
}

export function PublicHome() {
  const [ticket, setTicket] = useState('');
  const [services, setServices] = useState(defaultServices);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getPublicServices().then((items) => { if (active) setServices(Array.isArray(items) ? items : []); })
      .catch((reason) => { if (active) setError(getApiError(reason)); });
    return () => { active = false; };
  }, []);
  return <PublicShell><main className="figma-public-main figma-home">
    <section className="figma-home-hero"><div className="figma-image-placeholder" aria-label="Area gambar layanan"/><div><p className="figma-eyebrow">JURUSAN ADMINISTRASI NIAGA</p><h1>Layanan Mahasiswa<br/>Jurusan Administrasi Niaga</h1><p className="figma-muted">Akses layanan administrasi dan dokumen mahasiswa melalui satu tempat.</p><div className="figma-actions"><Link className="button button-accent" to="/layanan/P-02">Ajukan permohonan surat</Link><Link className="button button-secondary" to="/layanan/P-04">Lacak status</Link></div></div></section>
    <form className="figma-quick-track" onSubmit={(event) => { event.preventDefault(); window.location.assign(`/layanan/P-04?ticket=${encodeURIComponent(ticket.trim())}`); }}><b>Lacak cepat</b><input required value={ticket} onChange={(event) => setTicket(event.target.value)} placeholder="Masukkan kode pelacakan"/><Button type="submit">Lacak</Button></form>
    {error && <p className="figma-warning" role="alert">Daftar layanan sementara tidak dapat dimuat dari server: {error}</p>}
    <section className="figma-service-block" id="layanan"><h2>Layanan</h2><div className="figma-service-grid">{services.map((service) => <Link key={service.kode} to={servicePath(service)} className="figma-service-card"><span className="figma-service-icon" aria-hidden="true">○</span><b>{service.nama}</b><small>{service.deskripsi}</small><span className="figma-open">Buka ›</span></Link>)}</div></section>
    <section className="figma-howto"><h2>Cara kerja permohonan surat</h2><div><article><b>1</b><span>Menunggu respon Admin Prodi</span></article><article><b>2</b><span>Diproses Admin Prodi</span></article><article><b>3</b><span>Menunggu tanda tangan Kajur</span></article><article><b>4</b><span>Selesai</span></article></div></section>
    <p className="figma-notice">Data pribadi dan scan KTM tidak ditampilkan pada halaman pelacakan publik.</p>
  </main></PublicShell>;
}

function TicketReceipt({ ticket, status = 'menunggu_admin', email }) {
  const copy = async () => { try { await navigator.clipboard.writeText(ticket); } catch { /* Clipboard may be unavailable on non-HTTPS origins. */ } };
  return <section className="figma-receipt"><span className="figma-receipt-check">✓</span><h1>Permohonan terkirim</h1><p>Simpan kode pelacakan ini. Kode diperlukan untuk melihat status permohonan.</p><div className="figma-ticket-number"><small>Kode pelacakan</small><b>{ticket}</b><button onClick={copy} type="button">Salin</button></div>{email && <p>Kode juga dikirim ke {email}.</p>}<Status value={status}/><div className="figma-actions"><Link className="button button-primary" to={`/layanan/P-04?ticket=${encodeURIComponent(ticket)}`}>Lacak status</Link><Link className="button button-secondary" to="/layanan/P-02">Ajukan permohonan lain</Link></div></section>;
}

function RequestLetter({ repair = false }) {
  const navigate = useNavigate();
  const { programs, error: programsError } = usePrograms();
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const ticket = new URLSearchParams(window.location.search).get('ticket') || '';
  const [previous, setPrevious] = useState(null);
  const [previousLoaded, setPreviousLoaded] = useState(!repair || !ticket);
  useEffect(() => {
    if (!repair || !ticket) return undefined;
    let active = true;
    getTracking(ticket).then((record) => { if (active) setPrevious(record); })
      .catch((reason) => { if (active) setFormError(getApiError(reason)); })
      .finally(() => { if (active) setPreviousLoaded(true); });
    return () => { active = false; };
  }, [repair, ticket]);

  if (repair && (!ticket || !previousLoaded || !previous?.bisa_ajukan_ulang)) return <main className="figma-public-main"><Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'Lacak status', to: '/layanan/P-04' }, { label: 'Perbaiki' }]}/><section className="figma-receipt"><h1>{!ticket ? 'Kode pelacakan diperlukan' : !previousLoaded ? 'Memeriksa permohonan…' : 'Permohonan belum dapat diajukan ulang'}</h1><p>{formError || previous?.alasan_pengembalian || 'Masukkan kode pelacakan yang valid dan pastikan statusnya dikembalikan.'}</p><Link className="button button-primary" to="/layanan/P-04">Kembali ke pelacakan</Link></section></main>;
  if (receipt) return <main className="figma-public-main"><TicketReceipt ticket={receipt.kode_pelacakan} status={receipt.status} email={receipt.dikirim_ke?.email}/></main>;

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('ktm');
    if (file instanceof File && file.size > 2 * 1024 * 1024) { setFormError('Ukuran scan KTM maksimal 2 MB.'); return; }
    setSaving(true); setFormError('');
    try {
      let result;
      if (repair) {
        const retry = new FormData();
        retry.append('peruntukan', String(data.get('peruntukan') || ''));
        if (file instanceof File && file.size) retry.append('ktm', file);
        result = await resubmitRequest(ticket, retry);
      } else {
        data.set('prodi_id', String(data.get('prodi_id')));
        result = await submitLetterRequest(data);
      }
      setReceipt(result);
    } catch (reason) { setFormError(getApiError(reason)); }
    finally { setSaving(false); }
  };

  return <main className="figma-public-main"><Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'Permohonan Surat', to: '/layanan/P-02' }, { label: repair ? 'Perbaiki' : 'Formulir permohonan surat' }]}/><div className="figma-content-width"><h1>{repair ? 'Perbaiki dan Ajukan Ulang' : 'Formulir Permohonan Surat'}</h1><p className="figma-muted">Surat untuk keperluan mahasiswa.</p>{repair && <div className="figma-warning">Alasan pengembalian: {previous?.alasan_pengembalian || '—'} · {ticket}</div>}{programsError && <p className="figma-warning" role="alert">Daftar program studi gagal dimuat: {programsError}</p>}{formError && <p className="figma-warning" role="alert">{formError}</p>}
    <form className="figma-form-with-summary" onSubmit={submit}><section className="figma-form-card"><div className="figma-form-grid">{!repair && <label>Program studi<select name="prodi_id" required defaultValue=""><option value="" disabled>Pilih program studi</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.nama}</option>)}</select></label>}<label>Nama<input name="nama" required defaultValue="" placeholder="Nama lengkap"/></label><label>NIM<input name="nim" required placeholder="NIM"/></label>{!repair && <><label>Email<input name="email" type="email" required placeholder="Email aktif"/></label><label>Nomor WhatsApp<input name="no_whatsapp" type="tel" required placeholder="08xxxxxxxxxx"/></label></>}<label className="figma-full">Peruntukan surat<textarea name="peruntukan" rows="3" required defaultValue="" placeholder="Keperluan surat"/></label><label className="figma-full">Scan KTM (PDF/JPG/PNG, maksimal 2 MB)<input name="ktm" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required={!repair}/></label></div><div className="figma-form-actions"><Button type="submit" disabled={saving||(!repair&&!programs.length)}>{saving ? 'Mengirim…' : repair ? 'Ajukan ulang' : 'Kirim permohonan'}</Button><button type="button" className="button button-secondary" onClick={() => navigate(repair ? '/layanan/P-04' : '/')}>Batal</button></div></section><aside className="figma-summary"><h2>Periksa sebelum kirim</h2><p>Kode pelacakan akan diterbitkan oleh server.</p><small>Scan KTM hanya dapat diakses Admin Prodi terkait.</small></aside></form></div></main>;
}

const statusLabels = { menunggu_admin: 'Menunggu respon Admin Prodi', diproses_admin: 'Diproses Admin Prodi', dikembalikan: 'Dikembalikan', diajukan_ulang: 'Diajukan ulang', ttd_kajur: 'Menunggu tanda tangan Kajur', selesai: 'Selesai' };

function RequestStatus() {
  const initialTicket = new URLSearchParams(window.location.search).get('ticket') || '';
  const [ticket, setTicket] = useState(initialTicket);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const lookup = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setRecord(null);
    try { setRecord(await getTracking(ticket)); } catch (reason) { setError(getApiError(reason)); }
    finally { setLoading(false); }
  };
  const download = async () => {
    try { const url = await getTrackingDownloadUrl(ticket); if (!url) throw new Error('Server tidak memberikan tautan unduh.'); window.location.assign(url); }
    catch (reason) { setDownloadError(getApiError(reason)); }
  };
  return <main className="figma-public-main"><Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'Lacak status' }]}/><div className="figma-content-width"><h1>Lacak Status Permohonan</h1><form className="figma-track-form" onSubmit={lookup}><input required value={ticket} onChange={(event) => { setTicket(event.target.value); setRecord(null); }} placeholder="Kode pelacakan"/><Button type="submit" disabled={loading}>{loading ? 'Memeriksa…' : 'Cek status'}</Button></form>{error && <p className="figma-warning" role="alert">{error}</p>}{record && <section className="figma-track-result"><div className="figma-track-head"><div><small>KODE PELACAKAN</small><b>{record.kode_pelacakan}</b></div><Status value={statusLabels[record.status] || record.status_label}/></div><h2>{record.jenis_layanan || 'Permohonan surat'}</h2><p>{record.prodi || '—'} · {record.nama_tersamar || '—'} · {record.nim_tersamar || '—'}</p><ol className="figma-status-line">{Object.entries(statusLabels).filter(([key]) => !['diajukan_ulang'].includes(key)).map(([key, label]) => <li key={key} className={key === record.status ? 'active' : ''}>{label}</li>)}</ol>{record.alasan_pengembalian && <div className="figma-warning"><b>Alasan pengembalian:</b> {record.alasan_pengembalian}</div>}<div className="figma-track-actions">{record.bisa_ajukan_ulang && <Link className="button button-secondary" to={`/layanan/P-05?ticket=${encodeURIComponent(record.kode_pelacakan)}`}>Perbaiki dan ajukan ulang</Link>}<Button kind="secondary" disabled={!record.bisa_unduh} onClick={download}>Unduh surat</Button></div>{downloadError && <p className="figma-warning" role="alert">{downloadError}</p>}<h2>Riwayat status</h2><div className="figma-table-wrap"><table><thead><tr><th>Waktu</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>{(record.riwayat || []).map((entry, index) => <tr key={`${entry.status}-${index}`}><td>{new Date(entry.waktu).toLocaleString('id-ID')}</td><td>{entry.label || statusLabels[entry.status] || entry.status}</td><td>{entry.keterangan || '—'}</td></tr>)}</tbody></table></div></section>}</div></main>;
}

function StudentAccess({ screen }) {
  const isMarks = screen.code === 'P-07';
  const [nim, setNim] = useState('');
  const [ticket, setTicket] = useState('');
  const [otp, setOtp] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [rows, setRows] = useState([]);
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authorize = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setRows([]);
    try {
      const result = await requestStudentAccess(nim, ticket);
      if (result.perlu_otp) { setNeedsOtp(true); return; }
      if (!result.token_akses) throw new Error('Server tidak mengembalikan token akses mahasiswa.');
      setAccessToken(result.token_akses);
      const items = await getStudentDocuments(isMarks ? 'marksheet' : 'sp', result.token_akses);
      setRows(Array.isArray(items) ? items : []);
    } catch (reason) { setError(getApiError(reason)); }
    finally { setLoading(false); }
  };
  const verify = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const result = await verifyStudentOtp(nim, otp);
      if (!result.token_akses) throw new Error('Server tidak mengembalikan token akses mahasiswa.');
      setAccessToken(result.token_akses); setNeedsOtp(false);
      const items = await getStudentDocuments(isMarks ? 'marksheet' : 'sp', result.token_akses);
      setRows(Array.isArray(items) ? items : []);
    } catch (reason) { setError(getApiError(reason)); }
    finally { setLoading(false); }
  };
  const download = async (id) => {
    try { const url = await getStudentDocumentUrl(id, accessToken); if (!url) throw new Error('Server tidak memberikan tautan unduh.'); window.location.assign(url); }
    catch (reason) { setError(getApiError(reason)); }
  };
  const visibleRows = rows.filter((row) => !isMarks || !semester || String(row.semester) === semester);
  return <main className="figma-public-main"><Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: screen.title }]}/><div className="figma-content-width"><h1>{isMarks ? 'Unduh Berkas Mahasiswa' : 'Surat Peringatan'}</h1><p className="figma-muted">Masukkan NIM dan kode pelacakan privat untuk memperoleh akses sementara.</p>{!accessToken && <form className="figma-form-card" onSubmit={needsOtp ? verify : authorize}><div className="figma-track-form"><input required value={nim} onChange={(event) => setNim(event.target.value)} placeholder="Masukkan NIM"/><input required type="password" autoComplete="off" value={needsOtp ? otp : ticket} onChange={(event) => needsOtp ? setOtp(event.target.value) : setTicket(event.target.value)} placeholder={needsOtp ? 'Kode OTP' : 'Kode pelacakan privat'}/><Button type="submit" disabled={loading}>{loading ? 'Memeriksa…' : needsOtp ? 'Verifikasi OTP' : 'Lanjutkan'}</Button></div></form>}{error && <p className="figma-warning" role="alert">{error}</p>}{accessToken && isMarks && <label className="frame-label">Semester<select value={semester} onChange={(event) => setSemester(event.target.value)}><option value="">Semua semester</option>{Array.from({ length: 8 }, (_, index) => String(index + 1)).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}{accessToken && visibleRows.length === 0 && <div className="figma-empty-result">Tidak ada berkas yang tersedia.</div>}{accessToken && visibleRows.length > 0 && <div className="figma-table-wrap"><table><thead><tr>{isMarks ? <><th>Semester</th><th>Tahun akademik</th></> : <><th>Tingkat</th><th>Tanggal</th><th>Program studi</th></>}<th>Dokumen</th><th>Aksi</th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id}>{isMarks ? <><td>{row.semester}</td><td>{row.tahun_akademik || '—'}</td></> : <><td>{row.tingkat}</td><td>{row.tanggal || '—'}</td><td>{row.prodi || '—'}</td></>}<td>{row.dokumen?.nama_asli || '—'}</td><td><Button onClick={() => download(row.dokumen?.id)}>Unduh</Button></td></tr>)}</tbody></table></div>}</div></main>;
}

function ReadinessForm() {
  const navigate = useNavigate();
  const { programs, error: programsError } = usePrograms();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    data.set('prodi_id', String(data.get('prodi_id')));
    try { const result = await submitReadinessApplication(data); navigate('/layanan/P-09', { state: { submission: result } }); }
    catch (reason) { setError(getApiError(reason)); }
    finally { setBusy(false); }
  };
  return <main className="figma-public-main"><Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'Kesiapan Sidang' }]}/><div className="figma-content-width"><h1>Pendaftaran Kesiapan Sidang</h1><p className="figma-muted">Unggah empat dokumen persyaratan.</p>{(programsError || error) && <p className="figma-warning" role="alert">{error || programsError}</p>}<form className="figma-form-card" onSubmit={submit}><div className="figma-form-grid"><label>Program studi<select name="prodi_id" required defaultValue=""><option value="" disabled>Pilih program studi</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.nama}</option>)}</select></label><label>Nama<input name="nama" required/></label><label>NIM<input name="nim" required/></label><label>Scan cover ACC tugas akhir<input name="cover_acc" type="file" required/></label><label>Scan kartu bimbingan<input name="kartu_bimbingan" type="file" required/></label><label>Lembar persetujuan<input name="lembar_persetujuan" type="file" required/></label><label>Bukti penyerahan laporan magang<input name="bukti_magang" type="file" required/></label></div><div className="figma-form-actions"><Button type="submit" disabled={busy||!programs.length}>{busy ? 'Mengirim…' : 'Daftar'}</Button><button type="button" className="button button-secondary" onClick={() => navigate('/')}>Batal</button></div></form></div></main>;
}

function ReadinessReceipt() {
  const { state } = useLocation();
  const submission = state?.submission;
  return <main className="figma-public-main"><section className="figma-receipt"><span className="figma-receipt-check">✓</span><h1>{submission ? 'Pendaftaran diterima' : 'Informasi pendaftaran'}</h1><p>{submission ? `Status: ${submission.status || 'diterima'}. ID pendaftaran: ${submission.id || '—'}.` : 'Untuk mendaftar, kirim formulir kesiapan sidang terlebih dahulu.'}</p><Link className="button button-primary" to={submission ? '/' : '/layanan/P-08'}>{submission ? 'Kembali ke beranda' : 'Isi formulir'}</Link></section></main>;
}

function DynamicService({ code }) {
  const { programs, error: programsError } = usePrograms();
  const [definition, setDefinition] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  useEffect(() => { let active = true; getPublicServiceForm(code).then((data) => { if (active) setDefinition(data); }).catch((reason) => { if (active) setError(getApiError(reason)); }); return () => { active = false; }; }, [code]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); const data = new FormData(event.currentTarget);
    const fields = {};
    for (const field of definition?.isian || []) {
      const value = data.get(field.nama);
      if (field.tipe === 'file') { if (value instanceof File && value.size) data.append(`isian[${field.nama}]`, value); data.delete(field.nama); }
      else { fields[field.nama] = value; data.delete(field.nama); }
    }
    data.append('isian', JSON.stringify(fields)); data.set('prodi_id', String(data.get('prodi_id')));
    try { setReceipt(await submitCustomService(code, data)); } catch (reason) { setError(getApiError(reason)); } finally { setBusy(false); }
  };
  if (receipt) return <main className="figma-public-main"><TicketReceipt ticket={receipt.kode_pelacakan} status={receipt.status} email={receipt.dikirim_ke?.email}/></main>;
  return <main className="figma-public-main"><Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: definition?.nama || code }]}/><div className="figma-content-width"><h1>{definition?.nama || 'Layanan'}</h1><p className="figma-muted">{definition?.petunjuk || definition?.deskripsi}</p>{(error || programsError) && <p className="figma-warning" role="alert">{error || programsError}</p>}{definition && <form className="figma-form-card" onSubmit={submit}><div className="figma-form-grid"><label>Program studi<select name="prodi_id" required defaultValue=""><option value="" disabled>Pilih program studi</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.nama}</option>)}</select></label><label>Nama<input name="nama" required/></label><label>NIM<input name="nim" required/></label><label>Email<input name="email" type="email" required/></label><label>Nomor WhatsApp<input name="no_whatsapp" required/></label>{(definition.isian || []).map((field) => <label key={field.nama} className={field.tipe === 'teks_panjang' ? 'figma-full' : ''}>{field.label}{field.wajib && ' *'}{field.tipe === 'pilihan' ? <select name={field.nama} required={field.wajib} defaultValue=""><option value="">Pilih</option>{(field.opsi || []).map((option) => <option key={option}>{option}</option>)}</select> : field.tipe === 'teks_panjang' ? <textarea name={field.nama} required={field.wajib} rows="3"/> : <input name={field.nama} type={field.tipe === 'angka' ? 'number' : field.tipe === 'tanggal' ? 'date' : field.tipe === 'email' ? 'email' : field.tipe === 'file' ? 'file' : 'text'} required={field.wajib} accept={field.tipe === 'file' ? '.pdf,.jpg,.jpeg,.png' : undefined}/>}</label>)}</div><div className="figma-form-actions"><Button type="submit" disabled={busy||!programs.length}>{busy ? 'Mengirim…' : 'Kirim pengajuan'}</Button></div></form>}</div></main>;
}

export function StudentService({ screen }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [screen.code]);
  let content;
  if (screen.code === 'P-02') content = <RequestLetter/>;
  else if (screen.code === 'P-03') { const ticket = new URLSearchParams(window.location.search).get('ticket') || ''; content = ticket ? <TicketReceipt ticket={ticket}/> : <main className="figma-public-main"><section className="figma-receipt"><h1>Belum ada kode pelacakan</h1><Link to="/layanan/P-02" className="button button-primary">Ajukan permohonan</Link></section></main>; }
  else if (screen.code === 'P-04') content = <RequestStatus/>;
  else if (screen.code === 'P-05') content = <RequestLetter repair/>;
  else if (screen.code === 'P-08') content = <ReadinessForm/>;
  else if (screen.code === 'P-09') content = <ReadinessReceipt/>;
  else if (screen.code === 'P-06' || screen.code === 'P-07') content = <StudentAccess screen={screen}/>;
  else content = <DynamicService code={screen.code}/>;
  return <PublicShell>{content}</PublicShell>;
}
