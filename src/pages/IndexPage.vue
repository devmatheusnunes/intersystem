<template>
  <q-page class="home-page">
    <img src="~assets/intersystem_full.svg" alt="InterSystem" class="home-logo" />
  </q-page>
</template>

<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 24px;
}

.home-logo {
  width: clamp(180px, 35vw, 480px);
  max-width: 100%;
  height: auto;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

@media (max-width: 600px) {
  .home-logo {
    width: clamp(160px, 70vw, 300px);
  }
}

@media (min-width: 1920px) {
  .home-logo {
    width: 520px;
  }
}
</style>
