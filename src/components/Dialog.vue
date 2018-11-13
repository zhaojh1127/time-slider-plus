<template>
  <div class="dialog" v-show="dialogFlag">
    <div class="dialog-box">
      <p class="dialog-title">{{title}}</p>
      <slot></slot>
      <div class="operate">
        <button  @click="leftFun" v-show="leftFlag">{{leftTxt}}</button>
        <button @click="rightFun" v-show="rightFlag">{{rightTxt}}</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    dialogFlag: {
      type: Boolean,
      default () {
        return false
      }
    },
    title: {
      type: String,
      default () {
        return ''
      }
    },
    leftFlag: {
      type: Boolean,
      default () {
        return true
      }
    },
    leftTxt: {
      type: String,
      default () {
        return '确定'
      }
    },
    leftFun: {
      type: Function,
      default () {
        return () => {}
      }
    },
    rightFlag: {
      type: Boolean,
      default () {
        return true
      }
    },
    rightTxt: {
      type: String,
      default () {
        return '取消'
      }
    },
    rightFun: {
      type: Function,
      default () {
        return () => {}
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    .dialog-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      width: 200px;
      background: #fff;
      border-radius: 3px;
      .dialog-title {
        padding: 5px;
        font-size: 16px;
        line-height: 30px;
        font-weight: bold;
        color: #999;
        border-bottom: 1px solid #ccc;
      }
      ul {
        max-height: 400px;
        overflow: scroll;
        li {
          display: flex;
          align-items: center;
          padding: 10px 10px 0;
          color: #999;
          font-size: 14px;
          line-height: 28px;
          .right-part {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
      .operate {
        width: 100%;
        text-align: center;
        button {
          background: transparent;
          border: 0;
          padding: 5px 10px;
          margin: 10px;
          background: #427BC4;
          color: #fff;
          font-size: 14px;
          line-height: 14px;
          border-radius: 3px;
          outline: none;
        }
      }
    }
  }
</style>
