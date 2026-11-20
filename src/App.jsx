import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { PublicHome, StudentService } from './pages/mahasiswa/PublicPages';

const publicScreens = [
  ['P-01', 'Beranda layanan'], ['P-02', 'Formulir permohonan surat'], ['P-03', 'Nomor tiket'],
  ['P-04', 'Lacak status'], ['P-05', 'Perbaiki dan ajukan ulang'], ['P-06', 'Surat peringatan'],
  ['P-07', 'Unduh Berkas Mahasiswa'], ['P-08', 'Kesiapan sidang'], ['P-09', 'Konfirmasi sidang'],
].map(([code, title]) => ({ code, title }));

function ServiceRoute() {
  const { screenCode } = useParams();
  const screen = publicScreens.find((item) => item.code.toLowerCase() === (screenCode || '').toLowerCase()) || publicScreens[0];
  return screen.code === 'P-01' ? <PublicHome /> : <StudentService screen={screen} />;
}

function AppRoutes() {
  return <Routes><Route path="/" element={<PublicHome />} /><Route path="/layanan" element={<Navigate to="/" replace />} /><Route path="/layanan/:screenCode" element={<ServiceRoute />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}

export default function App() { return <BrowserRouter><AppRoutes /></BrowserRouter>; }
