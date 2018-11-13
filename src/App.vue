<template>
  <div id="app">
    <div style="height:150px;"></div>
    <TimeSliders ref="timeSliders" :config="config" :list="list" :buttonMethods="buttonMethods()" @callback="callback"/>
    <button @click="getData">console.log查看数据</button>
  </div>
</template>

<script>
import TimeSliders from './components/TimeSliders.vue'
export default {
  name: 'app',
  components: {
    TimeSliders
  },
  data () {
    return {
      config: {
        // titlePreFix: '哈哈哈',
        colors: {
          '1': '#E68B35',
          '2': '#71C0F9',
          '3': '#E88A8A',
          '4': '#000A74',
          '5': '#74C18C',
          '-1': '#EB3223',
          '0': '#9E9E9E'
        }, // 事件-颜色映射
        events: {
          '1': '图片素材',
          '2': '视频素材',
          '3': '直播素材',
          '4': '链接素材',
          '5': '混合素材（内容）',
          '-1': '广告素材',
          '0': '待机页面'
        },
        editAreaConfig: {
          contentKey: 'name', // 内容key值
          leftFunTxt: '编辑', // 左侧按钮文案
          leftFunValue: 'leftFun', // 左侧按钮事件派发
          centerFunTxt: '中间', // 中间按钮
          centerFunValue: 'leftFun', // 中间按钮事件派发
          rightFunTxt: '删除', // 右侧按钮文案
          rightFunValue: 'delete' // 右侧按钮事件派发
        }
      },
      list: [{
        title: ['主标题', '副标题'],
        timeSlices: [{
          id: '0',
          name: '这是个名字',
          type: '1',
          startTime: '05:09:10',
          endTime: '07:11:01'
        }, {
          id: '1',
          name: '时间名称2',
          type: '2',
          startTime: '08:09:00',
          endTime: '10:12:01'
        }]
      }, {
        title: ['局部不可拖动不可新增'],
        config: {
          staffFlag: true,
          addSliceFlag: false,
          editAreaConfig: {
            contentKey: 'name', // 内容key值
            leftFunTxt: '编辑1', // 左侧按钮文案
            leftFunValue: 'leftFun', // 左侧按钮事件派发
            rightFunTxt: '预览', // 右侧按钮文案
            rightFunValue: 'rightFun' // 右侧按钮事件派发
          }
        },
        timeSlices: [{
          id: '0',
          name: '时间名称到底怎么样',
          type: '1',
          startTime: '05:09:10',
          endTime: '07:11:13',
          dragable: false
        }, {
          id: '1',
          name: '时间名称2',
          type: '4',
          startTime: '08:09:10',
          endTime: '10:12:01'
        }]
      }, {
        title: ['可新增不可拖动'],
        config: {
          staffFlag: false,
          dragable: false
        },
        timeSlices: [{
          id: '0',
          name: '事件名称1',
          type: '1',
          startTime: '15:09:10',
          endTime: '18:09:00'
        }, {
          id: '1',
          name: '时间名称2',
          type: '3',
          startTime: '18:09:10',
          endTime: '23:21:01'
        }]
      }]
    }
  },
  methods: {
    buttonMethods () {
      return {
        leftFun: (obj, index) => {
          console.log('leftFun...', index, obj)
        },
        delete: (obj, index) => {
          this.doDelete(obj, index)
        }
      }
    },
    getData () {
      console.log('...', this.$refs.timeSliders.getListData())
    },
    doDelete (obj, idx) {
      const list = this.$refs.timeSliders.getListData()
      const arr = list[idx].timeSlices
      let index = -1
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i] || {}
        if (item.startTime === obj.startTime) {
          index = i
          break
        }
      }
      if (index > -1) {
        arr.splice(index, 1)
        this.list = list
      }
    },
    callback (type) {
      this.getData()
    }
  }
}
</script>

<style>
</style>
