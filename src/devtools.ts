// @ts-nocheck
import { setupDevtoolsPlugin, DevtoolsPluginApi } from '@vue/devtools-api'
import { App } from 'vue'
import { MyPluginData } from './data'

export function setupDevtools (app: App, data: MyPluginData) {
  const stateType = 'Tvux Store Plugin state'
  const inspectorId = 'tvux-store'
  const timelineLayerId = 'tvux-store'

  let devtoolsApi: DevtoolsPluginApi<{}>

  let trackId = 0

  const devtools = {
    trackStart: (label: string) => {
      const groupId = 'track' + trackId++

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
      })

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
        })
      }
    }
  }

  const pluginDescriptor = {
    id: 'tvux-store-devtools-plugin',
    label: 'Tvux Store Plugin',
    packageName: 'tvux-store',
    homepage: 'https://vuejs.org',
    componentStateTypes: [
      stateType
    ],
    app
  }

  const setupFn = api => {
    devtoolsApi = api

    api.on.inspectComponent((payload, context) => {
      // payload.instanceData.state.push({
      //   type: stateType,
      //   key: '$hello',
      //   value: data.message,
      //   editable: false
      // })
      //
      // payload.instanceData.state.push({
      //   type: stateType,
      //   key: 'time counter',
      //   value: data.counter,
      //   editable: false
      // })
    })

    setInterval(() => {
      api.notifyComponentUpdate()
    }, 5000)

    api.on.visitComponentTree((payload, context) => {
      // const node = payload.treeNode
      // if (payload.componentInstance.type.meow) {
      //   node.tags.push({
      //     label: 'meow',
      //     textColor: 0x000000,
      //     backgroundColor: 0xff984f
      //   })
      // }
    })

    api.addInspector({
      id: inspectorId,
      label: 'Tvux!',
      icon: 'pets',
    })

    api.on.getInspectorTree((payload, context) => {
      if (payload.inspectorId === inspectorId) {
        payload.rootNodes = [
          ...Object.keys(data).map(storeName => ({
            id: storeName,
            label: storeName
          }))
        ]
      }
    })

    api.on.getInspectorState((payload, context) => {
      if (payload.inspectorId === inspectorId) {
        const storeName = payload.nodeId
        const store = data[storeName]

        const rawSection = []
        const refSection = []
        const computedSection = []
        const functionSection = []

        Object.keys(store).forEach(storeMemberName => {
          const field = Reflect.get(store, storeMemberName)
          const type = field.constructor.name
          switch (type) {
            case 'RefImpl':
              refSection.push({
                key: storeMemberName,
                value: store[storeMemberName].value,
                editable: false
              })
              break;
            case 'ComputedRefImpl':
              computedSection.push({
                key: storeMemberName,
                value: store[storeMemberName].value,
                editable: false
              })
              break;
            case 'Function':
              functionSection.push({
                key: storeMemberName,
                value: store[storeMemberName],
                editable: false
              })
              break;
            default:
              rawSection.push({
                key: storeMemberName,
                value: store[storeMemberName],
                editable: false
              })
          }
        })

        payload.state = {
          [`0. raw`]: rawSection,
          [`1. ref`]: refSection,
          [`2. computed`]: computedSection,
          [`3. function`]: functionSection
        }
      }
    })

    // timeline event
    api.addTimelineLayer({
      id: timelineLayerId,
      color: 0xff984f,
      label: 'Awesome!'
    })
    window.addEventListener('click', event => {
      // const groupId = 'group-1'
      //
      // devtoolsApi.addTimelineEvent({
      //   layerId: timelineLayerId,
      //   event: {
      //     time: Date.now(),
      //     data: {
      //       label: 'group test'
      //     },
      //     title: 'group test',
      //     groupId
      //   }
      // })
      //
      // devtoolsApi.addTimelineEvent({
      //   layerId: timelineLayerId,
      //   event: {
      //     time: Date.now() + 10,
      //     data: {
      //       label: 'group test (event 2)',
      //     },
      //     title: 'group test',
      //     groupId
      //   }
      // })
      //
      // devtoolsApi.addTimelineEvent({
      //   layerId: timelineLayerId,
      //   event: {
      //     time: Date.now() + 20,
      //     data: {
      //       label: 'group test (event 3)',
      //     },
      //     title: 'group test',
      //     groupId
      //   }
      // })
    })
  }

  setupDevtoolsPlugin(pluginDescriptor, setupFn)

  return devtools
}
