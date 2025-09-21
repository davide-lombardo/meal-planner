import { Menu } from "shared/schemas";
import { daysOfWeek } from "./constants";

export function formatMenu(menu: any): string {
  if (!menu || !Array.isArray(menu.pranzo) || !Array.isArray(menu.cena)) {
    return "Menù non disponibile";
  }
  let formattedMenu = "";
  for (let i = 0; i < 7; i++) {
    formattedMenu += `${daysOfWeek[i]}:\n`;
    formattedMenu += `  Pranzo: ${menu.pranzo[i]?.nome || "Non disponibile"}\n`;
    formattedMenu += `  Cena: ${menu.cena[i]?.nome || "Non disponibile"}\n\n`;
  }
  return formattedMenu;
}
