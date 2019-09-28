<template>
    <Echart ref="chart" @click="itemClick"></Echart>
</template>

<script>
import Echart from './Echart';
import _ from 'lodash';

export default {
    components: {
        Echart
    },
    props: {
        dataObj: Object,
        title: {
            type: String,
            default: '饼图分析默认标题'
        },
    },
    mounted() {
        const chart = this.$refs.chart.ins;
        const dataObj = this.dataObj;
        const echartData = Object.keys(dataObj).map(key => {
            return {
                name: key,
                value: dataObj[key].length,
                klines: dataObj[key],
            }
        });
        chart.setOption({
            tooltip: {
                show: true,
                formatter: '{b} : {c} ( {d}% )',
            },
            legend: {
                show: true,
                left: 0,
                top: 'middle',
                orient: 'vertical',
            },
            title: {
                show: true,
                text: this.title,
                textAlign: 'center',
                left: 'middle',
                top: 'top'
            },
            series: [
                {
                    type: 'pie',
                    data: echartData
                }
            ]
        })
    },
    methods: {
        itemClick(p) {
            this.$emit('item-click', p.data);
        }
    }
}
</script>