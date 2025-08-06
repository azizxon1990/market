<script setup lang="ts">
import { availableLocales, loadLanguageAsync } from '~/modules/i18n'

const { t, locale } = useI18n()

async function toggleLocales() {
  // cycle through the available locales
  const locales = availableLocales
  const currentIndex = locales.indexOf(locale.value)
  const nextIndex = (currentIndex + 1) % locales.length
  const nextLang = locales[nextIndex]

  await loadLanguageAsync(nextLang)

  // Save language preference
  localStorage.setItem('preferred-language', nextLang)
}

function getLanguageDisplayName(lang: string) {
  const names: Record<string, string> = {
    uz: 'O\'zbekcha',
    ru: 'Русский',
  }
  return names[lang] || lang
}
</script>

<template>
  <button
    class="icon-btn !outline-none"
    :title="t('button.toggle_langs')"
    @click="toggleLocales()"
  >
    <div class="flex items-center gap-1">
      <div i-carbon-language text-lg />
      <span class="text-sm font-medium">{{ getLanguageDisplayName(locale) }}</span>
    </div>
  </button>
</template>
