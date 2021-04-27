
<a href="https://github.com/MohammadS3dd/vue-awesome-datepicker">
	<img src="https://raw.githubusercontent.com/MohammadS3dd/vue-awesome-datepicker/master/docs/dp-prev-j.PNG"  />
</a>

# Vue Awesome Datepicker 


awesome, zero dependency, performant Vue datepicker component

## TODO 

- [ ] decouple styles from tailwind CSS
- [ ] refactor to composition api
- [ ] documentaition

## Installation 🚀
```bash
npm i vue-awesome-datepicker
# or 
yarn add vue-awesome-datepicker
```


## Component Registration and usage

```javascript

import datepicker from "vue-awesome-datepicker";

import "vue-awesome-datepicker/dist/font-default.css"; //if you want default fonts

export default {
  components: {
    datepicker,
  },
  data() {
    return { date: {},dateGreg:{} };
  },
};

<template>
  <datepicker lang="Jalali" type="range" v-model="date" />
  <datepicker lang="Greg" type="range" v-model="dateGreg" />
</template>

```
