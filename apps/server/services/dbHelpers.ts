import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { QueryExecResult } from "sql.js";
import {
  type Recipe,
  type Menu,
  type Config,
  type MenuOptions,
} from "shared/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDb() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, "../data.db");
  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return { db, dbPath };
}

export function parseRecipes(result: QueryExecResult[]): Recipe[] {
  if (!result.length) return [];
  const columns = result[0].columns;
  return result[0].values.map((row: unknown[]) => {
    const obj: Partial<Recipe> = {};
    columns.forEach((col: string, idx: number) => {
      if (col === "ingredienti" || col === "stagioni") {
        obj[col as keyof Recipe] = row[idx]
          ? JSON.parse(row[idx] as string)
          : [];
      } else if (col === "link") {
        obj[col as keyof Recipe] =
          typeof row[idx] === "string"
            ? (row[idx] as any)
            : row[idx] == null
            ? undefined
            : (String(row[idx]) as any);
      } else {
        obj[col as keyof Recipe] = row[idx] as any;
      }
    });
    return obj as Recipe;
  });
}

export function parseHistory(result: QueryExecResult[]): Menu[] {
  if (!result.length) return [];
  const columns = result[0].columns;
  return result[0].values.map((row: unknown[]) => {
    const menuIdx = columns.indexOf("menu");
    const createdIdx = columns.indexOf("created_at");
    if (menuIdx === -1) return { pranzo: [], cena: [] };
    const menuStr = row[menuIdx] as string;
    const createdAt = createdIdx !== -1 ? row[createdIdx] : undefined;
    try {
      const parsedMenu = JSON.parse(menuStr);
      return {
        pranzo: Array.isArray(parsedMenu.pranzo) ? parsedMenu.pranzo : [],
        cena: Array.isArray(parsedMenu.cena) ? parsedMenu.cena : [],
        created_at: createdAt,
      };
    } catch {
      return { pranzo: [], cena: [], created_at: createdAt };
    }
  });
}

export function parseConfig(result: QueryExecResult[]): Config {
  let config: Config = { menuOptions: {} as MenuOptions };
  if (result.length > 0 && result[0].values.length > 0) {
    const menuOptionsValue = result[0].values[0][0];
    config.menuOptions =
      typeof menuOptionsValue === "string"
        ? (JSON.parse(menuOptionsValue) as MenuOptions)
        : ({} as MenuOptions);
  }
  return config;
}
