// Aman dipakai di client component (tanpa modul Node).
export function waLink(phone: string, message: string) {
  const text = encodeURIComponent(message);
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

export const DEFAULT_WA_TEMPLATE =
  "Kepada Yth. {nama},\n\nDengan segala hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami. Detail acara dapat dilihat pada undangan digital berikut:\n\n{link}\n\nMerupakan suatu kehormatan apabila Anda berkenan hadir. Terima kasih.";

export function renderTemplate(template: string, vars: { nama: string; link: string }) {
  return template.replaceAll("{nama}", vars.nama).replaceAll("{link}", vars.link);
}
