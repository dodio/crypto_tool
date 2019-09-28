<template>
    <div ref="container" style="width:100%;height:100%;"></div>
</template>
<script>
import echarts from 'echarts';
export default {
  mounted () {
    this.ins = echarts.init(this.$refs.container);
    this.ins.on(this.$emit.bind(this));
  },
  beforeDestroy () {
    this.ins.dispose();
  }
};
</script>
