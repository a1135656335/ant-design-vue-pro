<template>
  <div>
    <a-form :form="form" @submit="handleSubmit">

      <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="名字"
          hasFeedback
      >
        <a-input
            placeholder="请输入名字"
            v-decorator="[
            'name',
            {rules: [{ required: true, message: '请输入品牌名字'},
          { min: 2, max: 200, message: '长度在 2 到 200个字符' },
          { type: 'string', required: true, pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]{2,200}$/, message: '由汉字数字字母下划线组成'}]}
          ]"
        ></a-input>
      </a-form-item>

      <a-form-item
          v-bind="buttonCol"
      >
        <a-row>
          <a-col :xs="{ span: 5, offset: 5 }" :lg="{ span: 5, offset: 5 }">
            <a-button type="primary" html-type="submit">提交</a-button>
          </a-col>
          <a-col :xs="{ span: 5, offset: 6}" :lg="{ span: 5, offset: 6 }">
            <a-button @click="handleGoBack">返回</a-button>
          </a-col>
          <a-col span="8"></a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
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
        form: this.$form.createForm(this),
        id: 0,
        otherData: {
          id: '',
          version: ''
        }
      }
    },
    // beforeCreate () {
    //   this.form = this.$form.createForm(this)
    // },
    mounted () {
      this.$nextTick(() => {
        this.loadEditInfo(this.record)
      })
    },
    methods: {
      handleGoBack () {
        this.$emit('onGoBack')
      },
      handleSubmit (e) {
        const { form: { validateFields } } = this
        e.preventDefault()
        validateFields((err, values) => {
          values.id = this.otherData.id
          values.version = this.otherData.version
          console.log('submit', values)
          if (!err) {
            request({
              url: '/stb/brand/v1',
              method: 'post',
              data: values
            }).then(ret => {
              if (ret.statusCode === 2000) {
                this.$message.success(ret.msg)
                this.otherData = { id: '', version: '' }
                this.handleGoBack()
              } else {
                this.$message.error(ret.msg)
              }
            })
          }
        })
        return false
      },
      handleGetInfo () {
        console.log(`将加载 ${this.id} 信息到表单`)
      },
      loadEditInfo (data) {
        // 放入值代码
        const { form } = this
        this.otherData.id = data.id
        this.otherData.version = data.version
        const formData = pick(data, ['name'])
        form.setFieldsValue(formData)
      }
    }
  }
</script>
