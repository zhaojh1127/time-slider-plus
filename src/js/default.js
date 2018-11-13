export default {
  titleWidth: '200', // 时间轴名称宽度
  width: '1000', // 时间轴宽度
  height: '50', // 时间轴高度
  staffTopRowFlag: true, // 首行展示标尺， 如果true，staffFlag无效
  staffFlag: false, // 是否展示标尺
  staffHeight: '30', // 标尺高度
  staffColor: '#333', // 标尺颜色
  staffFontType: '0', // 标尺数字类型，0 时间格式，1 数字格式
  staffFontSize: '12', // 标尺数字大小
  staffFontStyle: 'Verdana', // 标尺字体
  staffUnitWidth: '1', // 标尺刻度宽度
  staffUnitHeight: '10', // 标尺刻度高度
  defaultColor: '#9E9E9E', // 默认事件颜色
  dragBorderColor: 'rgba(0, 0, 0, 0.1)', // 拖拽边界颜色
  dragBorderWidth: '20',
  background: '#f2f2ee', // 时间轴背景色
  defaultEvent: '0', // 默认事件
  colors: {}, // 事件-颜色映射
  events: {}, // 事件-颜色映射
  cleanFlag: true, // 清空按钮
  copyFlag: true, // 复制按钮
  reduceFlag: true, // 增删按钮
  maxNum: '3', // 最大时间轴数，控制增删按钮
  unit: '1', // 最小单位
  addSliceFlag: true, // 时间轴新增时间片段标记
  dragable: true, // 是否可拉升
  editable: true, // 是否可编辑
  editAreaConfig: {
    contentKey: '', // 内容key值
    leftFunTxt: '', // 左侧按钮文案
    leftFunValue: '', // 左侧按钮事件派发
    rightFunTxt: '', // 右侧按钮文案
    rightFunValue: '' // 右侧按钮事件派发
  }
}
