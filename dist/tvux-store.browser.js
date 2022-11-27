(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/@vue/devtools-api/lib/esm/env.js
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  var isProxyAvailable = typeof Proxy === "function";

  // node_modules/@vue/devtools-api/lib/esm/const.js
  var HOOK_SETUP = "devtools-plugin:setup";
  var HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";

  // node_modules/@vue/devtools-api/lib/esm/time.js
  var supported;
  var perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }

  // node_modules/@vue/devtools-api/lib/esm/proxy.js
  var ApiProxy = class {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data2 = JSON.parse(raw);
        Object.assign(currentSettings, data2);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    setRealTarget(target) {
      return __async(this, null, function* () {
        this.target = target;
        for (const item of this.onQueue) {
          this.target.on[item.method](...item.args);
        }
        for (const item of this.targetQueue) {
          item.resolve(yield this.target[item.method](...item.args));
        }
      });
    }
  };

  // node_modules/@vue/devtools-api/lib/esm/index.js
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }

  // src/devtools.ts
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
      if (true) {
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
})();
//# sourceMappingURL=tvux-store.browser.js.map
