<template>
  <div>
    <a-form :form="form">

      <a-form-item
          label="品牌"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
        <a-select
            :filter-option="true"
            show-search
            :disabled="true"
            v-decorator="[
            'brandId']"
        >
          <a-select-option v-for="brand in brands" :key="brand.id">
            {{ brand.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="型号"
          hasFeedback
      >
        <a-input
            :disabled="true"
            v-decorator="[
            'model']"
        ></a-input>
      </a-form-item>

      <a-form-item
          v-bind="buttonCol"
      >
        <a-row>
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
  import request from '@/utils/request'
  import pick from 'lodash.pick'
  export default {
    name: 'TableDetail',
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
        brands: [{
          id: '',
          name: ''
        }],
        models: [{
          id: '',
          model: '',
          brandId: ''
        }],
        queryBrandId: '',
        // 查询参数
        queryParam: {
          brandId: '',
          modelId: ''
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
    created () {
      this.handleSearch()
    },
    methods: {
      handleSearch () {
        request({
          url: '/stb/brands/v1',
          method: 'get',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          }
        }).then(ret => {
          if (ret.statusCode === 2000) {
            this.brands = ret.data
          }
        })
      },
      handleGoBack () {
        this.$emit('onGoBack')
      },
      validateNameBlur (e) {
        const validateNameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]{2,200}$/
        if (e.target.value || !validateNameReg.test(e.target.value)) {
          console.log('e', e)
          const arr = [{
            message: '由汉字数字字母下划线组成!',
            field: 'name'
          }]
          this.form.setFields({ name: { value: e.target.value, errors: arr } })
        }
      },
      handleGetInfo () {
        console.log(`将加载 ${this.id} 信息到表单`)
      },
      loadEditInfo (data) {
        this.id = data.id
        const { form } = this
        console.log(`将加载 ${data.id} 信息到表单`)
        const formData = pick(data, ['model', 'brandId'])
        form.setFieldsValue(formData)
      }
    }
  }
</script>
