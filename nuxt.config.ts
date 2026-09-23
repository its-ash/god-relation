// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  app: {
    baseURL: '/relation/',
    head: {
      title: 'Devajāla — Hindu Mythology Relations',
      meta: [
        { name: 'description', content: 'An interactive graph of Hindu mythology — deities, avatars, sages and their relations, explored like a Neo4j browser.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: 'favicon.svg' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  typescript: { strict: true }
})
