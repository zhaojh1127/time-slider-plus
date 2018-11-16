<template>
  <div class="time-line">
    <div class="title-wrapper">
      <div class="seat" v-show="staffFlag" :style="`height:${config.staffHeight}px;`"></div>
      <div class="title" :style="titleStyle">
        <input type="checkbox" :value="id" v-model="checkedFlag" v-show="config.cleanFlag || config.copyFlag" @click.stop="clickBlock">
        <ul>
          <li v-for="item in title" :key="item" :title="item" :class="title.length > 1 ? 'multi' :''" :style="`line-height:${config.height / title.length}px`">{{item}}</li>
        </ul>
      </div>
    </div>
    <div class="time-line-wrapper">
      <canvas :id="`staff_${idx}`" :width="`${+config.width + 2 * +config.dragBorderWidth}`" :height="config.staffHeight" v-show="staffFlag"></canvas>
      <div class="time-base">
        <ul>
          <li v-for="(item, index) in timeSlices" :key="index" class="time-item" :style="`left:${+getLeftPosition(item.startTime) + (+getBlockWidth(item.startTime, item.endTime) / 2)}px;bottom:${-config.height}px;`" @click.stop="clickBlock(index)"></li>
        </ul>
        <div class="editArea" :style="`left:${+getLeftPosition(thisObj.startTime) + (+getBlockWidth(thisObj.startTime, thisObj.endTime) / 2)}px;bottom:${config.staffHeight}px;`" v-show="thisObj.startTime">
          <p>{{`${thisObj.startTime}-${thisObj.endTime}`}}</p>
          <p>{{getTimeLong(thisObj.startTime, thisObj.endTime)}}</p>
          <p class="content">{{thisObj[config.editAreaConfig.contentKey] || ''}}</p>
          <div class="operate" v-show="thisObj.editable && config.editable">
            <button :data-obj="thisObj" @click.stop="clickLeftButton">{{config.editAreaConfig.leftFunTxt || ''}}</button>
            <button :data-obj="thisObj" @click.stop="clickCenterButton">{{config.editAreaConfig.centerFunTxt || ''}}</button>
            <button :data-obj="thisObj" @click.stop="clickRightButton">{{config.editAreaConfig.rightFunTxt || ''}}</button>
          </div>
        </div>
        <div class="point-line" :style="`height:${config.staffHeight}px;left:${+getLeftPosition(thisObj.startTime) + (+getBlockWidth(thisObj.startTime, thisObj.endTime) / 2)}px;`" v-show="thisObj.startTime">
        </div>
      </div>
      <canvas :id="`cvs_${idx}`" :width="`${+config.width + 2 * +config.dragBorderWidth}`" :height="config.height"  @mousedown="mouseDown" @mousemove="mouseMove" @mouseup="mouseUp" @click.stop="0"></canvas>
    </div>
    <div class="tail-wrapper" v-show="config.reduceFlag">
      <div class="seat" v-show="staffFlag" :style="`height:${config.staffHeight}px;`"></div>
      <div class="tail" :style="`${titleStyle}`">
        <img src="../assets/icon_reduce.png" @click="dispatchReduce" v-show="reduceFlag">
        <img src="../assets/icon_reduce_gray.png" v-show="!reduceFlag">
        <img src="../assets/icon_add.png" @click="dispatchAdd" v-show="addFlag">
        <img src="../assets/icon_add_gray.png" v-show="!addFlag">
      </div>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import timeUtil from '../js/timeUtil'
export default {
  name: 'TimeLine',
  props: {
    idx: {
      type: Number,
      default () {
        return 0
      }
    },
    title: {
      type: Array,
      default () {
        return []
      }
    },
    id: {
      type: String,
      default () {
        return ''
      }
    },
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
    },
    hub: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  computed: {
    staffFlag () {
      return (this.config.staffTopRowFlag && +this.idx === 0) || (!this.config.staffTopRowFlag && this.config.staffFlag)
    }
  },
  data () {
    return {
      titleStyle: `width: ${this.config.titleWidth}px;height: ${this.config.height}px;line-height: ${this.config.height}px;`,

      unitWidth: 0,

      timeSlices: [],

      cvsDom: null,
      cvsContext: null,
      selectedObj: {}, // 选中的被拖拽对象的初始状态
      thisObj: {
        // editAreaConfig: {
        //   contentKey: '', // 内容key值
        //   leftFunTxt: '', // 左侧按钮文案
        //   leftFunValue: '', // 左侧按钮事件派发
        //   rightFunTxt: '', // 右侧按钮文案
        //   rightFunValue: '' // 右侧按钮事件派发
        // }
      }, // 与selectedObj类似，当前操作的对象，场景更广泛
      isDragging: false,
      dragDirection: '',
      originX: 0, // 拖拽起始x坐标

      checkedFlag: [], // 是否勾选当前时间轴
      reduceFlag: 1, // 删减
      addFlag: 1 // 新增
    }
  },
  mounted () {
    // 事件监听
    this.hub.$on('reduceFlag', (num, maxNum) => {
      this.reduceFlag = +num > 1 ? 1 : 0
      this.addFlag = +num === +maxNum ? 0 : 1
    })
    this.hub.$on('cleanOtherSelected', (str) => { // Hub接收事件
      if (this.idx !== str) {
        const list = this.deepCopy(this.timeSlices)
        list.forEach((item) => {
          item.selected = false
        })
        // 重绘
        this.timeSlices = list
      }
    })
    this.$nextTick(() => {
      this.unitWidth = parseFloat(+this.config.width / 24 / 60 * +this.config.unit).toFixed(4)

      const anHourWidth = parseFloat(this.config.width / 24).toFixed(4)
      const staffCvsDom = document.querySelector(`#staff_${this.idx}`)
      if (staffCvsDom) {
        const staffCvsCxt = staffCvsDom.getContext('2d')
        staffCvsCxt.fillStyle = this.config.staffColor
        for (let i = 0; i < 26; i++) {
          let txt = i > 9 ? `${i}:00` : `0${i}:00`
          if (+this.config.staffFontType) {
            txt = i > 9 ? `${i}` : `0${i}`
          }
          // 标尺数字
          staffCvsCxt.font = `${this.config.staffFontSize}px ${this.config.staffFontStyle}`
          staffCvsCxt.fillText(txt, +anHourWidth * i + +this.config.dragBorderWidth - (+staffCvsCxt.measureText(txt).width / 2), this.config.staffFontSize)

          // 标尺刻度
          staffCvsCxt.fillRect(+anHourWidth * i + +this.config.dragBorderWidth - (+this.config.staffUnitWidth / 2), +this.config.staffHeight - +this.config.staffUnitHeight, this.config.staffUnitWidth, this.config.staffUnitHeight)
        }
      }

      this.cvsDom = document.querySelector(`#cvs_${this.idx}`)
      this.cvsContext = this.cvsDom.getContext('2d')
      this.init()
    })
  },
  methods: {
    init () {
      const list = this.deepCopy(this.list)
      // 排序
      list.sort((obj1, obj2) => {
        return +this.getLeftPosition(obj1.startTime) - +this.getLeftPosition(obj2.startTime)
      })
      // 去除冲突时间段
      let preRightPosition = 0
      for (let i = 0; i < list.length; i++) {
        const item = list[i] || {}
        const thisLeftPosition = +this.getLeftPosition(item.startTime)
        const thisRightPosition = +this.getLeftPosition(item.endTime)
        if (thisLeftPosition < preRightPosition) {
          list.splice(i, 1)
          i--
        } else {
          preRightPosition = thisRightPosition
        }
      }
      list.forEach((item) => {
        if (typeof item.dragable !== 'boolean') {
          item.dragable = true
        }
        if (typeof item.editable !== 'boolean') {
          item.editable = true
        }
        // if (!item.editAreaConfig || typeof item.editAreaConfig !== 'object') {
        //   item.editAreaConfig = Object.assign({}, this.config.editAreaConfig)
        // }
      })
      this.timeSlices = list
    },
    deepCopy (obj = '') {
      return typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : ''
    },
    getBackground (type = '0') {
      return this.config.colors[type] || this.config.defaultColor
    },
    // 获取时间片断长度 px
    getBlockWidth (startTime, endTime) {
      const startTimeHHmm = timeUtil.formatHHmm(startTime)
      let endTimeHHmm = timeUtil.formatHHmm(endTime)
      const minutesValue = parseFloat(timeUtil.minusTime(startTimeHHmm, endTimeHHmm) / 1000 / 60).toFixed(4)
      return parseFloat(this.unitWidth * (minutesValue / +this.config.unit)).toFixed(4)
    },
    // 获取时差(分钟)
    getTimeLong (startTime, endTime) {
      const stime = timeUtil.getTime(startTime)
      const etime = timeUtil.getTime(endTime)
      const timeLong = etime - stime
      const hours = Math.floor(timeLong / (3600 * 1000))
      const disHourTime = timeLong % (3600 * 1000)
      const mins = Math.floor(disHourTime / (60 * 1000))
      const disMinTIme = disHourTime % (60 * 1000)
      const seds = Math.round(disMinTIme / 1000)
      let str = ''
      if (hours > 0) {
        str += `${hours}小时`
      }
      if (mins > 0) {
        str += `${mins}分钟`
      }
      str += `${seds}秒`
      return str
    },
    // 获取时间偏短的左偏移量 px
    getLeftPosition (startTime) {
      const hours = timeUtil.getHours(startTime)
      const minutes = timeUtil.getMinutes(startTime)
      const totalMinutes = hours * 60 + minutes
      return parseFloat(this.unitWidth * (totalMinutes / +this.config.unit) + +this.config.dragBorderWidth).toFixed(4)
      // 时间条左右两边有个占位，用于左右拖拽
    },

    // 绘制时间轴时间段节点
    drawTimeBlocks () {
      this.cvsContext.clearRect(0, 0, this.config.width + 2 * +this.config.dragBorderWidth, this.config.height)
      this.cvsContext.fillStyle = this.config.background
      this.cvsContext.fillRect(this.config.dragBorderWidth, 0, this.config.width, this.config.height)
      this.timeSlices.forEach((item, index) => {
        this.cvsContext.fillStyle = this.getBackground(item.type)
        this.cvsContext.fillRect(this.getLeftPosition(item.startTime), 0, this.getBlockWidth(item.startTime, item.endTime), this.config.height)
      })
      // 绘制选中状态
      this.thisObj = {
        // editAreaConfig: {
        //   contentKey: '', // 内容key值
        //   leftFunTxt: '', // 左侧按钮文案
        //   leftFunValue: '', // 左侧按钮事件派发
        //   rightFunTxt: '', // 右侧按钮文案
        //   rightFunValue: '' // 右侧按钮事件派发
        // }
      }
      this.timeSlices.forEach((item) => {
        if (item.selected) {
          if (item.dragable && this.config.dragable) {
            this.cvsContext.fillStyle = this.config.dragBorderColor
            this.cvsContext.fillRect(+this.getLeftPosition(item.startTime) - +this.config.dragBorderWidth, 0, +this.config.dragBorderWidth, this.config.height)
            this.cvsContext.fillRect(+this.getLeftPosition(item.endTime), 0, +this.config.dragBorderWidth, this.config.height)
          }
          this.thisObj = this.deepCopy(item)
        }
      })
    },
    // 新增时间段节点
    addTimeBlock (x) {
      // 超出范围
      if (+x < +this.config.dragBorderWidth || +x > (+this.config.width + +this.config.dragBorderWidth)) return

      let coincideFlag = false // 是否和其他时间段重合
      const endx = +x + +this.unitWidth
      const list = this.deepCopy(this.timeSlices)
      for (let i = 0; i < list.length; i++) {
        const item = list[i] || {}
        const sx = +this.getLeftPosition(item.startTime)
        if (x <= sx && endx >= sx) {
          coincideFlag = true
          break
        }
      }
      if (coincideFlag) {
        // 时间段冲突
        return 0
      } else {
        const startTime = timeUtil.length2Time(x, this.unitWidth, this.config.unit, this.config.dragBorderWidth)
        const endTime = timeUtil.calculateTime(startTime, this.config.unit, 'm')
        const obj = {
          startTime,
          endTime,
          type: this.config.defaultEvent,
          selected: true,
          dragable: true,
          editable: true
        }
        list.push(obj)
        list.sort((obj1, obj2) => {
          return +this.getLeftPosition(obj1.startTime) - +this.getLeftPosition(obj2.startTime)
        })
        this.timeSlices = list
      }
    },
    clickBlock (index) {
      this.hub.$emit('cleanOtherSelected', this.idx)
      if (typeof index === 'number') {
        const list = this.deepCopy(this.timeSlices)
        const flag = list[index].selected || false
        list.forEach((item) => {
          item.selected = false
        })
        list[index].selected = !flag
        // 重绘
        this.timeSlices = list
      }
    },
    mouseDown (e) {
      const x = e.pageX - $(this.cvsDom).offset().left
      let arr = []
      let j = -1
      const list = this.deepCopy(this.timeSlices)
      list.forEach((item, index) => {
        let sx = 0
        let ex = 0
        if (item.dragable && this.config.dragable) {
          // 可以拖拽，说明有拖拽条
          sx = +this.getLeftPosition(item.startTime) - +this.config.dragBorderWidth // 起始x坐标（带border）
          ex = +this.getLeftPosition(item.endTime) + +this.config.dragBorderWidth // 截止x坐标(带border)
        } else {
          // 不可以拖拽，说明没有有拖拽条
          sx = +this.getLeftPosition(item.startTime) // 起始x坐标（不带border）
          ex = +this.getLeftPosition(item.endTime) // 截止x坐标(不带border)
        }
        if (sx <= x && x <= ex) {
          arr.push(index) // 带了边框就可能存在边框与其他区域交叉的情况，不是唯一值
        }
        if (item.selected) {
          j = index
        }
      })
      if (arr.includes(j)) {
        // 当前拖拽模块是已选中模块，正在拖动
        this.isDragging = true
        this.selectedObj = this.deepCopy(list[j])
        this.dragDirection = ''
        // 判断是否左拖拽或者右拖拽
        const sx1 = +this.getLeftPosition(this.selectedObj.startTime) // 起始x坐标（不带border）
        const sx2 = +this.getLeftPosition(this.selectedObj.startTime) - +this.config.dragBorderWidth // 起始x坐标（带border）
        const ex1 = +this.getLeftPosition(this.selectedObj.endTime) // 截止x坐标(不带border)
        const ex2 = +this.getLeftPosition(this.selectedObj.endTime) + +this.config.dragBorderWidth // 截止x坐标(带border)
        if (sx2 <= x && x <= sx1) {
          this.dragDirection = 'L'
        }
        if (ex1 <= x && x <= ex2) {
          this.dragDirection = 'R'
        }
      } else {
        this.isDragging = false
        this.selectedObj = {}
        this.dragDirection = ''
      }
      this.originX = x
    },
    mouseMove (e) {
      if (!this.selectedObj.dragable || !this.config.dragable) return
      if (this.isDragging) {
        const ssx = +this.getLeftPosition(this.selectedObj.startTime)
        const sex = +ssx + +this.getBlockWidth(this.selectedObj.startTime, this.selectedObj.endTime)
        const x = e.pageX - $(this.cvsDom).offset().left
        let offset = x - this.originX
        const list = this.deepCopy(this.timeSlices)
        let thePre = {}
        let theNext = {}
        list.forEach((item, index) => {
          if (item.selected) {
            thePre = list[index - 1] || {
              endTime: '00:00:00'
            }
            theNext = list[index + 1] || {
              startTime: '23:59:59'
            }
          }
        })
        let minOffset = 0
        let maxOffset = 0
        if (this.dragDirection === 'L') {
          minOffset = +this.getLeftPosition(thePre.endTime) - ssx
          maxOffset = +this.getBlockWidth(this.selectedObj.startTime, this.selectedObj.endTime)
        } else if (this.dragDirection === 'R') {
          minOffset = -this.getBlockWidth(this.selectedObj.startTime, this.selectedObj.endTime)
          maxOffset = +this.getLeftPosition(theNext.startTime) - sex
        } else {
          minOffset = +this.getLeftPosition(thePre.endTime) - ssx
          maxOffset = +this.getLeftPosition(theNext.startTime) - sex
        }
        if (this.dragDirection === 'R') {
          minOffset = minOffset + +this.unitWidth
        }
        if (this.dragDirection === 'L') {
          maxOffset = maxOffset - +this.unitWidth
        }
        if (offset < minOffset) {
          offset = minOffset // 偏移量界限
        } else if (offset > maxOffset) {
          offset = maxOffset // 偏移量界限
        }
        let sx = +ssx + offset
        let ex = +sex + offset
        if (this.dragDirection === 'L') {
          list.forEach((item) => {
            if (item.selected) {
              const arr = item.startTime.split(':')
              const sseds = arr[arr.length - 1]
              item.startTime = timeUtil.length2Time(sx, this.unitWidth, this.config.unit, this.config.dragBorderWidth, sseds)
            }
          })
        } else if (this.dragDirection === 'R') {
          list.forEach((item) => {
            if (item.selected) {
              const arr = item.endTime.split(':')
              const eseds = arr[arr.length - 1]
              item.endTime = timeUtil.length2Time(ex, this.unitWidth, this.config.unit, this.config.dragBorderWidth, eseds)
            }
          })
        } else {
          list.forEach((item) => {
            if (item.selected) {
              const arr1 = item.startTime.split(':')
              const sseds = arr1[arr1.length - 1]
              const arr2 = item.endTime.split(':')
              const eseds = arr2[arr2.length - 1]
              item.startTime = timeUtil.length2Time(sx, this.unitWidth, this.config.unit, this.config.dragBorderWidth, sseds)
              item.endTime = timeUtil.length2Time(ex, this.unitWidth, this.config.unit, this.config.dragBorderWidth, eseds)
            }
          })
        }
        this.timeSlices = list
      }
    },
    mouseUp (e) {
      this.hub.$emit('cleanOtherSelected', this.idx)
      const list = this.deepCopy(this.timeSlices)
      if (this.isDragging) {
        list.forEach((item) => {
          item.selected = false
        })
        // 重绘
        this.timeSlices = list
        this.isDragging = false
      } else {
        // 取得画布上被单击的点
        const x = e.pageX - $(this.cvsDom).offset().left
        let evtType = 0 // 事件类型，0新增， 1选中
        list.forEach((item) => {
          const sx = +this.getLeftPosition(item.startTime)
          const ex = sx + (+this.getBlockWidth(item.startTime, item.endTime))
          if (sx <= x && x <= ex) {
            evtType = 1
            item.selected = true
          } else {
            item.selected = false
          }
        })
        // 重绘
        this.timeSlices = list
        if (this.config.addSliceFlag && !evtType && Math.abs(x - this.originX) < 5) {
          // 新增时间段
          this.addTimeBlock(x)
        }
      }
    },
    clickLeftButton () {
      const fun = this.buttonMethods[this.config.editAreaConfig.leftFunValue]
      typeof fun === 'function' && fun(this.thisObj, this.idx)
    },
    clickCenterButton () {
      const fun = this.buttonMethods[this.config.editAreaConfig.centerFunValue]
      typeof fun === 'function' && fun(this.thisObj, this.idx)
    },
    clickRightButton () {
      const fun = this.buttonMethods[this.config.editAreaConfig.rightFunValue]
      typeof fun === 'function' && fun(this.thisObj, this.idx)
    },
    dispatchReduce () {
      this.hub.$emit('timeLineChecked', this.id, false)
      this.hub.$emit('reduceTimeLine', this.idx)
    },
    dispatchAdd () {
      this.hub.$emit('addTimeLine', this.idx)
    },
    getData () {
      return this.deepCopy({
        _id: this.id,
        title: this.title,
        config: this.config,
        timeSlices: this.timeSlices
      })
    }
  },
  watch: {
    list () {
      this.init()
    },
    timeSlices () {
      this.drawTimeBlocks()
    },
    checkedFlag () {
      let flag = false
      if (this.checkedFlag.length > 0) flag = true
      this.hub.$emit('timeLineChecked', this.id, flag)
    }
  }
}
</script>
<style lang="less" scoped>
.time-line {
  display: flex;
  .title-wrapper {
    .title {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      box-sizing: border-box;
      text-align: right;
      margin: 10px 0;
      padding: 0 5px;
      color: #606266;
      ul {
        max-width: 80%;
      }
      li {
        padding-left: 5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .multi{
        transform: scale(0.8);
        transform-origin: right;
      }
      .multi:first-of-type {
        font-weight: bold;
        transform: scale(1);
      }
    }
  }
  .time-line-wrapper {
    margin: 10px 0;
    border: 0;
    line-height: 0;
    outline: 0;
    .staff {
      height: 20px;
    }
    .time-base {
      position: relative;
      .time-item {
        position: absolute;
        bottom: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #333;
        transform: translate3d(-50%, 100%, 0);
      }
      .editArea {
        user-select: none;
        position: absolute;
        width: 140px;
        transform: translate3d(-50%, 0, 0);
        padding: 20px 10px;
        background: rgba(0, 0, 0, 0.8);
        text-align: center;
        color: #fff;
        font-size: 14px;
        line-height: 20px;
        .content {
          padding: 10px 0;
          font-size: 12px;
          line-height: 18px;
          word-break: break-word;
        }
        .operate {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: absolute;
          bottom: 8px;
          width: 140px;
          button {
            flex: 1;
            background: transparent;
            border: 0;
            padding: 0;
            color: #427BC4;
            font-size: 14px;
            line-height: 14px;
            outline: none;
          }
        }
      }
      .point-line {
        position: absolute;
        bottom: 0;
        width: 1px;
        background: rgba(0, 0, 0, 0.8);
      }
    }
  }
  .tail-wrapper {
    .tail {
      width: auto !important;
      margin: 10px 0;
      display: flex;
      align-items: center;
      img {
        width: 20px;
        margin: 5px;
      }
    }
  }
}
</style>
