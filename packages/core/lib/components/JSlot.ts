import { defineComponent } from "vue-demi";

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
