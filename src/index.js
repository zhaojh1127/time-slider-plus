import timeSliders from './components/TimeSliders.vue'

const TimeSliders = {}
TimeSliders.install = (Vue) => {
  if (typeof window !== 'undefined' && window.Vue) {
    Vue = window.Vue
  }
  Vue.component('TimeSliders', timeSliders)
}

export default TimeSliders
