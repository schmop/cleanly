<template>
  <ion-page>
    <ion-content>
      <ion-card class="cash-disbursements">
        <div class="row padding">
          <div class="third">
            <ion-card-title>Zwiebeln</ion-card-title>
            <ion-card-subtitle>Leonie zahlte 2€</ion-card-subtitle>
          </div>
          <div class="third align-center">
            <ion-card-title><ion-text color="danger">-1,00€</ion-text></ion-card-title>
            <ion-card-subtitle>schuldest du</ion-card-subtitle>
          </div>
          <div class="third align-right">
            <ion-card-title>&nbsp;</ion-card-title>
            <ion-card-subtitle>29.09.1996</ion-card-subtitle>
          </div>
        </div>
      </ion-card>
      <ion-card class="cash-taking">
        <div class="row padding">
          <div class="third">
            <ion-card-title>Vinylplatten vom ehemaligen Drummer der Beatles</ion-card-title>
            <ion-card-subtitle>Du zahltest 50€</ion-card-subtitle>
          </div>
          <div class="third align-center">
            <ion-card-title><ion-text color="success">+25,00€</ion-text></ion-card-title>
            <ion-card-subtitle>steht dir zu</ion-card-subtitle>
          </div>
          <div class="third align-right">
            <ion-card-title>&nbsp;</ion-card-title>
            <ion-card-subtitle>28.02.2008</ion-card-subtitle>
          </div>
        </div>
      </ion-card>
      <ion-card class="cash-taking">
        <div class="row padding">
          <div class="third">
            <ion-card-title>Vinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der BeatlesVinylplatten vom ehemaligen Drummer der Beatles</ion-card-title>
            <ion-card-subtitle>Du zahltest 50€</ion-card-subtitle>
          </div>
          <div class="third align-center">
            <ion-card-title><ion-text color="success">+25,00€</ion-text></ion-card-title>
            <ion-card-subtitle>steht dir zu</ion-card-subtitle>
          </div>
          <div class="third align-right">
            <ion-card-title>&nbsp;</ion-card-title>
            <ion-card-subtitle>28.02.2008</ion-card-subtitle>
          </div>
        </div>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonCard, IonCardSubtitle, IonCardTitle, IonContent, IonPage, IonText } from "@ionic/vue";
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px; /* Space between cards */
}
.third {
  width: calc(33% - 16px);
}
.two-third {
  width: calc(66% - 8px);
}
.align-right {
  text-align: right;
}
.align-center {
  text-align: center;
}
.padding {
  padding: 16px;
}
.cash-disbursements {
  --background: rgb(237, 187, 187);
  @media (prefers-color-scheme: dark) {
    --background: rgb(38, 13, 13);
  }
}
.cash-taking {
  --background: rgb(191, 232, 191);
  @media (prefers-color-scheme: dark) {
    --background: rgb(13, 38, 13);
  }
}
</style>
