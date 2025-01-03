module.exports = {
  content: [
    "./*/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      "MorganStanley_Light": {
        "color-scheme": "light",
        "primary": "#002B59", /* Brandbar -> brandingbar's background-color */
        "accent": "#00e980", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "#ffffff", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#E5E6E6", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#2B3440", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#068c9a", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "oklch(100% 0 0)", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-200": "#F2F2F2",
        "base-content": "#1f2937",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      "MorganStanley_Dark": {
        "color-scheme": "light",
        "primary": "#001232", /* Brandbar -> brandingbar's background-color */
        "accent": "#00e980", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#0b090a", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "#212529", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#cfdbd5", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#f5cb5c", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#161a1d", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-200": "#F2F2F2",
        "base-content": "#ccc5b9",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Luminara: {
        "color-scheme": "light",
        "primary": "oklch(49.12% 0.3096 275.75)", /* Brandbar -> brandingbar's background-color */
        "accent": "#00ff03", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#E5E6E6", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#a200ff", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "oklch(49.12% 0.3096 275.75)",
        "secondary": "oklch(69.71% 0.329 342.55)", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "oklch(100% 0 0)", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-200": "#F2F2F2",
        "base-content": "#1f2937",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Nebula: {
        "color-scheme": "dark",
        "primary": "#14191f", /* Brandbar -> brandingbar's background-color */
        "accent": "#00ffd5", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#15191e", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "#1d232a", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#48e5c2", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#ffda22", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#1c2529", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-200": "#191e24",
        "base-content": "#A6ADBB",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Clay: {
        "color-scheme": "light",
        "primary": "darkslategrey", /* Brandbar -> brandingbar's background-color */
        "accent": "tomato", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#291334", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "darkslategrey",
        "secondary": "#ef5923", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#faf7f5", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-200": "#efeae6",
        "base-content": "#291334",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Lagoon: {
        "color-scheme": "light",
        "primary": "#216d9c", /* Brandbar -> brandingbar's background-color */
        "accent": "orange", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#1a1a1a", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "#216d9c",
        "secondary": "#E8488A", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "oklch(100% 0 0)", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Fantasy: {
        "color-scheme": "light",
        "primary": "oklch(37.45% 0.189 325.02)", /* Brandbar -> brandingbar's background-color */
        "accent": "oklch(75.98% 0.204 56.72)", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#1f2937", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "oklch(53.92% 0.162 241.36)", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "oklch(100% 0 0)", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-content": "#1f2937",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Forest: {
        "color-scheme": "dark",
        "primary": "#1eb854", /* Brandbar -> brandingbar's background-color */
        "accent": "#19362d", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "black", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "#000000", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#adabcd", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#1DB88E", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#171212", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Blush: {
        "color-scheme": "light",
        "primary": "oklch(62.45% 0.278 3.8363600743192197)", /* Brandbar -> brandingbar's background-color */
        "accent": "#fdc500", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "#fff", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#291E00", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#8E4162", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#e9e7e7", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-content": "#100f0f",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Inferno: {
        "color-scheme": "dark",
        "primary": "oklch(77.48% 0.204 60.62)", /* Brandbar -> brandingbar's background-color */
        "accent": "#9d0208", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "oklch(98.71% 0.0106 342.55)", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "black", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "#131616", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#e9c46a", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#2a9d8f", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#212121", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "accent-content": "#000000",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Harbor: {
        "color-scheme": "light",
        "primary": "#8C0327", /* Brandbar -> brandingbar's background-color */
        "accent": "#D59B6A", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "#cfb68c", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#826A5C", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#D85251", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#f1f1f1", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Lemonade: {
        "color-scheme": "light",
        "primary": "oklch(58.92% 0.199 134.6)", /* Brandbar -> brandingbar's background-color */
        "accent": "orange", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "#f4e285", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "ghostwhite", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#132a13", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#55a630", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "oklch(98.71% 0.02 123.72)", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
      Coffee: {
        "color-scheme": "dark",
        "primary": "#DB924B", /* Brandbar -> brandingbar's background-color */
        "accent": "#10576D", /* Brandbar -> Expand and Collapse and Theme selector icon's fill color in the brandingbar */
        "secondary-content": "#5a1807", /* Brandingbar -> Application name text color in the brandingbar */
        "base-300": "#e7e2df", /* Brandingbar -> Theme selector's popup background color */
        "primary-content": "#ede0d4", /* SMT:LS&RS -> Left & Right Sidenav's background color */
        "neutral": "#120C12", /* SMT:LS -> Left sidenav's text color and icon's fill color */
        "neutral-content": "red",
        "secondary": "#263E3F", /* SMT:LS & Brandingbar: Theme -> Parent Menu Item's text color and icon fill color and Theme selector's selected theme text color*/
        "base-100": "#20161F", /* SMT:M -> Not explictly being used but this is the background color of the main workspace */
        "base-content": "#c59f60",
        "info": "#B48EAD",
        "success": "#A3BE8C",
        "warning": "#EBCB8B",
        "error": "#BF616A",
        "--rounded-box": "0.4rem",
        "--rounded-btn": "0.2rem",
        "--rounded-badge": "0.4rem",
        "--tab-radius": "0.2rem",
      },
    }],
  },
}
