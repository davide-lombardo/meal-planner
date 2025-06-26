import '@testing-library/jest-dom';

// Mock window.matchMedia for MUI and Joy UI compatibility in Vitest/jsdom
declare global {
  interface Window {
    matchMedia?: any;
  }
}

if (!window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
      media: '',
    } as any;
  };
}
