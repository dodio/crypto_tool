<template>
  <div class="diffrence">
    <el-row>
      <el-col :span="8">
        <ApiOpener />
      </el-col>
      <el-col :span="8">
        <el-form>
          <el-form-item label="k线数据2">
              <el-input type="textarea" v-model="kline1" placeholder="填入获取的K线数据"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="8">
        <el-form>
          <el-form-item label="k线数据2">
              <el-input type="textarea" v-model="kline2" placeholder="填入获取的K线数据"></el-input>
          </el-form-item>
          <el-button type="primary" @click="analysis">分析</el-button>
        </el-form>
      </el-col>
      <el-col :span="24">
          <Echart ref="high" style="height: 500px"/>
      </el-col>
      <el-col :span="24">
          <Echart ref="low" style="height: 500px"/>
      </el-col>
      <el-col :span="24">
          <Echart ref="close" style="height: 500px"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ApiOpener from '../components/ApiOpener';
import Echart from '../components/Echart';
import { parseKlineData, WEEKDAYS} from '../klineUtil';
export default {
  components: {
    ApiOpener,
    Echart
  },
  data() {
    return {
      kline1: '',
      kline2: '',
    }
  },
  methods: {
    analysis() {
      if(!this.kline1 || !this.kline2) {
        return this.$message({
          message: '输入k线数据',
          type: 'error'
        });
      }
      try {
        const klineData1 = parseKlineData(this.kline1);
        const klineData2 = parseKlineData(this.kline2);
        if(!klineData1.klineInfo || !klineData2.klineInfo) {
          throw new Error('数据缺少k线的详细信息');
        }
        const info1 = klineData1.klineInfo;
        const info2 = klineData2.klineInfo;
        if(info1.symbol !== info2.symbol) {
          throw new Error(`两组数据使用的不是同一个数字货币，${info1.symbol}与${info2.symbol}`);
        }
        if(info1.peroid !== info2.peroid) {
          throw new Error(`两组数据使用的k线周期不一样: ${info1.peroid}与${info2.peroid}`);
        }
        if(info1.contractType === info2.contractType) {
          throw new Error(`两组数据使用相同合约：${info1.contractType}，对比无意义`);
        }
        if(klineData1.klines.length !== klineData2.klines.length) {
          throw new Error(`两组数据的数量不同：${klineData1.klines.length}与${klineData2.klines.length}`)
        }
        if(klineData1.klines[0].datetime !== klineData2.klines[0].datetime) {
          throw new Error(`两组数据的起始时间不同：${klineData1.klines[0].datetime}与${klineData2.klines[0].datetime}`)
        }
        

        this.setChart(klineData1, klineData2, 'high', 'highIncrease', '最高价')
        this.setChart(klineData1, klineData2, 'low', 'lowDescrease', '最低价')
        this.setChart(klineData1, klineData2, 'close', 'closePercent', '收盘价')
      } catch(err) {
        console.error(err);
        this.$message(err.message);
        return;
      }
    },
    setChart(data1, data2, key, key2, titleName) {
        const info1 = data1.klineInfo;
        const info2 = data2.klineInfo;
        const chart = this.$refs[key].ins;
        const typeName = {
          CW: '本周',
          NW: '次周',
          CQ: '当季'
        };

        chart.setOption({
          title: {
            text: `${info1.symbol}${typeName[info1.contractType]}与${info2.symbol}${typeName[info2.contractType]}的${info1.peroid}k线${titleName}对比`
          },
          yAxis: [{
            type: 'value'
          },{
            type: 'value',
            axisLabel: {
              formatter(val) {
                return `${(val * 100).toFixed(2)}%`
              }
            }
          },],
          xAxis: {
            type: 'category',
            data: data1.klines.map(k => k.datetime),
          },
          tooltip: {
            trigger: 'axis',
            formatter(p) {
              if(p.length !== 4) {
                return '不隐藏线条才方便显示';
              }
              const diffrencePercent = p[2].value - p[3].value;

              return `${p[0].name}<br/>
              <b>${p[0].seriesName}：${p[0].value}（${(p[2].value * 100).toFixed(2)}%）</b><br/>
              <b>${p[1].seriesName}：${p[1].value}（${(p[3].value * 100).toFixed(2)}%）</b><br/>
              幅度相差：${(diffrencePercent * 100).toFixed(2)}%
              `
            }
          },
          series: [
            {
              type: 'line',
              name: typeName[info1.contractType],
              data: data1.klines.map(k => k[key]),
              lineStyle: {
                width: 3
              },
              yAxisIndex: 0
            },
            {
              type: 'line',
              name: typeName[info2.contractType],
              data: data2.klines.map(k => k[key]),
              yAxisIndex: 0,
              lineStyle: {
                width: 3
              }
            },
            {
              type: 'line',
              name: typeName[info1.contractType] + '百分比',
              data: data1.klines.map(k => k[key2]),
              yAxisIndex: 1,
              lineStyle: {
                width: 3
              }
            },
            {
              type: 'line',
              name: typeName[info2.contractType] + '比分比',
              data: data2.klines.map(k => k[key2]),
              yAxisIndex: 1,
              lineStyle: {
                width: 3
              }
            },
          ],
          dataZoom: {
            type: 'slider',
            show: true,
          },
          legend: {
            show: true,
          }
        });
    }
  }
}
</script>