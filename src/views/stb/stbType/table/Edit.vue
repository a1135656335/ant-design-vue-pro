<template>
  <div>
    <a-form :form="form" @submit="handleSubmit">

      <a-form-item
          label="品牌"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
        <a-select
            :filter-option="true"
            placeholder="请选择"
            show-search
            v-decorator="[
            'brandId',
            {rules: [{ required: true, message: '请选择品牌'}]}]"
            @change="queryModelId"
        >
          <a-select-option v-for="brand in brands" :key="brand.id">
            {{ brand.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
          label="型号"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
        <a-select
            placeholder="请选择"
            :filter-option="true"
            show-search
            v-decorator="[
            'modelId',
            {rules: [{ required: true, message: '请选择类型' }]}]"
        >
          <a-select-option v-for="model in models" :key="model.id">
            {{ model.model }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="类型"
          hasFeedback
      >
        <a-input
            placeholder="请输入名字"
            v-decorator="[
            'stbType',
            {rules: [{ required: true, message: '请输入品牌名字'},
          { min: 2, max: 200, message: '长度在 2 到 200个字符' },
          { type: 'string', required: true, pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]{2,200}$/, message: '由汉字数字字母下划线组成'}]}
          ]"
        ></a-input>
      </a-form-item>

      <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="价格（单元：元）"
          hasFeedback
      >
        <a-input
            placeholder="请输入价格（单元：元）"
            v-decorator="[
            'price',
            {rules: [{ required: true, message: '请输入价格（单元：元）'}]}]"
            @blur="validatePriceBlur"
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
  import request from '@/utils/request'
  import pick from 'lodash.pick'
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
        version: '',
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
      validatePriceBlur (e) {
        const validatePriceReg = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/
        if (e.target.value && !validatePriceReg.toString().test(e.target.value)) {
          const arr = [{
            message: '请输入正确的价格（单元：元）!',
            field: 'price'
          }]
          this.form.setFields({ phone: { value: e.target.value, errors: arr } })
        }
      },
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
      handleSubmit (e) {
        const { form: { validateFields } } = this
        e.preventDefault()
        validateFields((err, values) => {
          values.id = this.id
          values.version = this.version
          console.log('values', JSON.stringify(values))
          if (!err) {
            request({
              url: '/stb/stbType/v1',
              method: 'POST',
              data: values
            }).then(ret => {
              if (ret.statusCode === 2000) {
                this.$message.success(ret.msg)
                this.form.resetFields()
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
        this.queryModelId(data.brandId)
        this.id = data.id
        this.version = data.version
        const { form } = this
        console.log(`将加载 ${data.id} 信息到表单`)
        const formData = pick(data, ['stbType', 'price', 'status', 'modelId', 'brandId'])
        form.setFieldsValue(formData)
      },
      queryModelId (val, option) {
        if (val !== '' && val !== undefined) {
          request({
            url: `/stb/models/${val}/v1`,
            method: 'get',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            }
          }).then(ret => {
            if (ret.statusCode === 2000) {
              this.models = ret.data
            }
          })
        } else {
          this.models = []
        }
      }
    }
  }
</script>
