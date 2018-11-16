<template>
  <div>
    <div class="time-line-header" :style="`margin-left:${initedConfig.titleWidth}px;`">
      <ul>
        <li v-for="(value, key) in initedConfig.colors" :key="key">
          <div :style="`background: ${value};`"></div>
          <p>{{initedConfig.events[key]}}</p>
        </li>
      </ul>
      <div>
        <button  @click="toClean" v-if="initedConfig.cleanFlag" :disabled="!cleanAbleFlag">清空时间轴</button>
        <button @click="toCopy" v-if="initedConfig.copyFlag" :disabled="!copyAbleFlag">复制</button>
      </div>
    </div>
    <div class="time-line-container">
      <TimeLine  ref="timeline" v-for="(item, index) in timeLines" :key="item._id" :idx="index" :id="item._id" :title="item.title" :config="item.config" :list="item.timeSlices || []" :buttonMethods="buttonMethods" :hub="hub"/>
    </div>
    <Dialog :dialogFlag="dialogObj.dialogFlag" :type="dialogObj.type" :title="dialogObj.title" :leftFlag="dialogObj.leftFlag" :leftTxt="dialogObj.leftTxt" :leftFun="dialogObj.leftFun"  :rightFlag="dialogObj.rightFlag" :rightTxt="dialogObj.rightTxt" :rightFun="dialogObj.rightFun">
      <div v-show="dialogObj.type === 'copy'">
        <ul>
          <li v-for="(item, key) in copyList" :key="key">
            <input type="checkbox" :value="key" v-model="needCopys">
            <p class="right-part">{{item}}</p>
          </li>
        </ul>
      </div>
      <div v-show="dialogObj.type === 'add'">
        <ul>
          <li>
            <p>标题：</p>
            <input type="text" v-model="inputTitle">
          </li>
        </ul>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import DEFAULT_CONFIG from '../js/default.js'
import TimeLine from './TimeLine.vue'
import Dialog from './Dialog.vue'
import 'reset-css'
export default {
  name: 'TimeSliders',
  components: {
    TimeLine,
    Dialog
  },
  props: {
    config: {
      type: Object,
      default () {
        return {}
      }
    },
    list: {
      type: Array,
      default () {
        return []
      }
    },
    buttonMethods: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      initedConfig: {},
      timeLines: [],
      hub: new Vue(),
      checkedList: [],
      copyList: {},
      needCopys: [],
      dialogObj: {
        dialogFlag: false
      },
      currentIdx: 0,
      inputTitle: ''
    }
  },
  computed: {
    cleanAbleFlag () {
      return this.checkedList.length > 0
    },
    copyAbleFlag () {
      return this.checkedList.length === 1 && this.timeLines.length > 1
    }
  },
  created () {
    this.init(this.list)
  },
  mounted () {
    // 事件监听
    // document.addEventListener('click', this.dispatchClean)
    this.hub.$on('timeLineChecked', (key, flag) => { // Hub接收事件
      const list = this.deepCopy(this.checkedList)
      const containFlag = list.includes(key)
      if (flag && !containFlag) {
        list.push(key)
      }
      if (!flag && containFlag) {
        const index = list.indexOf(key)
        list.splice(index, 1)
      }
      this.checkedList = list
    })
    this.hub.$on('reduceTimeLine', (index) => {
      this.toReduce(index)
    })
    this.hub.$on('addTimeLine', (index) => {
      this.toAdd(index)
    })
  },
  beforeDestroy () {
    document.removeEventListener('click', this.dispatchClean)
  },
  methods: {
    deepCopy (obj = '') {
      return typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : ''
    },
    mixinObj (arg1 = {}, arg2 = {}) {
      const obj1 = this.deepCopy(arg1)
      const obj2 = this.deepCopy(arg2)
      return Object.assign(obj1, obj2)
    },
    init (list = '') {
      // 初始化配置
      this.initedConfig = this.mixinObj(DEFAULT_CONFIG, this.config)
      // 初始化时间轴
      this.timeLines = this.deepCopy(list) || this.deepCopy(this.list)
      // 初始化详细配置
      this.timeLines.forEach((item, index) => {
        if (!item._id) {
          item._id = `${item.title}_${index}_${new Date().getTime()}`
        }
        if (this.initedConfig.titlePreFix) {
          item.title = [`${this.initedConfig.titlePreFix}${index + 1}`]
        }
        item.config = this.mixinObj(this.initedConfig, item.config)
        // staffTopRowFlag 为统一的配置
        const staffTopRowFlag = this.initedConfig.staffTopRowFlag || false
        item.config.staffTopRowFlag = staffTopRowFlag
        // cleanFlag 为统一的配置
        const cleanFlag = this.initedConfig.cleanFlag || false
        item.config.cleanFlag = cleanFlag
        // copyFlag 为统一的配置
        const copyFlag = this.initedConfig.copyFlag || false
        item.config.copyFlag = copyFlag
        // maxNum 为统一的配置
        const maxNum = this.initedConfig.maxNum || 3
        item.config.maxNum = maxNum
      })
      this.cancel()
      this.$nextTick(() => {
        this.hub.$emit('reduceFlag', this.timeLines.length, this.initedConfig.maxNum)
      })
    },
    getListData () {
      let list = []
      this.timeLines.forEach((item, index) => {
        for (let i = 0; i < this.$refs.timeline.length; i++) {
          const timelineItem = this.$refs.timeline[i] || {}
          if (timelineItem.id === item._id) {
            const obj = timelineItem.getData()
            list.push(obj)
          }
        }
      })
      return list
    },
    dispatchClean () {
      this.hub.$emit('cleanOtherSelected')
    },
    toClean () {
      this.dialogObj = {
        dialogFlag: true,
        title: '确认清除？',
        leftFun: this.doClean,
        rightFun: this.cancel
      }
    },
    doClean () {
      const list = this.getListData()
      list.forEach((item) => {
        if (this.checkedList.includes(item._id)) {
          item.timeSlices = []
        }
      })
      this.init(list)
      this.$nextTick(() => {
        this.$emit('callback', 'clean')
      })
    },
    toCopy () {
      const obj = {}
      this.timeLines.forEach((item, index) => {
        if (!this.checkedList.includes(item._id)) {
          obj[item._id] = item.title[0] || `时间轴${index + 1}`
        }
      })
      this.copyList = obj
      this.needCopys = []
      this.dialogObj = {
        dialogFlag: true,
        type: 'copy',
        title: '复制到：',
        leftFun: this.doCopy,
        rightFun: this.cancel
      }
    },
    doCopy () {
      const list = this.getListData()
      const _id = this.checkedList[0]
      const theTimeLine = list.filter(item => item._id === _id)[0]
      const theTimeSlices = theTimeLine.timeSlices || []
      list.forEach((item) => {
        if (this.needCopys.includes(item._id)) {
          item.timeSlices = this.deepCopy(theTimeSlices)
        }
      })
      this.init(list)
      this.$nextTick(() => {
        this.$emit('callback', 'copy')
      })
    },
    toReduce (index) {
      this.currentIdx = index
      this.dialogObj = {
        dialogFlag: true,
        title: '确认删除？',
        leftFun: this.doReduce,
        rightFun: this.cancel
      }
    },
    doReduce () {
      const list = this.getListData()
      list.splice(+this.currentIdx, 1)
      this.init(list)
      this.$nextTick(() => {
        this.$emit('callback', 'reduce')
      })
    },
    toAdd (index) {
      this.currentIdx = index
      if (this.initedConfig.titlePreFix) {
        this.doAdd()
      } else {
        this.inputTitle = ''
        this.dialogObj = {
          dialogFlag: true,
          type: 'add',
          title: '填写标题并新增',
          leftFun: this.doAdd,
          rightFun: this.cancel
        }
      }
    },
    doAdd () {
      const obj = {
        _id: `${this.inputTitle}_${new Date().getTime()}`,
        title: this.inputTitle.split(','),
        timeSlices: []
      }
      const list = this.getListData()
      list.splice(+this.currentIdx + 1, 0, obj)
      this.init(list)
      this.$nextTick(() => {
        this.$emit('callback', 'add')
      })
    },
    cancel () {
      this.dialogObj = {
        dialogFlag: false
      }
    }
  },
  watch: {
    config () {
      this.init()
      this.$nextTick(() => {
        this.$emit('callback', 'config')
      })
    },
    list () {
      this.init()
      this.$nextTick(() => {
        this.$emit('callback', 'list')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .time-line-header {
    display: flex;
    align-items: center;
    ul {
      display: flex;
      li {
        display: flex;
        div {
          width: 20px;
          height: 20px;
          margin-right: 5px;
        }
        p {
          color: #333;
          font-size: 14px;
          line-height: 20px;
          margin-right: 10px;
        }
      }
    }
    div {
      button {
        background: transparent;
        border: 0;
        padding: 5px 10px;
        margin: 0 10px;
        background: #427BC4;
        color: #fff;
        font-size: 14px;
        line-height: 14px;
        border-radius: 3px;
        outline: none;
      }
      button:disabled {
        background: gray;
      }
    }
  }
</style>
