<script>
import { inject, ref } from 'vue';
export default {
  data() {
    return {
      scrollInvoked: 0,
    };
  },
  setup() {
    const chatList = inject('chatList');
    return { chatList };
  },
  methods: {
    onScroll() {
      this.scrollInvoked++;
    },
  },
};
</script>


<template>
  <v-card v-scroll.self="onScroll" class="overflow-y-auto" max-height="400">


    <v-banner class="justify-center text-h5 font-weight-light" sticky
      :style="{ backgroundColor: '#455A64', color: 'white', zIndex: '1' }">
      <img class="mx-5" style="width: 50px" src="../../images/wolf.png" alt="Overlay Image">
      Chat logs
      <img class="mx-5" style="width: 50px" src="../../images/wolf-r.png" alt="Overlay Image">
    </v-banner>

    <div class="mt-5" v-if="chatList.length !== 0">
      <v-list lines="one">
        <v-list-item v-for="(chat, i) in chatList" :key="i"><v-chip>{{ chat }}</v-chip>
        </v-list-item>
      </v-list>
    </div>

  </v-card>
</template>
  