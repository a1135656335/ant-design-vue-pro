<template>
  <div>
    <a-form :model="form">

      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="品牌"
        hasFeedback>
        <a-input :disabled="true" v-model="form.brandName"></a-input>
      </a-form-item>

      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="型号"
        hasFeedback>
        <a-input :disabled="true" v-model="form.modelName"></a-input>
      </a-form-item>

      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="类型"
        hasFeedback>
        <a-input :disabled="true" v-model="form.stbType"></a-input>
      </a-form-item>

      <a-form-item
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
        label="价格（单位：元）"
        hasFeedback>
        <a-input :disabled="true" v-model="form.price"></a-input>
      </a-form-item>

      <a-form-item>
        <a-row type="flex" justify="start">
          <div id="stbType-price" style="width: 100%;height:30em;"></div>
        </a-row>
      </a-form-item>

      <a-form-item
        v-bind="buttonCol"
      >
        <a-row type="flex" justify="space-around" align="middle">
          <a-col :xs="{ span: 5, offset: 1 }" :lg="{ span: 6, offset: 2 }">
            <a-button @click="handleGoBack">返回</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import pick from 'lodash.pick'
import echarts from 'echarts'
import request from '@/utils/request'

export default {
  name: 'TableEdit',
  props: {
    record: {
      type: [Object, String],
      default: ''
    }
  },
  data () {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 }
      },
      buttonCol: {
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12, offset: 5 }
        }
      },
      form: {},
      id: 0
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.loadEditInfo(this.record)
    })
  },
  methods: {
    handleGoBack () {
      this.$emit('onGoBack')
    },
    handleSubmit () {
      const { form: { validateFields } } = this
      validateFields((err, values) => {
        if (!err) {
          // eslint-disable-next-line no-console
          console.log('Received values of form: ', values)
        }
      })
    },
    handleGetInfo () {

    },
    loadEditInfo (data) {
      const { form } = this
      // ajax
      console.log(`将加载 ${data.id} 信息到表单`)
      this.stbTypePrice(data.id)
      const formData = pick(data, ['id', 'brandName', 'modelName', 'stbType', 'price'])
      console.log('formData', formData)
      this.form = formData
      console.log('form', form)
    },
    stbTypePrice (id) {
      var myChart = echarts.init(document.getElementById('stbType-price'))
      window.onresize = myChart.resize()
      request({
        url: `/stb/stbType/${id}/v1`,
        method: 'get'
      }).then(ret => {
        if (ret.statusCode === 2000) {
          var stbPriceRecords = ret.data.stbPriceRecords
          var timestampToTime2 = function (timestamp) {
            var date = new Date(timestamp * 1000)
            var y = date.getFullYear()
            let MM = date.getMonth() + 1
            MM = MM < 10 ? ('0' + MM) : MM
            let d = date.getDate()
            d = d < 10 ? ('0' + d) : d
            let h = date.getHours()
            h = h < 10 ? ('0' + h) : h
            let m = date.getMinutes()
            m = m < 10 ? ('0' + m) : m
            let s = date.getSeconds()
            s = s < 10 ? ('0' + s) : s
            return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
          }
          if (stbPriceRecords !== null && stbPriceRecords !== undefined) {
            // 指定图表的配置项和数据
            myChart.setOption({
              title: {
                text: '价格变动(单位：元)'
              },
              tooltip: {
                trigger: 'axis'
              },
              xAxis: {
                data: stbPriceRecords.map(function (item) {
                  return timestampToTime2(item.createTime)
                })
              },
              yAxis: {
                splitLine: {
                  show: false
                }
              },
              toolbox: {
                left: 'center',
                top: '6%',
                feature: {
                  dataZoom: {
                    yAxisIndex: 'none'
                  },
                  restore: {},
                  saveAsImage: {}
                }
              },
              dataZoom: [{
                startValue: '2020-10-01'
              }, {
                type: 'inside'
              }],
              series: {
                name: '价格',
                type: 'line',
                data: stbPriceRecords.map(function (item) {
                  return item.price
                }),
                markLine: {
                  silent: true,
                  data: [{
                    yAxis: 50
                  }, {
                    yAxis: 100
                  }, {
                    yAxis: 150
                  }, {
                    yAxis: 200
                  }, {
                    yAxis: 300
                  }]
                }
              }
            })
          }
        }
      })
      // console.log(`打开dialog${myChart.toString()}`)
    }
  }
}
</script>
