// src/devtools.ts
import { setupDevtoolsPlugin } from "@vue/devtools-api";
function setupDevtools(app, data2) {
  const stateType = "Tvux Store Plugin state";
  const inspectorId = "tvux-store";
  const timelineLayerId = "tvux-store";
  let devtoolsApi;
  let trackId = 0;
  const devtools = {
    trackStart: (label) => {
      const groupId = "track" + trackId++;
      devtoolsApi.addTimelineEvent({
        layerId: timelineLayerId,
        event: {
          time: Date.now(),
          data: {
            label
          },
          title: label,
          groupId
        }
      });
      return () => {
        devtoolsApi.addTimelineEvent({
          layerId: timelineLayerId,
          event: {
            time: Date.now(),
            data: {
              label,
              done: true
            },
            title: label,
            groupId
          }
        });
      };
    }
  };
  const pluginDescriptor = {
    id: "tvux-store-devtools-plugin",
    label: "Tvux Store Plugin",
    packageName: "tvux-store",
    homepage: "https://vuejs.org",
    componentStateTypes: [
      stateType
    ],
    app
  };
  const setupFn = (api) => {
    devtoolsApi = api;
    api.on.inspectComponent((payload, context) => {
    });
    setInterval(() => {
      api.notifyComponentUpdate();
    }, 5e3);
    api.on.visitComponentTree((payload, context) => {
    });
    api.addInspector({
      id: inspectorId,
      label: "Tvux!",
      icon: "pets"
    });
    api.on.getInspectorTree((payload, context) => {
      if (payload.inspectorId === inspectorId) {
        payload.rootNodes = [
          ...Object.keys(data2).map((storeName) => ({
            id: storeName,
            label: storeName
          }))
        ];
      }
    });
    api.on.getInspectorState((payload, context) => {
      if (payload.inspectorId === inspectorId) {
        const storeName = payload.nodeId;
        const store = data2[storeName];
        const rawSection = [];
        const refSection = [];
        const computedSection = [];
        const functionSection = [];
        Object.keys(store).forEach((storeMemberName) => {
          const field = Reflect.get(store, storeMemberName);
          const type = field.constructor.name;
          switch (type) {
            case "RefImpl":
              refSection.push({
                key: storeMemberName,
                value: store[storeMemberName].value,
                editable: false
              });
              break;
            case "ComputedRefImpl":
              computedSection.push({
                key: storeMemberName,
                value: store[storeMemberName].value,
                editable: false
              });
              break;
            case "Function":
              functionSection.push({
                key: storeMemberName,
                value: store[storeMemberName],
                editable: false
              });
              break;
            default:
              rawSection.push({
                key: storeMemberName,
                value: store[storeMemberName],
                editable: false
              });
          }
        });
        payload.state = {
          [`0. raw`]: rawSection,
          [`1. ref`]: refSection,
          [`2. computed`]: computedSection,
          [`3. function`]: functionSection
        };
      }
    });
    api.addTimelineLayer({
      id: timelineLayerId,
      color: 16750671,
      label: "Awesome!"
    });
    window.addEventListener("click", (event) => {
    });
  };
  setupDevtoolsPlugin(pluginDescriptor, setupFn);
  return devtools;
}

// src/index.ts
var data = {};
var src_default = {
  install(app, options = {}) {
    let devtools;
    if (process.env.NODE_ENV === "development" || __VUE_PROD_DEVTOOLS__) {
      devtools = setupDevtools(app, data);
    }
  },
  create(name, store = {}) {
    data[name] = store;
  },
  list(scope, prop, val) {
    if (!data[scope])
      data[scope] = {};
    data[scope][prop] = val;
  }
};
export {
  src_default as default
};
//# sourceMappingURL=tvux-store.esm-bundler.js.map
