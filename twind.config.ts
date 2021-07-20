import { Configuration } from "twind";

export default {
  theme: {
    extend: {
      fontFamily: {
        pro: "GT Walsheim Pro",
        sans: "Inter",
      },
      spacing: {
        "108": "27rem",
        "120": "30rem",
        "132": "33rem",
        "144": "36rem",
      },
      fontSize: {
        md: "1rem",
        xxs: "0.5rem",
      },
      minWidth: (theme) => theme("spacing"),
      minHeight: (theme) => theme("spacing"),
      maxHeight: (theme) => theme("spacing"),
      maxWidth: (theme) => theme("spacing"),
    },
  },
} as Configuration;
