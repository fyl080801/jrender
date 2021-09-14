<script lang="ts" setup>
import { useRootRender } from "@jrender/core";
import { nextTick } from "@vue/composition-api";

useRootRender(({ onBeforeRender, onRender, addFunction }: any) => {
  // 没意义，受vue2机制影响
  // 根级元素的代理值如果不是一个对象则没法直接赋给另一个属性
  onBeforeRender((field: any) => {
    field.options ||= {};

    if (field.domProps) {
      field.options.domProps = field.domProps;
    }

    if (field.props) {
      field.options.props = field.props;
    }

    if (field.on) {
      field.options.on = field.on;
    }

    if (field.nativeOn) {
      field.options.nativeOn = field.nativeOn;
    }

    if (field.class) {
      field.options.class = field.class;
    }

    if (field.style) {
      field.options.style = field.style;
    }

    if (field.slot) {
      field.options.slot = field.slot;
    }

    return field;
  });

  onRender((field: any) => {
    if (field?.options?.condition === false || field?.options?.condition === null) {
      return null;
    }
    return field;
  });

  addFunction("NEXTTICK", (cb: any) => {
    nextTick(cb);
  });
});
</script>

<template>
  <div>
    <ul>
      <li><router-link to="simple">simple</router-link></li>
      <li><router-link to="table">table</router-link></li>
    </ul>
    <router-view></router-view>
  </div>
</template>
