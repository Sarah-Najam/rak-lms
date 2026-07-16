// Formats ISO date to "May 18, 2026" style
export function formatCertDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

// RAK-CERT-2026-00142 style numbering
export function buildCertificateNo(year, sequence) {
  return `RAK-CERT-${year}-${String(sequence).padStart(5, '0')}`;
}

// Safe PDF filename
export function safeFileName(learnerName, courseTitle) {
  return `${learnerName} - ${courseTitle}`
    .replace(/[\\/:*?"<>|]/g, '')
    .trim() + '.pdf';
}