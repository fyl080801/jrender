import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    renderSlot: {
      type: Function,
      default: () => {
        //
      },
    },
  },
  setup(props) {
    return props.renderSlot;
  },
});
