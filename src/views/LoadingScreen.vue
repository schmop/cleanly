<template>
  <ion-page>
    <ion-content>
      <ion-loading
        :css-class="'no-background'"
        spinner="circular"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonLoading, IonPage } from "@ionic/vue";</script>

<style>
.no-background > .loading-wrapper {
    background: none;
    box-shadow: none;
}
</style>
