import { Cormorant_Garamond, Jost } from "next/font/google";

export const display = Cormorant_Garamond({
  variable: "--font-inv-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const body = Jost({
  variable: "--font-inv-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});
