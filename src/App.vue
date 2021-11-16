<template>
  <div>
    <ul class="flex">
      <li><router-link to="simple">simple</router-link></li>
      <li><router-link to="table">table</router-link></li>
      <li><router-link to="designer">设计器</router-link></li>
    </ul>
    <div class="absolute bottom-0 left-0 right-0 top-8">
      <router-view></router-view>
    </div>
  </div>
</template>
