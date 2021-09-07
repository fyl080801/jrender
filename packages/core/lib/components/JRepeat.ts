import { defineComponent, h } from "vue-demi";
import JNode from "./JNode";

export default defineComponent({
  name: "JRepeat",
  props: { data: { type: Array, default: () => [] }, field: { type: Object, required: true } },
  components: { JNode },
  setup(props) {
    return () => {
      return props.data.map((item) => h("JNode", { props: { field: props.field, scope: item } }));
    };
  },
});
