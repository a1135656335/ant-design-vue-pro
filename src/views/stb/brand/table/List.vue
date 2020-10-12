<template>
  <div>
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleEdit()">新建</a-button>
      <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2"><a-icon type="lock" />锁定</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :alert="options.alert"
        :rowSelection="options.rowSelection"
    >
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
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
              <a href="javascript:;">详情</a>
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
  import { STable } from '@/components'
  import { getRoleList } from '@/api/manage'
  import request from '@/utils/request'
  import notification from 'ant-design-vue/es/notification'

  export default {
    name: 'TableList',
    components: {
      STable
    },
    data () {
      return {
        mdl: {},
        // 表头
        columns: [
          {
            title: 'ID',
            dataIndex: 'id',
            sorter: true
          },
          {
            title: '名字',
            dataIndex: 'name',
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
          return request({
            url: '/stb/brands/v1',
            method: 'get'
          }).then(res => {
            if (res.statusCode === 2000) {
              var result = {}
              result.pageSize = res.data.length
              result.pageNo = 1
              result.totalCount = res.data.length
              result.data = res.data
              result.totalPage = Math.ceil(res.data.total / res.data.size)
              return result
            } else {
              this.$message.error(res.msg)
            }
          })
        },
        selectedRowKeys: [],
        selectedRows: [],
        // custom table alert & rowSelection
        options: {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        },
        optionAlertShow: false
      }
    },
    created () {
      this.tableOption()
      getRoleList({ t: new Date() })
    },
    methods: {
      tableOption () {
        if (!this.optionAlertShow) {
          this.options = {
            alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
            rowSelection: {
              selectedRowKeys: this.selectedRowKeys,
              onChange: this.onSelectChange
            }
          }
          this.optionAlertShow = true
        } else {
          this.options = {
            alert: false,
            rowSelection: null
          }
          this.optionAlertShow = false
        }
      },
      handleEdit (record) {
        this.$emit('onAdd', record)
      },
      handleOk () {
      },
      onSelectChange (selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      toggleAdvanced () {
        this.advanced = !this.advanced
      },
      showDeleteConfirm (record) {
        var brands = [{ id: record.id }]
        var thisLocal = this
        this.$confirm({
          title: '警告',
          content: `真的要删除 ${record.name} 吗? 将会删除其关联的所有型号设备！`,
          okText: '删除',
          okType: 'danger',
          cancelText: '取消',
          onOk () {
            // 在这里调用删除接口
            return request({
              url: '/stb/brands/v1',
              method: 'delete',
              data: brands
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
    }
  }
</script>
