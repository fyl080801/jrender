<script lang="ts">
import { defineComponent } from "vue-demi";
import Dragzone from "./Dragzone.vue";
import { useTreeNode, useTreeRoot } from "./mixins";
import TreeNode from "./TreeNode.vue";
import TreeNodeChildren from "./TreeNodeChildren.vue";

export default defineComponent({
  props: { data: { type: Array, default: () => [] }, options: Object },
  components: {
    Dragzone,
    TreeNode,
    TreeNodeChildren,
  },
  setup(props) {
    const context = useTreeRoot({
      state: {
        dragging: false,
      },
      methods: {
        generateId: props.options?.generateId,
        isLeaf: props.options?.isLeaf,
        getNodeText: props.options?.getNodeText,
      },
    });

    const { children } = useTreeNode({
      node: { children: props.data },
      context,
    });
    return {
      context,
      children,
    };
  },
});
</script>

<template>
  <div class="relative flex flex-col">
    <template v-if="children.length > 0">
      <TreeNodeChildren />
    </template>
    <Dragzone v-else>add node</Dragzone>
  </div>
</template>
