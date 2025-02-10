const fs = require("fs");
const path = require("path");

// Carica la configurazione
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/config.json"), "utf8"));

// Percorsi dei file JSON presi dalla configurazione
const recipesPath = path.join(__dirname, config.paths.recipesFile);
const historyPath = path.join(__dirname, config.paths.historyFile);

/**
 * Carica le ricette dal file JSON
 * @returns {Array} Array di ricette
 */
function loadRecipes() {
  try {
    const data = fs.readFileSync(recipesPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Errore nel caricamento delle ricette:", error);
    return [];
  }
}

/**
 * Carica la cronologia dal file JSON
 * @returns {Array} Cronologia dei menù
 */
function loadHistory() {
  try {
    const data = fs.readFileSync(historyPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Errore nel caricamento della cronologia:", error);
    return [];
  }
}

/**
 * Aggiorna la cronologia con un nuovo menù
 * @param {Object} menu Menù da salvare nella cronologia
 */
function updateHistory(menu) {
  try {
    const history = loadHistory();
    history.push(menu);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8");
  } catch (error) {
    console.error("Errore nell'aggiornamento della cronologia:", error);
  }
}

module.exports = {
  loadRecipes,
  loadHistory,
  updateHistory,
};
