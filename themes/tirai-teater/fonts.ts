import { Great_Vibes, Playfair_Display, Raleway } from "next/font/google";

export const display = Playfair_Display({ variable: "--font-inv-display", subsets: ["latin"], weight: ["400", "600", "700"] });
export const body = Raleway({ variable: "--font-inv-body", subsets: ["latin"], weight: ["300", "400", "600"] });
export const script = Great_Vibes({ variable: "--font-inv-script", subsets: ["latin"], weight: "400" });
