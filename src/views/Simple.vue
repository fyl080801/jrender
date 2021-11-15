<script lang="ts" setup>
import { onMounted, reactive, defineComponent, h, markRaw } from "@vue/composition-api";
import { JRender, JNode, assignObject, deepGet } from "@jrender/core";
import yaml from "js-yaml";

const configs = reactive({
  model: { text: "xxxxxxxaaaa", arr: [{ value: "xxx" }] },
  datasource: {},
  listeners: [],
  fields: [],
});

const onSetup = ({ onRender, onBeforeRender, addComponent }) => {
  onBeforeRender(() => (field, next) => {
    next(field);
  });

  addComponent(
    "text",
    defineComponent({
      props: {
        content: String,
      },
      setup(props) {
        return () => {
          return h("span", { domProps: { innerText: props.content } });
        };
      },
    }),
  );

  onBeforeRender(() => (field, next) => {
    if (!field.formItem) {
      return next(field);
    }
    const props = field.formItem;
    delete field.formItem;
    next({ component: "el-form-item", props, children: [field] });
  });

  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;

  // for 表达式，还不知道怎么具体实现vue的for
  onRender(({ context }) => {
    return (field, next) => {
      if (!field) {
        return next(field);
      }

      field.children = field?.children?.map((child) => {
        const matched = forAliasRE.exec(child.for);
        if (matched) {
          const [origin, prop, source] = matched;
          return {
            component: markRaw(
              defineComponent({
                setup() {
                  return () =>
                    h(
                      defineComponent({
                        setup(props, ctx) {
                          // 不是个好办法
                          return () => h("div", null, ctx.slots.default());
                        },
                      }),
                      null,
                      deepGet(context, source)?.map((item, index) => {
                        return h(JNode, {
                          props: {
                            field: assignObject(child, { for: undefined }),
                            scope: { [prop]: item, index },
                          },
                        });
                      }),
                    );
                },
              }),
            ),
          };
        } else {
          return child;
        }
      });

      next(field);
    };
  });

  // onBeforeRender(() => (field, next) => {
  //   if (field.component !== "el-select" || !field.items) {
  //     return next(field);
  //   }
  //   const items = field.items;
  //   delete field.items;
  //   field.children = items.map((item: any) => ({
  //     component: "el-option",
  //     options: { props: { label: item.value, value: item.value } },
  //   }));
  //   next(field);
  // });
  // onBeforeRender(() => (field, next) => {
  //   if (field.options?.rel !== true) {
  //     return next(field);
  //   }
  //   next({ component: "p", options: { domProps: { innerText: "Loading (6)" } } });
  //   let count = 5;
  //   const timer = setInterval(() => {
  //     if (count > 0) {
  //       next({ component: "p", options: { domProps: { innerText: `Loading (${count})` } } });
  //       count--;
  //     } else {
  //       clearInterval(timer);
  //       next(field);
  //     }
  //   }, 1000);
  // });
};

onMounted(async () => {
  const result = await fetch("/data/simple.yaml");

  const data: any = yaml.load(await result.text());

  configs.datasource = data.datasource || {};
  configs.listeners = data.listeners || [];
  configs.fields = data.fields || [];
});
</script>

<template>
  <div>
    <!-- <input v-model="configs.model.text" /> -->
    <JRender
      v-model="configs.model"
      :fields="configs.fields"
      :listeners="configs.listeners"
      :data-source="configs.datasource"
      @setup="onSetup"
    />
    <p>{{ JSON.stringify(configs.model) }}</p>
  </div>
</template>
