
<template>
  <div id="app">
    <vue-awesome-datepicker lang="Jalali" v-model="date" />
    {{date}}
  </div>
</template>
<script>
import { reactive } from "vue";

import { defineComponent } from 'vue';
import VueAwesomeDatepicker from '@/vue-awesome-datepicker.vue';

export default defineComponent({
  name: 'ServeDev',
  components: {
    VueAwesomeDatepicker
  },
  setup() {
    const date = reactive({});
    return { date };
  },
});
</script>


<style scoped>
#app{
  display: flex;
  flex-direction: row;
}
</style>