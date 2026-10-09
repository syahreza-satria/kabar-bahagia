import { Libre_Baskerville, Pinyon_Script, Source_Sans_3 } from "next/font/google";

export const display = Libre_Baskerville({
  variable: "--font-inv-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});
export const body = Source_Sans_3({ variable: "--font-inv-body", subsets: ["latin"], weight: ["300", "400", "600"] });
export const script = Pinyon_Script({ variable: "--font-inv-script", subsets: ["latin"], weight: "400" });
