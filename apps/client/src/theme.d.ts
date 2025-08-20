import '@mui/joy/styles';

// Augment Joy UI theme to add custom category palette

declare module '@mui/joy/styles' {
  interface Palette {
    category: {
      pesce: string;
      carne: string;
      formaggio: string;
      uova: string;
      legumi: string;
    };
  }
}
