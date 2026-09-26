<template>
  <div>
    <NuxtPage />
  </div>
</template>
<script setup lang="ts">
// The i18n module only writes htmlAttrs.lang itself under
// `experimental.strictSeo`, which also pulls in hreflang/canonical/og tags and
// requires a configured `baseUrl` — more than this site needs.
const { locale } = useI18n();
useHead({ htmlAttrs: { lang: locale } });
</script>

<style>
html {
  color: #b3b3de;
  background: #222250;
  font-size: 17px;
  font-family: "Poppins", sans-serif;
  line-height: 1.6;
}

body {
  margin-bottom: 40px;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: #e8e6e3;
}

a,
strong {
  color: #e2bc4e;
}

a {
  text-underline-offset: 1px;
  text-decoration-thickness: 1px;
  text-decoration-color: rgba(226, 188, 78, 0);
  transition: text-decoration-color 0.2s;
}

p a,
li a {
  text-decoration: underline;
}

a:hover,
a:active,
a:focus {
  text-decoration-color: #e2bc4e;
}

hr {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 40px 0;
}
</style>
