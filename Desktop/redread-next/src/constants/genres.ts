export interface Genre {
  name: string;
  color: string;
}

export const GENRES: Genre[] = [
  { name: "Romantizm", color: "#FF6B9D" },
  { name: "Gotik", color: "#9B59B6" },
  { name: "Dram", color: "#E74C3C" },
  { name: "Gizem", color: "#4A90D9" },
  { name: "Fantastik", color: "#27AE60" },
  { name: "Psikolojik", color: "#8E44AD" },
  { name: "Gerilim", color: "#C0392B" },
  { name: "Macera", color: "#F39C12" },
];

export const GENRE_NAMES = GENRES.map((g) => g.name);
