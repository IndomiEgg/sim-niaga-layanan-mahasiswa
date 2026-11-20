import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

const dataOf = (response) => response?.data?.data ?? response?.data ?? response;
const codePath = (code) => encodeURIComponent(String(code || '').trim());

export function getApiError(error) {
  const response = error?.response?.data;
  const validationMessage = response?.errors && Object.values(response.errors).flat()[0];
  return validationMessage || response?.message || error?.message || 'Server tidak dapat dihubungi. Coba lagi nanti.';
}

export async function getPrograms() {
  return dataOf(await apiClient.get('/referensi/prodi', { params: { jurusan_an_saja: true } }));
}

export async function getPublicServices() {
  return dataOf(await apiClient.get('/publik/layanan'));
}

export async function getPublicServiceForm(code) {
  return dataOf(await apiClient.get(`/publik/layanan/${codePath(code)}/form`));
}

export async function submitLetterRequest(formData) {
  return dataOf(await apiClient.post('/publik/permohonan-surat', formData));
}

export async function getTracking(code) {
  return dataOf(await apiClient.get(`/publik/lacak/${codePath(code)}`));
}

export async function resubmitRequest(code, formData) {
  return dataOf(await apiClient.post(`/publik/lacak/${codePath(code)}/ajukan-ulang`, formData));
}

export async function getTrackingDownloadUrl(code) {
  const data = dataOf(await apiClient.get(`/publik/lacak/${codePath(code)}/unduh`));
  return data?.url;
}

// The ticket check is a frontend requirement and is an explicit extension to the API contract.
export async function requestStudentAccess(nim, ticketCode) {
  return dataOf(await apiClient.post('/publik/akses-mahasiswa', {
    nim: String(nim || '').trim(),
    kode_pelacakan: String(ticketCode || '').trim(),
  }));
}

export async function verifyStudentOtp(nim, otp) {
  return dataOf(await apiClient.post('/publik/akses-mahasiswa/verifikasi', {
    nim: String(nim || '').trim(),
    otp: String(otp || '').trim(),
  }));
}

export async function getStudentDocuments(kind, accessToken) {
  const endpoint = kind === 'marksheet'
    ? '/publik/mahasiswa/marksheet'
    : '/publik/mahasiswa/surat-peringatan';
  return dataOf(await apiClient.get(endpoint, { headers: { 'X-Akses-Mahasiswa': accessToken } }));
}

export async function getStudentDocumentUrl(id, accessToken) {
  const data = dataOf(await apiClient.get(`/publik/mahasiswa/dokumen/${encodeURIComponent(id)}/unduh`, {
    headers: { 'X-Akses-Mahasiswa': accessToken },
  }));
  return data?.url;
}

export async function submitReadinessApplication(formData) {
  return dataOf(await apiClient.post('/publik/pendaftaran-sidang', formData));
}

export async function submitCustomService(code, formData) {
  return dataOf(await apiClient.post(`/publik/layanan/${codePath(code)}/pengajuan`, formData));
}
