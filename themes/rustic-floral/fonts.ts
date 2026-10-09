import { Dancing_Script, Lato, Playfair_Display } from "next/font/google";

export const display = Playfair_Display({
  variable: "--font-inv-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
export const body = Lato({ variable: "--font-inv-body", subsets: ["latin"], weight: ["300", "400", "700"] });
export const script = Dancing_Script({ variable: "--font-inv-script", subsets: ["latin"], weight: ["500", "700"] });
