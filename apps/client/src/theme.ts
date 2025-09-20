declare module '@mui/joy/styles' {
  interface PalettePrimary {
    contrastText: string;
    softBg: string;
    softColor: string;
    softHoverBg: string;
    solidHoverBg: string;
  }
  
  interface Palette {
    category: {
      pesce: string;
      carne: string;
      formaggio: string;
      uova: string;
      legumi: string;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}

export const lightTheme = {
  background: {
    body: "#f7f7f7",
    level1: "#fff",
    level2: "#f0f0f0",
  },
  text: {
    primary: "#181c1f",
    secondary: "#666",
  },
  primary: {
    100: "#e8f5e9",
    200: "#a5d6a7",
    500: "#43a047",
    700: "#388e3c",
    900: "#1b5e20",
    plainColor: "#43a047",
    contrastText: "#fff",
    softBg: "#e8f5e9",
    softColor: "#388e3c",
    softHoverBg: "#c8e6c9",
    solidHoverBg: "#388e3c",
  },
  divider: "#e0e0e0",
  category: {
    pesce: "#87CEEB",
    carne: "#FA8072",
    formaggio: "#DAA520",
    uova: "#228B22",
    legumi: "#8B5CF6",
  },
  shadow: {
    sm: "0 1px 4px rgba(0,0,0,0.06)",
    md: "0 2px 8px rgba(0,0,0,0.10)",
    lg: "0 4px 16px rgba(0,0,0,0.12)",
  },
};

export const darkTheme = {
  background: {
    body: "#181c1f",
    level1: "#23272a",
    level2: "#23272a",
  },
  text: {
    primary: "#fff",
    secondary: "#aaa",
  },
  primary: {
    100: "#e0dfff",   
    200: "#b3b0ff",  
    500: "#6C63FF",  
    700: "#554fd1",  
    900: "#39337a", 
    plainColor: "#6C63FF",
    contrastText: "#fff",
    softBg: "#39337a",
    softColor: "#b3b0ff",
    softHoverBg: "#554fd1",
    solidHoverBg: "#554fd1",
  },
  divider: "#333",
  category: {
    pesce: "#87CEEB",
    carne: "#FA8072",
    formaggio: "#DAA520",
    uova: "#228B22",
    legumi: "#8B5CF6",
  },
  shadow: {
    sm: "0 1px 4px rgba(0,0,0,0.06)",
    md: "0 2px 8px rgba(0,0,0,0.10)",
    lg: "0 4px 16px rgba(0,0,0,0.12)",
  },
};