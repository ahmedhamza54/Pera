/**
 * Polyfill for URL.canParse to fix compatibility issues with older Node.js versions
 * This ensures URL.canParse is available in all contexts
 */

// Polyfill for URL.canParse if it doesn't exist
if (typeof URL !== 'undefined' && !URL.canParse) {
  URL.canParse = function(url: string | URL, base?: string): boolean {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

// Also polyfill for global scope if needed
if (typeof global !== 'undefined' && typeof global.URL !== 'undefined' && !global.URL.canParse) {
  global.URL.canParse = function(url: string | URL, base?: string): boolean {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

export {};