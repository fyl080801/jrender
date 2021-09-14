import { computed, inject, nextTick, provide, reactive, watch } from "@vue/composition-api";
import { cleanObject } from "@jrender/core";
import { insertToArray, removeFromArray } from "../../utils/helper";
import { toTreeNodeProxy, getNodeId } from "../../utils/tree";

const treeToken = Symbol("treeToken");
const treeNodeToken = Symbol("treeNodeToken");

let treeCounter = 0;

const defaults = {
  methods: {
    generateId: () => {
      return ++treeCounter;
    },
    isLeaf: (node: { isLeaf: boolean }) => {
      return node.isLeaf === true;
    },
    getNodeText: (node: { text: any }) => {
      return node.text;
    },
    isOpen: (node: { isOpen: boolean }) => {
      return node.isOpen === true;
    },
    toggleOpen: (node: { isOpen: boolean }) => {
      node.isOpen = !node.isOpen;
    },
  },
};

export const useTreeRoot = (params?: any) => {
  const { state = {}, methods = {} } = params;

  const context = {
    state: reactive({ ...state, changes: [], from: null }),
    methods: { ...defaults.methods, ...cleanObject(methods) },
  };

  provide(treeToken, context);

  watch(
    () => context.state.changes.length,
    (value) => {
      if (value <= 0) {
        return;
      }

      nextTick(() => {
        context.state.changes.forEach(({ from, to }: any) => {
          const remove = removeFromArray(from.node.children, from.index);
          insertToArray((to.node.children ||= []), to.index, remove);
        });

        context.state.changes.length = 0;
      });
    },
  );

  return context;
};

export const useTree = () => {
  return inject(treeToken, { state: reactive({ dragging: false }), ...defaults });
};

export const useTreeNode = (params?: any) => {
  if (params) {
    const { node, context } = params;
    const { methods } = context;

    const text = computed(() => {
      return methods.getNodeText(node);
    });

    const children = computed(() => {
      return (node.children || []).map((child: any) => {
        return toTreeNodeProxy(child)(methods.generateId(node), getNodeId(node));
      });
    });

    const isLeaf = computed(() => {
      return methods.isLeaf(node);
    });

    const isOpen = computed(() => {
      return methods.isOpen(node);
    });

    const onToggleOpen = () => {
      debugger;
      methods.toggleOpen(node);
    };

    const nodeContext = {
      node,
      text,
      children,
      isLeaf,
      isOpen,
      onToggleOpen,
    };

    provide(treeNodeToken, nodeContext);

    return nodeContext;
  } else {
    return inject(treeNodeToken);
  }
};
