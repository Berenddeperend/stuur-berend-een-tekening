// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap",
        },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
      ],
    },
  },
  modules: ["@nuxt/image", "@nuxtjs/i18n", "@nuxtjs/tailwindcss", "@vueuse/nuxt"],

  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "nl",
    locales: [
      { code: "nl", language: "nl-NL", name: "Nederlands", file: "nl.json" },
      { code: "en", language: "en-GB", name: "English", file: "en.json" },
    ],
    // The module's default here is an *enabled* auto-redirect based on the
    // browser's language — Dutch is the canonical site, English is opt-in
    // via the switcher only, so this has to be explicit.
    detectBrowserLanguage: false,
    // Exclude /admin from English via config rather than the defineI18nRoute(false)
    // macro: the macro leaves the route's internal name unsuffixed ("admin"
    // instead of "admin___nl"), which the module's global navigation guard
    // doesn't recognize as "already localized" — it then tries to rewrite every
    // click into /admin to a nonexistent "admin___nl" route and silently fails
    // to navigate at all. Disabling just the "en" variant here keeps /admin
    // registered normally (as admin___nl) so that guard leaves it alone, while
    // still generating no /en/admin route.
    customRoutes: "config",
    pages: {
      admin: { en: false },
    },
  },

  runtimeConfig: {
    printerPassword: process.env.PRINTER_PASSWORD,
    adminPassword: "",
  },

  nitro: {
    storage: {
      uploads: {
        driver: "fs",
        base: "./public/photos",
      },
    },
  },
});
