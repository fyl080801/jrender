<template>
  <div>
    <ul class="flex">
      <li class="mx-3"><router-link to="simple">simple</router-link></li>
      <li class="mx-3"><router-link to="nest">nest</router-link></li>
      <li class="mx-3"><router-link to="layout">layout</router-link></li>
    </ul>
    <div class="absolute bottom-0 left-0 right-0 top-8">
      <router-view></router-view>
    </div>
  </div>
</template>
