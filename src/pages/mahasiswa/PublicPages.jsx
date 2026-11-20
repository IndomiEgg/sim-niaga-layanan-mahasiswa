import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brand, Button, Status } from '../../components/ui/Primitives';
import { getDemoTicket, saveDemoTicket } from '../../services/demoRequests';
import { getDemoDocument, openDemoDocument } from '../../services/demoDocuments';
import { savePrivateFile } from '../../services/demoPrivateFiles';
import { findStudentFiles, getStudentFile, openStudentFile } from '../../services/demoStudentFiles';
import { getUploadError } from '../../services/demoDocuments';

const services = [
  ['P-02', 'Permohonan Surat', 'Ajukan permohonan surat akademik.'],
  ['P-06', 'Surat Peringatan', 'Cari informasi surat peringatan berdasarkan NIM.'],
  ['P-07', 'Unduh Berkas Mahasiswa', 'Unduh berkas yang disiapkan Admin Prodi.'],
  ['P-08', 'Kesiapan Sidang', 'Unggah dokumen persyaratan pendaftaran sidang.'],
];

function PublicHeader() {
  return <><div className="public-announcement">Pengumuman: jadwal pemeliharaan / pengumpulan data</div><header className="figma-public-header"><Brand/><nav aria-label="Navigasi layanan"><Link to="/">Beranda</Link><Link to="/layanan/P-02">Permohonan Surat</Link><Link to="/layanan/P-06">Surat Peringatan</Link><Link to="/layanan/P-07">Unduh Berkas</Link><Link to="/layanan/P-08">Kesiapan Sidang</Link></nav><Link className="button button-secondary" to="/layanan/P-04">Lacak tiket</Link></header></>;
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

export function PublicHome() {
  const [ticket, setTicket] = useState('');
  return <PublicShell><main className="figma-public-main figma-home">
    <p className="figma-notice">Pengumuman: jadwal pemeliharaan / pengumpulan data</p>
    <section className="figma-home-hero"><div className="figma-image-placeholder" aria-label="Area gambar layanan"/><div><p className="figma-eyebrow">JURUSAN ADMINISTRASI NIAGA</p><h1>Layanan Mahasiswa<br/>Jurusan Administrasi Niaga</h1><p className="figma-muted">Akses layanan administrasi dan dokumen mahasiswa melalui satu tempat.</p><div className="figma-actions"><Link className="button button-accent" to="/layanan/P-02">Ajukan permohonan surat</Link><Link className="button button-secondary" to="/layanan/P-04">Lacak status</Link></div></div></section>
    <form className="figma-quick-track" onSubmit={e=>{e.preventDefault();window.location.href=`/layanan/P-04?ticket=${encodeURIComponent(ticket)}`;}}><b>Lacak cepat</b><input required value={ticket} onChange={e=>setTicket(e.target.value)} placeholder="Masukkan nomor tiket"/><Button type="submit">Lacak</Button></form>
    <section className="figma-service-block" id="layanan"><h2>Layanan</h2><div className="figma-service-grid">{services.map(([code,title,desc])=><Link key={code} to={`/layanan/${code}`} className="figma-service-card"><span className="figma-service-icon" aria-hidden="true">○</span><b>{title}</b><small>{desc}</small><span className="figma-open">Buka ›</span></Link>)}<article className="figma-service-card figma-service-new"><span className="figma-service-icon">＋</span><b>Layanan baru</b><small>Ditampilkan otomatis saat tersedia.</small><span className="figma-open">(otomatis)</span></article></div></section>
    <section className="figma-howto"><h2>Cara kerja permohonan surat</h2><div><article><b>1</b><span>Menunggu respon admin prodi</span></article><article><b>2</b><span>Diproses admin</span></article><article><b>3</b><span>TTD Kajur</span></article><article><b>4</b><span>Selesai</span></article></div></section>
    <p className="figma-notice">Data pribadi dan scan KTM tidak pernah ditampilkan terbuka.</p>
  </main></PublicShell>;
}

function FileField({ label, accept = '.pdf,application/pdf', required = false, maxSize = 5 * 1024 * 1024 }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  return <div><label className="figma-file-field"><span>{label}{required && ' *'}</span><small>{name || `Seret & lepas berkas di sini, atau Pilih berkas (maks. ${Math.round(maxSize / 1024 / 1024)} MB)`}</small><span className="figma-file-button">{name ? 'Ganti berkas' : 'Pilih dokumen tersimpan'}</span><input name={label} type="file" accept={accept} required={required} onChange={e=>{const file=e.target.files?.[0];const message=file&&file.size>maxSize?`Ukuran berkas maksimal ${Math.round(maxSize / 1024 / 1024)} MB.`:getUploadError(file);setError(message);setName(message?'':file?.name||'');if(message)e.target.value='';}}/></label>{error&&<small className="figma-warning" role="alert">{error}</small>}</div>;
}

function createTicketCode() {
  const bytes = new Uint8Array(5);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  const suffix = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `TKT-${new Date().getFullYear()}-${suffix}`;
}

function TicketReceipt({ ticket, student, nim, program }) {
  const copy = async () => { try { await navigator.clipboard.writeText(ticket); } catch { /* Clipboard API may be unavailable in local preview. */ } };
  return <section className="figma-receipt"><span className="figma-receipt-check">✓</span><h1>Permohonan terkirim</h1><p>Simpan kode tiket privat ini. Kode diperlukan untuk melacak status dan mengunduh berkas mahasiswa.</p><div className="figma-ticket-number"><small>Kode tiket privat</small><b>{ticket}</b><button onClick={copy} type="button">Salin</button></div><dl><dt>Prodi</dt><dd>{program}</dd><dt>Nama</dt><dd>{student}</dd><dt>NIM</dt><dd>{nim}</dd></dl><Status value="Menunggu respon admin prodi"/><div className="figma-actions"><Link className="button button-primary" to={`/layanan/P-04?ticket=${encodeURIComponent(ticket)}`}>Lacak status</Link><Link className="button button-secondary" to="/layanan/P-02">Ajukan permohonan lain</Link></div></section>;
}

function RequestLetter({ repair = false }) {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [summary, setSummary] = useState({});
  const oldTicket = new URLSearchParams(window.location.search).get('ticket') || '';
  const old = getDemoTicket(oldTicket);
  if (repair && (!oldTicket || old?.ticket !== oldTicket)) return <main className="figma-public-main"><Breadcrumb items={[{label:'Beranda',to:'/'},{label:'Lacak status',to:'/layanan/P-04'},{label:'Perbaiki'}]}/><section className="figma-receipt"><h1>Nomor tiket tidak ditemukan</h1><p>Masukkan nomor tiket yang valid sebelum memperbaiki permohonan.</p><Link className="button button-primary" to="/layanan/P-04">Cek ulang</Link></section></main>;
  if (receipt) return <main className="figma-public-main"><TicketReceipt {...receipt}/></main>;
  return <main className="figma-public-main"><Breadcrumb items={[{label:'Beranda',to:'/'},{label:'Permohonan Surat',to:'/layanan/P-02'},{label:repair?'Perbaiki':'Formulir Permohonan Surat'}]}/><div className="figma-content-width"><h1>{repair?'Perbaiki dan Ajukan Ulang':'Formulir Permohonan Surat'}</h1><p className="figma-muted">Surat untuk keperluan mahasiswa.</p>{repair&&<div className="figma-warning">Dikembalikan — alasan: {old?.returnReason||'periksa catatan permohonan'} · {oldTicket||'nomor tiket'}</div>}{summary.uploadError&&<div className="figma-warning" role="alert">{summary.uploadError}</div>}<form className="figma-form-with-summary" onChange={e=>{const data=new FormData(e.currentTarget);setSummary(Object.fromEntries([...data.entries()].filter(([key])=>key!=='Scan KTM (pratinjau privat)')));}} onSubmit={async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const now=new Date().toISOString();const record={...old,ticket:repair?(oldTicket||old?.ticket):createTicketCode(),student:fd.get('nama'),nim:fd.get('nim'),program:fd.get('program'),purpose:fd.get('purpose'),createdAt:repair?(old?.createdAt||now):now,status:'Menunggu respon admin prodi',returnReason:'',history:[...(old?.history||[]),{status:'Menunggu respon admin prodi',at:now,by:'Mahasiswa'}]};const ktm=fd.get('Scan KTM (pratinjau privat)');try{if(ktm instanceof File&&ktm.size){await savePrivateFile(record.ticket,'ktm',ktm);record.ktmFile=ktm.name;}saveDemoTicket(record);setReceipt(record);}catch(error){setSummary((current)=>({...current,uploadError:error.message||'Scan KTM tidak dapat disimpan.'}));}}}>
      <section className="figma-form-card"><div className="figma-form-grid"><label>Program studi<select name="program" required defaultValue={repair&&old?.program||''}><option value="" disabled>Isi di sini</option><option>Administrasi Bisnis</option><option>Manajemen Bisnis</option><option>MICE</option><option>Bahasa Inggris</option></select></label><label>Nama<input name="nama" required defaultValue={repair&&old?.student||''} placeholder="Isi di sini"/></label><label>NIM<input name="nim" required defaultValue={repair&&old?.nim||''} placeholder="Isi di sini"/></label><label className="figma-full">Peruntukan surat<textarea name="purpose" rows="3" required defaultValue={repair&&old?.purpose||''} placeholder="Isi di sini"/></label><div className="figma-full"><FileField label="Scan KTM (pratinjau privat)" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" maxSize={2 * 1024 * 1024} required/></div></div><div className="figma-form-actions"><Button type="submit">{repair?'Ajukan ulang':'Kirim permohonan'}</Button><button type="button" className="button button-secondary" onClick={()=>navigate(repair?'/layanan/P-04':'/')}>Batal</button></div></section>
      <aside className="figma-summary"><h2>Ringkasan sebelum kirim</h2><p>Prodi: {summary.program||old?.program||'—'}</p><p>Nama: {summary.nama||old?.student||'—'}</p><p>NIM: {summary.nim||old?.nim||'—'}</p><p>Peruntukan: {summary.purpose||old?.purpose||'—'}</p><small>KTM bersifat privat</small></aside>
    </form></div></main>;
}

function RequestStatus() {
  const initialTicket = new URLSearchParams(window.location.search).get('ticket') || '';
  const [ticket, setTicket] = useState(initialTicket);
  const [searched, setSearched] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const record = searched ? getDemoTicket(ticket) : null;
  const found = searched && Boolean(record);
  const stages=['Menunggu respon admin prodi','Diproses admin','TTD Kajur','Selesai'];const stageIndex=stages.indexOf(record?.status);
  return <main className="figma-public-main"><Breadcrumb items={[{label:'Beranda',to:'/'},{label:'Lacak status'}]}/><div className="figma-content-width"><h1>Lacak Status Permohonan</h1><form className="figma-track-form" onSubmit={e=>{e.preventDefault();setSearched(true);}}><input required value={ticket} onChange={e=>{setTicket(e.target.value);setSearched(false);}} placeholder="Nomor tiket"/><Button type="submit">Cek status</Button></form>{searched&&!found&&<div className="figma-empty-result">Nomor tiket tidak ditemukan. Periksa kembali.</div>}{found&&<section className="figma-track-result"><div className="figma-track-head"><div><small>KODE TIKET PRIVAT</small><b>{record.ticket}</b></div><Status value={record.status}/></div><h2>Permohonan surat</h2><p>{record.program} · {record.student} · {record.nim}</p><ol className="figma-status-line">{stages.map((label,index)=><li key={label} className={index<=stageIndex?'active':''}>{label}</li>)}</ol>{record.status==='Dikembalikan'&&<div className="figma-warning"><b>Dikembalikan — alasan pengembalian:</b> {record.returnReason||'—'}</div>}<div className="figma-track-actions">{record.status==='Dikembalikan'&&<Link className="button button-secondary" to={`/layanan/P-05?ticket=${encodeURIComponent(record.ticket)}`}>Perbaiki dan ajukan ulang</Link>}<button className="button button-secondary" disabled={!record.fileId} onClick={async()=>{try{const file=await getStudentFile(record.fileId);if(file)openStudentFile(file);else{const legacyFile=await getDemoDocument(record.fileId);openDemoDocument(legacyFile,true);}setDownloadError('');}catch(error){setDownloadError(error.message||'Surat tidak dapat diunduh.');}}}>Unduh surat (aktif bila selesai)</button></div>{downloadError&&<p className="figma-warning" role="alert">{downloadError}</p>}<h2>Riwayat status</h2><div className="figma-table-wrap"><table><thead><tr><th>Waktu</th><th>Perubahan status</th><th>Oleh</th></tr></thead><tbody>{(record.history||[]).map((entry,index)=><tr key={`${entry.status}-${index}`}><td>{new Date(entry.at).toLocaleString('id-ID')}</td><td>{entry.status}</td><td>{entry.by}</td></tr>)}</tbody></table></div></section>}</div></main>;
}

function StudentLookup({ screen }) {
  const [searched, setSearched] = useState(false);
  const [nim, setNim] = useState('');
  const isMarks = screen.code === 'P-07';
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');
  const [ticket, setTicket] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  if (screen.code === 'P-08') return <ReadinessForm/>;
  return <main className="figma-public-main"><Breadcrumb items={[{label:'Beranda',to:'/'},{label:screen.title}]}/><div className="figma-content-width"><h1>{isMarks?'Unduh Berkas Mahasiswa':screen.title}</h1><p className="figma-muted">Masukkan data mahasiswa dan kode tiket privat. Berkas hanya terbuka jika seluruh data cocok.</p><form className="figma-form-card" onSubmit={async e=>{e.preventDefault();setLoading(true);setSearched(false);setDownloadError('');try{setResults(await findStudentFiles({program,semester,nim,ticket}));setSearched(true);}catch(error){setDownloadError(error.message||'Penyimpanan berkas tidak dapat dibuka.');}finally{setLoading(false);}}}>{isMarks&&<div className="figma-form-grid"><label>Program studi<select required value={program} onChange={e=>setProgram(e.target.value)}><option value="">Pilih program studi</option>{['Administrasi Bisnis','Manajemen Bisnis','MICE','Bahasa Inggris'].map(x=><option key={x}>{x}</option>)}</select></label><label>Semester<select required value={semester} onChange={e=>setSemester(e.target.value)}><option value="">Pilih semester</option>{Array.from({length:8},(_,index)=>String(index+1)).map(x=><option key={x} value={x}>{x}</option>)}</select></label></div>}<div className="figma-track-form"><input required value={nim} onChange={e=>{setNim(e.target.value);setSearched(false);setResults([]);}} placeholder="Masukkan NIM"/><input required type="password" autoComplete="off" value={ticket} onChange={e=>{setTicket(e.target.value);setSearched(false);setResults([]);}} placeholder="Kode tiket privat"/><Button type="submit" disabled={loading}>{loading?'Mencari…':isMarks?'Cari berkas':'Cari'}</Button></div></form>{downloadError&&<div className="figma-warning" role="alert">{downloadError}</div>}{searched&&results.length===0&&<div className="figma-empty-result">Tidak ada berkas yang cocok dengan data dan kode tiket tersebut.</div>}{results.length>0&&<div className="figma-table-wrap"><table><thead><tr>{['Semester','Tahun ajaran','Berkas','Aksi'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{results.map(row=><tr key={row.id}><td>{row.semester||'—'}</td><td>{row.year||'—'}</td><td>{row.name}</td><td><button type="button" className="button button-primary" onClick={async()=>{try{openStudentFile(await getStudentFile(row.id));}catch(error){setDownloadError(error.message||'Berkas tidak dapat dibuka.');}}}>Unduh</button></td></tr>)}</tbody></table></div>}</div></main>;
}

function ReadinessForm() {
  const navigate = useNavigate();
  return <main className="figma-public-main"><Breadcrumb items={[{label:'Beranda',to:'/'},{label:'Kesiapan Sidang'}]}/><div className="figma-content-width"><h1>Pendaftaran Kesiapan Sidang</h1><p className="figma-muted">Keempat dokumen wajib diunggah.</p><form className="figma-readiness-form" onSubmit={e=>{e.preventDefault();localStorage.setItem('simniaga-demo-readiness','submitted');navigate('/layanan/P-09');}}><section className="figma-form-card"><div className="figma-form-grid"><label>Program studi<select required defaultValue=""><option value="" disabled>Isi di sini</option><option>Administrasi Bisnis</option><option>Manajemen Bisnis</option><option>MICE</option><option>Bahasa Inggris</option></select></label><label>Nama<input required placeholder="Isi di sini"/></label><label>NIM<input required placeholder="Isi di sini"/></label><div className="figma-full"><FileField required label="Scan cover ACC tugas akhir"/></div><div className="figma-full"><FileField required label="Scan kartu bimbingan"/></div><div className="figma-full"><FileField required label="Lembar persetujuan"/></div><div className="figma-full"><FileField required label="Bukti penyerahan laporan magang"/></div></div><div className="figma-form-actions"><Button type="submit">Daftar</Button><button type="button" className="button button-secondary" onClick={()=>navigate('/')}>Batal</button></div></section><aside className="figma-summary"><h2>Daftar periksa</h2>{['Cover ACC TA','Kartu bimbingan','Lembar persetujuan','Bukti laporan magang'].map(x=><label key={x}><input type="checkbox" disabled/> {x}</label>)}</aside></form></div></main>;
}

function ReadinessReceipt() {
  const submitted = localStorage.getItem('simniaga-demo-readiness') === 'submitted';
  return <main className="figma-public-main"><section className="figma-receipt"><span className="figma-receipt-check">✓</span><h1>{submitted?'Pendaftaran diterima':'Belum ada pendaftaran'}</h1><p>{submitted?'Mode demo: pendaftaran tersimpan pada perangkat ini.':'Lengkapi formulir kesiapan sidang untuk melanjutkan.'}</p><Link className="button button-primary" to={submitted?'/':'/layanan/P-08'}>{submitted?'Kembali ke beranda':'Isi formulir'}</Link></section></main>;
}

export function StudentService({ screen }) {
  useEffect(()=>{ window.scrollTo({top:0,behavior:'smooth'}); },[screen.code]);
  let content;
  if (screen.code==='P-02') content=<RequestLetter/>;
  else if (screen.code==='P-03') { const receipt=getDemoTicket(); content=<main className="figma-public-main">{receipt?<TicketReceipt {...receipt}/>:<section className="figma-receipt"><h1>Belum ada permohonan</h1><p>Ajukan permohonan untuk mendapatkan nomor tiket.</p><Link to="/layanan/P-02" className="button button-primary">Ajukan permohonan</Link></section>}</main>; }
  else if (screen.code==='P-04') content=<RequestStatus/>;
  else if (screen.code==='P-05') content=<RequestLetter repair/>;
  else if (screen.code==='P-09') content=<ReadinessReceipt/>;
  else content=<StudentLookup key={screen.code} screen={screen}/>;
  return <PublicShell>{content}</PublicShell>;
}
