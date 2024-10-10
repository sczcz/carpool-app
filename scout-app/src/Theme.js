// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    brand: {
      50: '#E6E6DD', // Lightest
      100: '#FFFFFF', // White
      200: '#8FB2CE', // Light blueish
      300: '#f7f7f7', // Grayish blue
      400: '#2AA8E4', // Primary blue
      500: '#043A63', // Darkest blue
      600: '#2C3E50', // Optional dark greyish blue (fallback)
    },
    neutral: {
      black: '#000000',
      white: '#FFFFFF',
      gray: '#A0AEC0',
      darkGray: '#718096',
      lightGray: '#E2E8F0',
    },
  },
  styles: {
    global: {
      "body": {
        bg: 'brand.100', // Background color
        color: 'brand.500', // Text color
      },
    },
  },
});

export default customTheme;
