export const FONT_SERVICE_ORIGIN = "https://fonts.tylerbutler.com";
export const FONT_SITE = "tylerbutler.com";

export const FONT_FAMILIES = [
  {
    id: "pragmata-pro",
    version: "0.902",
    faces: [
      { id: "regular", fileName: "PragmataPro_Mono_R_liga_0902.woff2" },
      { id: "bold", fileName: "PragmataPro_Mono_B_liga_0902.woff2" },
      { id: "italic", fileName: "PragmataPro_Mono_I_liga_0902.woff2" },
      { id: "bold-italic", fileName: "PragmataPro_Mono_Z_liga_0902.woff2" },
    ],
  },
  {
    id: "idlewild",
    version: "1.401",
    faces: [
      { id: "light", fileName: "idlewild/1.401/light.woff2" },
      { id: "book", fileName: "idlewild/1.401/book.woff2" },
      { id: "medium", fileName: "idlewild/1.401/medium.woff2" },
      { id: "bold", fileName: "idlewild/1.401/bold.woff2" },
    ],
  },
] as const;
