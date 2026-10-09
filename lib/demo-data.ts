import { CONTENT_SCHEMA, defaultSectionConfig, type InvitationData } from "@/types/invitation";
import { DEMO_SLUG } from "./demo";

/** Data contoh untuk halaman demo / pratinjau tema (tidak menyentuh database). */
export function demoInvitation(themeId: string): InvitationData {
  const config = defaultSectionConfig().map((s) => (s.code === "lovestory" ? { ...s, enabled: true } : s));
  return {
    id: "demo",
    slug: DEMO_SLUG,
    themeId,
    status: "draft",
    primaryColor: null,
    musicUrl: null,
    ogImageUrl: null,
    expiresAt: null,
    sectionConfig: config,
    content: CONTENT_SCHEMA.parse({
      coverImageUrl: "/demo/cover.svg",
      groom: {
        nickname: "Dimas",
        fullName: "Dimas Aditya Pratama, S.T.",
        parents: "Putra dari Bapak Hendra Pratama\n& Ibu Sari Wulandari",
        instagram: "@dimas.demo",
        photoUrl: "/demo/groom.svg",
      },
      bride: {
        nickname: "Rina",
        fullName: "Rina Maharani, S.Ds.",
        parents: "Putri dari Bapak Agus Santoso\n& Ibu Lestari Dewi",
        instagram: "@rina.demo",
        photoUrl: "/demo/bride.svg",
      },
      opening: {
        greeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
        text: "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.",
        quote:
          "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.",
        quoteSource: "QS. Ar-Rum: 21",
      },
      closing: {
        message:
          "Merupakan kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
        family: "Keluarga Besar Bapak Hendra Pratama\n& Keluarga Besar Bapak Agus Santoso",
      },
      loveStory: [
        {
          date: "Maret 2019",
          title: "Pertama Bertemu",
          text: "Kami bertemu di sebuah acara kampus dan langsung akrab lewat obrolan tentang kopi.",
        },
        {
          date: "Agustus 2022",
          title: "Lamaran",
          text: "Dimas datang bersama keluarga dan membawa cincin yang kini menjadi pengikat janji kami.",
        },
        {
          date: "Maret 2027",
          title: "Hari Bahagia",
          text: "Kami memulai perjalanan baru sebagai sepasang suami istri.",
        },
      ],
      youtubeUrl: "",
      liveStreamUrl: "",
    }),
    events: [
      {
        id: "e1",
        name: "Akad Nikah",
        startsAt: "2027-03-20T02:00:00.000Z",
        endsAt: "2027-03-20T04:00:00.000Z",
        timezone: "WIB",
        venue: "Masjid Al-Ikhlas",
        address: "Jl. Melati No. 12, Jakarta Selatan",
        mapsUrl: "https://maps.google.com",
      },
      {
        id: "e2",
        name: "Resepsi",
        startsAt: "2027-03-20T05:00:00.000Z",
        endsAt: "2027-03-20T08:00:00.000Z",
        timezone: "WIB",
        venue: "Gedung Serbaguna Harmoni",
        address: "Jl. Kenanga Raya No. 3, Jakarta Selatan",
        mapsUrl: "https://maps.google.com",
      },
    ],
    media: [1, 2, 3, 4, 5, 6].map((i) => ({
      id: `m${i}`,
      type: "foto" as const,
      url: `/demo/g${i}.svg`,
      order: i,
      section: "galeri",
    })),
    gifts: [
      { id: "g1", type: "bank", bankName: "BCA", number: "1234567890", accountName: "Dimas Aditya Pratama", qrUrl: "" },
      { id: "g2", type: "ewallet", bankName: "GoPay", number: "081234567890", accountName: "Rina Maharani", qrUrl: "" },
      {
        id: "g3",
        type: "alamat",
        bankName: "",
        number: "Jl. Melati No. 12, Jakarta Selatan 12345",
        accountName: "Keluarga Rina",
        qrUrl: "",
      },
    ],
  };
}
