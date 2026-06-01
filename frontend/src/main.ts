import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#080c10',
          surface: '#0d1117',
          primary: '#00e5ff',
          secondary: '#ff3d71',
          accent: '#ffd740',
          success: '#00e676',
          warning: '#ffab40',
          error: '#ff5252',
          info: '#40c4ff',
          'on-background': '#e0f7fa',
          'on-surface': '#b0bec5',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      variant: 'elevated',
    },
    VCard: {
      elevation: 0,
    },
  },
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')
