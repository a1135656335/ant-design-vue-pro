<template>
  <div>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="品牌">
              <a-select
                  v-model="queryBrandId"
                  :filter-option="true"
                  placeholder="请选择"
                  show-search
              >
                <a-select-option v-for="brand in brands" :key="brand.id">
                  {{ brand.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="型号">
              <a-select
                  v-model="queryParam.modelId"
                  placeholder="请选择"
                  :filter-option="true"
                  show-search
              >
                <a-select-option v-for="model in models" :key="model.id">
                  {{ model.model }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row type="flex" justify="space-around" align="middle">
          <a-col style="margin-bottom: 2em">
            <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
            <a-button style="margin-left: 8px" @click="() => {queryParam = {}; queryBrandId=''}">重置</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-divider />
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd()">新建</a-button>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="id"
      :columns="columns"
      :data="loadData">
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
        </template>
        <a-dropdown>
          <a class="ant-dropdown-link">
            更多 <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="handleDetail(record)">详情</a>
            </a-menu-item>
            <a-menu-item v-if="$auth('table.disable')">
              <a href="javascript:;">禁用</a>
            </a-menu-item>
            <a-menu-item>
              <a @click="showDeleteConfirm (record)">删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </s-table>
  </div>
</template>

<script>
import moment from 'moment'
import { STable } from '@/components'
import { getRoleList } from '@/api/manage'
import notification from 'ant-design-vue/es/notification'
import request from '@/utils/request'

export default {
  name: 'TableList',
  components: {
    STable
  },
  data () {
    return {
      mdl: {},
      queryBrandId: '',
      // 查询参数
      queryParam: {
        brandId: '',
        modelId: ''
      },
      brands: [{
        id: '',
        name: ''
      }],
      models: [{
        id: '',
        model: '',
        brandId: ''
        }],
      // 表头
      columns: [
        {
          title: '品牌',
          dataIndex: 'brandName',
          sorter: true
        },
        {
          title: '型号',
          dataIndex: 'modelName',
          sorter: true
        },
        {
          title: '类型',
          dataIndex: 'stbType',
          sorter: true
        },
        {
          title: '价格（元）',
          dataIndex: 'price',
          sorter: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '150px',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        console.log('loadData.parameter', parameter)
        var queryStr = ''
        if (this.queryBrandId !== undefined && this.queryBrandId !== '') {
          queryStr = `&brandId=${this.queryBrandId}`
        }
        if (this.queryParam.modelId !== undefined && this.queryParam.modelId !== '') {
          queryStr = `${queryStr}&modelId=${this.queryParam.modelId}`
        }
        console.log(queryStr)
        return request({
          url: `/stb/stbTypes/v1?size=${parameter.pageSize}&current=${parameter.pageNo}${queryStr}`,
          method: 'get'
        }).then(res => {
          var result = {}
          result.pageSize = res.data.size
          result.pageNo = res.data.current
          result.totalCount = res.data.total
          result.data = res.data.records
          result.totalPage = Math.ceil(res.data.total / res.data.size)
          return result
        })
      },
      selectedRowKeys: [],
      selectedRows: [],

      optionAlertShow: false
    }
  },
  created () {
    this.tableOption()
    getRoleList({ t: new Date() })
    this.handleSearch()
  },
  methods: {
    tableOption () {
    },
    handleAdd (record) {
      this.$emit('onAdd', record)
    },
    handleDetail (record) {
      this.$emit('onDetail', record)
    },
    handleEdit (record) {
      console.log(`record: ${JSON.stringify(record)}`)
      this.$emit('onEdit', record)
    },
    handleOk () {

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
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    },
    showDeleteConfirm (record) {
      var thisLocal = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${record.stbType} 吗? `,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          // 在这里调用删除接口
          return request({
            url: `/stb/stbType/${record.id}/v1`,
            method: 'delete'
          }).then(ret => {
            if (ret.statusCode === 2000) {
              thisLocal.$message.success(ret.msg)
              thisLocal.$refs.table.refresh(true)
            } else {
              notification.error({
                message: '删除失败',
                description: ret.msg
              })
            }
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    }
  },
  watch: {
    queryBrandId (val) {
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
