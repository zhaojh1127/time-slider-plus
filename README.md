# time-slider-plus

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# doc
``` bash
# 查看demo
npm run dev

# 打包
1. npm run build  
2. npm pack #生成time-slider-plus-x.x.x.tgz 

# 使用（需使用该插件的目录下）
3. npm install ..../time-slider-plus-x.x.x.tgz # 注意文件路径
4. import TimeSliders from 'time-slider-plus'
   import 'time-slider-plus/dist/time-slider.min.css'
   Vue.use(TimeSliders)
5. <TimeSliders ref="timeSliders" :config="config" :list="list" :buttonMethods="buttonMethods()"/>
6. this.$refs.timeSliders.getData()
```
## parameter

参数名 | 类型 | 默认值 | 说明
-| -| -| -
config | objcet | | 时间轴统一配置|
&emsp;width | number | 1000 | 时间轴宽度(不含borderWidth)
&emsp;height | number | 50 | 时间轴高度
&emsp;background | string | #f2f2ee | 时间轴背景色(不含borderWidth)
&emsp;titleWidth | number | 200 | 时间轴title宽度
&emsp;titlePreFix | string |  | 时间轴名称的前缀，如果存在，则新增过程不需要输入title
&emsp;staffTopRowFlag | boolean | true | 首个时间轴展示标尺，其值为true，则staffFlag配置无效
&emsp;staffFlag | boolean | false | 时间轴展示标尺标记
&emsp;staffHeight | number | 30 | 标尺高度
&emsp;staffColor | string | #333 | 标尺颜色
&emsp;staffFontType | number | 0 | 标尺展示类型，0时间格式（23:59），1数字格式（23）
&emsp;staffFontSize | number | 12 | 标尺文字大小
&emsp;staffFontStyle | string | Verdana | 标尺文字字体
&emsp;staffUnitWidth | number | 1 | 标尺刻度宽度
&emsp;staffUnitHeight | number | 10 | 标尺刻度高度
&emsp;dragBorderWidth | number | 20 | 时间片侧翼拖拽区域宽度
&emsp;dragBorderColor | string | rgba(0, 0, 0, 0.1) | 时间片侧翼拖拽区域宽度
&emsp;**defaultEvent** | string | 0 | 默认事件key值, key值为传参list各节点的type
&emsp;defaultColor | string | #9E9E9E | 默认时间片颜色
&emsp;**colors** | object | {} | 事件key-颜色映射，key值为传参list各节点的type
&emsp;**events** | object | {} | 事件key-事件名称映射，key值为传参list各节点的type
&emsp;**cleanFlag** | boolean | true | 清除按钮展示标记
&emsp;**copyFlag** | boolean | true | 复制按钮展示标记
&emsp;**reduceFlag** | boolean | true | + -按钮展示标记
&emsp;**maxNum** | number | 3 | 最大时间轴数，控制+按钮是否可点击
&emsp;unit | number | 1 | 时间轴内最小单位（分钟）
&emsp;**addSliceFlag** | boolean | true | 点击时间轴新增时间片标记
&emsp;**dragable** | boolean | true | 时间片可拖动/拉伸标记
&emsp;**editable** | boolean | true | 时间片可编辑标记，编辑区域展示事件按钮
&emsp;**editAreaConfig** | object |  | 编辑区域相关配置
&emsp;&emsp;**contentKey** | string |  | 展示内容key值，与传参list各节点的属性对应
&emsp;&emsp;**leftFunTxt** | string |  | 左侧按文案
&emsp;&emsp;**leftFunValue** | string |  | 左侧事件名称，与传参buttonMethods各节点的key值对应
&emsp;&emsp;**rightFunTxt** | string |  | 右侧按文案
&emsp;&emsp;**rightFunValue** | string |  | 右侧事件名称，与传参buttonMethods各节点的key值对应
&emsp;&emsp;**centerFunTxt** | string |  | 中间按文案
&emsp;&emsp;**centerFunValue** | string |  | 中间事件名称，与传参buttonMethods各节点的key值对应
list | list(object) | | 时间轴列表
&emsp;title| array | | 时间轴名称，多个的话，存在主副标题，主标题为第一个
&emsp;config| object | 同上config | 时间轴特定配置，优先级高于统一配置
&emsp;timeSlices| array(object) |  | 时间片段列表
&emsp;&emsp;**type**| string |  | 时间片类型，对应config中colors，events
&emsp;&emsp;**startTime**| string | xx:xx:xx | 时间片开始时间
&emsp;&emsp;**endTime**| string | xx:xx:xx | 时间片结束时间
&emsp;&emsp;**dragable**| boolean | true | 时间片是否可拖拽/拉伸，优先级高于config中dragable
&emsp;&emsp;**editable**| boolean | true | 时间片是否可编辑，优先级高于config中editable
&emsp;&emsp;**...**| ... | ... | 其他自定义属性，可用于对应config.editAreaConfig.contentKey展示编辑框内容，或者其他标示属性用于后续操作
buttonMethods | obj | | 用于config.editAreaConfig中按钮方法回调，key对应config.editAreaConfig.leftFunValue或者config.editAreaConfig.rightFunValue，value为回调函数，回调函数arguments[0]为当前操作时间段对象，arguments[1]为当前操作时间轴的下标

## method
方法 | 说明
-| -|
getListData | 获取当前组件所有时间片段列表集合（this.$refs.timeSliders.getListData()，可运用getListData获取列表数据，根据editAreaConfig配置相关回调方法，以此更改list，从而重绘时间轴，达到编辑/删除/...功能

## callback
方法 | 说明
-| -|
callback | 进行时间轴操作的时候，时间轴会出发callback方法，传参为操作类型，add/reduce/clean/copy/config/list