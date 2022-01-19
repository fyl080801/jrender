import { reactive, nextTick } from "vue-demi";
import axios from "axios";

const request = axios.create({});

export const DevExtends = ({ addDataSource }) => {
  addDataSource("axios", (getOptions) => {
    const { autoLoad } = getOptions() || {};

    const instance = reactive({
      request: async () => {
        const options: any = getOptions();

        try {
          instance.loading = true;

          const response = await request(options.config);

          instance.data = options.defaultData || [];

          nextTick(() => {
            instance.data = response.data;
            instance.loading = false;
          });
        } catch {
          instance.data = options.defaultData || [];
          instance.loading = false;
        }
      },
      clear: () => {
        instance.data = getOptions()?.defaultData || [];
      },
      loading: false,
      data: getOptions()?.defaultData || [],
    });

    if (autoLoad) {
      nextTick(() => {
        instance.request();
      });
    }

    return instance;
  });
};
