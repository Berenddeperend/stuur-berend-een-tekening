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
  modules: [
    "@nuxt/image",
    //"@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
  ],
  runtimeConfig: {
    printerPassword: process.env.PRINTER_PASSWORD,
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
