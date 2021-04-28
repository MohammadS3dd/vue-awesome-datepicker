
<template>
  <div id="app">
    <div class="mx-4">
      <vue-awesome-datepicker lang="Jalali" type="multiple" v-model="date" />
    </div>
    <div class="mx-4">
      <vue-awesome-datepicker lang="Greg" type="multiple" v-model="date" />
    </div>
    <!-- {{date}} -->
  </div>
</template>
<script>
import { reactive } from "vue";

import { defineComponent } from "vue";
import VueAwesomeDatepicker from "@/vue-awesome-datepicker.vue";
import "../dist/font-default.css";

export default defineComponent({
  name: "ServeDev",
  components: {
    VueAwesomeDatepicker,
  },
  setup() {
    const date = reactive({});
    return { date };
  },
});
</script>


<style scoped>
#app {
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  align-items: center;
  height: 100vh;
  background-image: linear-gradient(to right, var(--ttw-gradient-stops));
  --ttw-gradient-from: #6ee7b7;
  --ttw-gradient-stops: var(--ttw-gradient-from),
    var(--ttw-gradient-to, rgba(110, 231, 183, 0));
  --ttw-gradient-to: #93c5fd;
}
.mx-4{
  margin: 0rem 1rem 0rem 1rem;
}
</style>