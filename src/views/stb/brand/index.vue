<template>
  <a-card :bordered="false">
    <component @onAdd="handleAdd" @onEdit="handleEdit" @onGoBack="handleGoBack" :record="record" :is="currentComponet"></component>
  </a-card>
</template>

<script>
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import AInput from 'ant-design-vue/es/input/Input'
  // 动态切换组件
  import List from './table/List'
  import Edit from './table/Edit'
  import Add from './table/Add'
  export default {
    name: 'TableListWrapper',
    components: {
      AInput,
      ATextarea,
      List,
      Add,
      Edit
    },
    data () {
      return {
        currentComponet: 'List',
        record: ''
      }
    },
    created () {
    },
    methods: {
      handleAdd (record) {
        this.record = record || ''
        this.currentComponet = 'Add'
        console.log('record', record)
      },
      handleEdit (record) {
        this.record = record || ''
        this.currentComponet = 'Edit'
        console.log('record', record)
      },
      handleGoBack () {
        this.record = ''
        this.currentComponet = 'List'
      }
    },
    watch: {
      '$route.path' () {
        this.record = ''
        this.currentComponet = 'List'
      }
    }
  }
</script>
