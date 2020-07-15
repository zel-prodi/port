<template >
  <v-menu bottom close-on-click offset-y>
    <template v-slot:activator="{ on }">
      <v-btn class="custom-btn" :ripple="false" text icon tile tabindex="-1"  v-on="on">
                <!-- source of flag image -->
        <img :src="`/image/flag/${$i18n.locale}.png`" width="40px" :alt="`${$i18n.locale}`">
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item v-for="(item, index) in items"
      :key="index"  @click="setLanguage(item.value)">
        <img :src="`/image/flag/${item.value}.png`" :alt="`${item.value}`" width="40px" style="border:1px solid grey">
        <v-list-item-title>&nbsp;{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  name: "LanguageSwitcher",
  data:()=>({
     items: [
        {title: 'English', value:'en' },
        {title: 'Japanese', value:'ja' },
        // {title: 'Tagalog', value:'ph'}
      ],
  }),
  methods:{
    setLanguage(val){
      this.$i18n.locale = val
      this.$router.push({
        params:{lang: val}
      })
    }
  }
}
</script>
<style>
.custom-btn::before {
    color: transparent
}

.custom-btn:hover {
    color: red;
}
</style>