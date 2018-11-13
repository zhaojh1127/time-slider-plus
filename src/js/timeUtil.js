const timeUtil = {
  getHours (timeStr) {
    const time = new Date(`2018-01-01 ${timeStr}`)
    return time.getHours()
  },
  getMinutes (timeStr) {
    const time = new Date(`2018-01-01 ${timeStr}`)
    return time.getMinutes()
  },
  getSeconds (timeStr) {
    const time = new Date(`2018-01-01 ${timeStr}`)
    return time.getSeconds()
  },
  // 格式化时间，秒清零
  formatHHmm (timeStr) {
    const time = new Date(`2018-01-01 ${timeStr}`)
    time.setSeconds(0)
    return `${time.getHours() > 9 ? time.getHours() : `0${time.getHours()}`}:${time.getMinutes() > 9 ? time.getMinutes() : `0${time.getMinutes()}`}:${time.getSeconds() > 9 ? time.getSeconds() : `0${time.getSeconds()}`}`
  },
  // 计算时间，type s: 秒 m: 分 h: 小时
  calculateTime (timeStr, num, type = 's') {
    const time = new Date(`2018-01-01 ${timeStr}`)
    if (type === 's') {
      time.setSeconds(time.getSeconds() + +num)
    } else if (type === 'm') {
      time.setMinutes(time.getMinutes() + +num)
    } else {
      time.setHours(time.getHours() + +num)
    }
    return `${time.getHours() > 9 ? time.getHours() : `0${time.getHours()}`}:${time.getMinutes() > 9 ? time.getMinutes() : `0${time.getMinutes()}`}:${time.getSeconds() > 9 ? time.getSeconds() : `0${time.getSeconds()}`}`
  },
  // 时间加减
  minusTime (timeStr1, timeStr2) {
    let time1 = new Date(`2018-01-01 ${timeStr1}`)
    let time2 = new Date(`2018-01-01 ${timeStr2}`)
    return time2.getTime() - time1.getTime()
  },
  length2Time (totalLength, unitWidth, unit, borderWidth, seds = '00') {
    const len = +totalLength - +borderWidth
    const totalMins = Math.round(len / (+unitWidth / +unit)) // 总分钟
    const hour = parseInt(totalMins / 60) // 总小时
    const min = totalMins - hour * 60
    return `${hour > 9 ? hour : `0${hour}`}:${min > 9 ? min : `0${min}`}:${seds}`
  }
}
export default timeUtil
