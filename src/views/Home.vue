<template>
  <div class="kline">
    <el-row>
      <el-col :span="12">
        <el-card>
          <h3 slot="header">选择k线数据</h3>
          <div>
            <el-select v-model="selectedSymbol">
              <el-option v-for="s in symbols" :value="s" :key="s">{{s}}</el-option>
            </el-select>
            <el-select v-model="selectedContract">
              <el-option v-for="t in contractType" :key="t.type" :value="t.type">{{t.name}}</el-option>
            </el-select>
            <el-select v-model="peroid">
              <el-option v-for="t in peroids" :key="t" :value="t">{{t}}</el-option>
            </el-select>
            <el-input-number v-model="size" :min="5" :step="1" label="数据量"></el-input-number>
            <el-button @click="openApi" type="primary">打开接口</el-button>
          </div>
          <el-alert type="info" :closable="false">火币合约api文档：<a href="https://huobiapi.github.io/docs/dm/v1/cn/#k" target="_blank" rel="noopener noreferrer">https://huobiapi.github.io/docs/dm/v1/cn/#k</a></el-alert>
          <el-form style="margin-top: 20px;">
            <el-form-item label="k线数据">
              <el-input type="textarea" v-model="klineData" placeholder="填入获取的K线数据"></el-input>
            </el-form-item>
            <el-form-item label="最大波幅">
              <el-input-number v-model="maxPercent" @change="analysis" :step="0.01" :min="0.05" :max="1"></el-input-number>
            </el-form-item>
            <el-form-item label="分隔区间">
              <el-input-number v-model="splitter" @change="analysis" :step="0.001" :min="0.001" :max="0.2"></el-input-number>
            </el-form-item>
            <el-form-item label="短影线百分比定义">
              <el-input-number v-model="shortPercent" @change="analysis" :step="0.001" :min="0.001" :max="0.2"></el-input-number>
            </el-form-item>
          </el-form>
            <el-button type="primary" @click="analysis">分析</el-button>
          </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <h3 slot="header">分析结果</h3>
          <div v-if="rs">
            <h4>数据信息</h4>
            <el-tag type="info">k线周期：{{rs.dataInfo}}</el-tag>
            <el-tag type="info">k线数据总量：{{rs.klineCount}}</el-tag>
            <el-tag type="info">k线起始时间：{{rs.firstKline.datetime}}</el-tag>
            <el-divider></el-divider>
            <h4>最新k线情况</h4>
            <el-alert :closeable="false">
              <el-tag>时间:{{rs.latestKline.datetime}}</el-tag><br>
              <el-tag type="info">开盘价:{{rs.latestKline.open}}</el-tag>
              <el-tag :type="rs.latestKline.close > rs.latestKline.open ? 'success' : 'danger'">收盘价:{{rs.latestKline.close}}，{{(rs.latestKline.closePercent * 100).toFixed(2)}}%</el-tag>
              <el-tag type="danger">最低价:{{rs.latestKline.low}}，{{(rs.latestKline.lowDescrease * 100).toFixed(2)}}%</el-tag>
              <el-tag type="success">最高价:{{rs.latestKline.high}}，{{(rs.latestKline.highIncrease * 100).toFixed(2)}}%</el-tag>
            </el-alert>
            <el-divider></el-divider>
            <el-tag type="info">短上影线：{{rs.shortHigh}}次，{{(rs.shortHigh * 100 / rs.klineCount).toFixed(2)}}%</el-tag>
            <el-tag type="info">短下影线：{{rs.shortLow}}次，{{(rs.shortLow * 100 / rs.klineCount).toFixed(2)}}%</el-tag>
            <el-tag type="info">涨：{{rs.upCount}}次，{{(rs.upCount * 100 / rs.klineCount).toFixed(2)}}%</el-tag>
            <el-tag type="info">跌：{{rs.downCount}}次，{{(rs.downCount * 100 / rs.klineCount).toFixed(2)}}%</el-tag>
          </div>
        </el-card>        
      </el-col>
      <el-col :span="24">
        <div ref="chart" style="width: 100%; height: 500px;margin-top: 20px;"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// @ is an alias to /src
import echarts from 'echarts';
import moment from 'moment';
import _ from 'lodash';

export default {
      data() {
        return {
          klineData: '',
          maxPercent: 0.1,
          splitter: 0.01,
          shortPercent: 0.002,
          selectedSymbol: 'BTC',
          selectedContract: 'CQ',
          size: 100,
          peroid: '1day',

          symbols: 'BTC,ETH,EOS,LTC,BSV,BCH,XRP,TRX'.split(','),
          contractType: [
            {
              type: 'CW',
              name: '当周',
            },
            {
              type: 'NW',
              name: '次周',
            },
            {
              type: 'CQ',
              name: '当季',
            }
          ],
          peroids: '1min,5min,15min,30min,60min,4hour,1day,1mon'.split(','),
          rs: null
        }
      },
      mounted() {
        this.echart = echarts.init(this.$refs.chart);
      },
      beforeDestory() {
        this.echart.dispose();
      },
      methods: {
        openApi() {
          const url = `https://api.hbdm.com/market/history/kline?symbol=${[this.selectedSymbol, this.selectedContract].join('_')}&period=${this.peroid}&size=${this.size}`;
          window.open(url);
        },
        getCategories() {
          const cates = [];
          const intervals = _.range(-this.maxPercent, this.maxPercent, this.splitter);
          intervals.forEach((v, idx, arr) => {
            const name = ( v * 100).toFixed(1) + '%';
            if(idx === 0) {
              cates.push({
                categoryName: '<' + name,
                cateValue: [-Infinity, v],
                cateValueOpen: [false, true],
                klines: []
              });
              return;
            }
            const lastValue = arr[idx-1];
            const lastValueName = ( lastValue * 100).toFixed(1) + '%';
            cates.push({
              categoryName: [`(${lastValueName})`, `(${name})`].join('—'),
              cateValue: [lastValue, v],
              cateValueOpen: lastValue < 0 ? [false, true] : [true, false],
              klines: []
            });
            if(idx === (arr.length - 1)) {
              cates.push({
                categoryName: '>' + name,
                cateValue: [v, Infinity],
                cateValueOpen: [true, false],
                klines: []
              });
            }
          });
          return cates;
        },
        analysis() {
          if(!this.klineData) {
            return this.$message({
              message: '没有填写k线数据',
              type: 'error'
            });
          }
          let klines = [];
          const rs = {};
          try{
            const inputData = JSON.parse(this.klineData);
            rs.dataInfo = inputData.ch || '未识别数据周期信息';
            klines = inputData.data || inputData || [];
          } catch(err) {
            return this.$message(rs.$message);
          }

          rs.klineCount = klines.length;
          rs.firstKline = klines[0];
          rs.latestKline = klines[klines.length -1];
          rs.shortHigh = 0;
          rs.shortLow = 0;
          rs.upCount = 0;
          rs.downCount = 0;
          this.rs = rs;

          klines.forEach(k => {
            k.highIncrease = (k.high - k.open) / k.open; // 最高增幅
            k.lowDescrease = (k.low - k.open) / k.open; // 最低增幅
            k.closePercent = (k.close - k.open) / k.open;
            if(k.highIncrease - k.closePercent <= this.shortPercent) {
              rs.shortHigh+=1;
              k.isShortHigh = true;
            }
            if(k.closePercent - k.lowDescrease <= this.shortPercent) {
              rs.shortLow+=1;
              k.isShortLow = true;
            }
            if(k.close > k.open) {
              rs.upCount += 1;
            } else if(k.close < k.open) {
              rs.downCount += 1;
            }

            k.datetime = moment(k.id * 1e3).format('YYYY-MM-DD HH:mm');
          });

          this.klines = klines;
          
          
          // const highData = this.getCategories();
          // const lowData= this.getCategories();
          // const closeData =  this.getCategories();

          // [...highData].reverse().forEach((d, idx, arr) => {
          //   if(d.cateValue < 0) {
          //     return;
          //   }
          //   const pred = arr[idx - 1];
          //   d.preSumCount = idx > 0 ?  pred.preSumCount + d.klines.length : d.klines.length;
          // });
          // lowData.forEach((d, idx, arr) => {
          //   if(d.cateValue > 0) {
          //     return;
          //   }
          //   const pred = arr[idx - 1];
          //   d.preSumCount = idx > 0 ?  pred.preSumCount + d.klines.length : d.klines.length;
          // });

          // closeData.forEach((d, idx, arr) => {
          //   const pred = arr[idx - 1];
          //   d.preSumCount = idx > 0 ?  pred.preSumCount + d.klines.length : d.klines.length;
          // });
          // this.chartData = [highData, lowData, closeData];
          // this.drawChart();
        },
        findSutableCate(percent, categories) {
          const lowestIndex = categories.findIndex(v => v.cateValue > percent);
          const highestIndex = categories.length - 1 - [...categories].reverse().findIndex(v => v.cateValue < percent);
          return percent > 0 ? categories[highestIndex] : categories[lowestIndex];
        },
        drawChart() {
          const seryNames =['高点分布', '低点分布', '收盘分布'];
          const self = this;
          this.echart.setOption({
            tooltip: {
              show: true,
              formatter(p) {
                const data = self.chartData[p.seriesIndex][p.dataIndex];
                let toolTip = `${p.seriesName}<br/>
                ${p.name}：${p.data}次，占比：${(100 * p.data/self.rs.klineCount).toFixed(2)}%`;
                if(data.preSumCount) {
                  toolTip += `<br/>
                  ${p.seriesIndex === 0 ? '高' : '低'}于${p.name}：${data.preSumCount}次，占比：${(100 * data.preSumCount/self.rs.klineCount).toFixed(2)}%`;
                }
                toolTip+= `<br/>
                该位置价格:${(self.rs.latestKline.open * (1 + data.cateValue)).toFixed(2)}
                `;
                return toolTip;
              }
            },
            legend: {
              show: true
            },

            yAxis: {
                type: 'value'
            },
            xAxis: {
              type: 'category',
              data: this.getCategories().map(c => c.categoryName)
            },
            series: this.chartData.map((data, idx) => {
              return {
                type: 'bar',
                data: data.map(d => {
                  const count = d.klines.length;
                  if(count) {
                    return count;
                  }
                  return {
                    value: count,
                    label: {
                      show: false,
                    }
                  }
                }),
                name: seryNames[idx],
                label: {
                  show: true,
                  position: 'top'
                }
              }
            }),
          })
        }
      }
    }
</script>
