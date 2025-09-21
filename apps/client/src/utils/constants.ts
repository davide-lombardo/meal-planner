export const CONFIG = {
  API_BASE_URL: "http://localhost:4000/api",
} as const;

export const daysOfWeek = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export const AREA_TO_COUNTRY: Record<string, string> = {
  American: "US",
  British: "GB",
  Canadian: "CA",
  Chinese: "CN",
  Croatian: "HR",
  Dutch: "NL",
  Egyptian: "EG",
  French: "FR",
  Greek: "GR",
  Indian: "IN",
  Irish: "IE",
  Italian: "IT",
  Jamaican: "JM",
  Japanese: "JP",
  Kenyan: "KE",
  Malaysian: "MY",
  Mexican: "MX",
  Moroccan: "MA",
  Polish: "PL",
  Portuguese: "PT",
  Russian: "RU",
  Spanish: "ES",
  Thai: "TH",
  Tunisian: "TN",
  Turkish: "TR",
  Vietnamese: "VN",
};
