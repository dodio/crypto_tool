<template>
    <div class="result">
      <h2 style="text-align:center;">{{title}}</h2>
      <el-divider/>
      <el-tabs v-model="activeName">
          <el-tab-pane label="统计信息" name="first">
              <template v-if="rs">
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
              </template>
              <h3 v-else>暂无结果</h3>
          </el-tab-pane>
          <el-tab-pane label="振幅分布图" name="second">
              <el-form :inline="true">
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
              <el-divider/>
              <div class="echartContainer">
                  <div style="width: 100%;height: 500px;">
                      <Echart ref="chart" />
                  </div>
              </div>

              <KlineDataAnalyzer v-if="subAnalyze"  :title="subAnalyze.rsTitle" :klineData="subAnalyze.klineData"/>
          </el-tab-pane>
             
      </el-tabs>
    </div>
</template>

<script>
import Echart from './Echart';
import _ from 'lodash';

export default {
    name: 'KlineDataAnalyzer',
    props: {
        title: String,
        klineData: Object
    },
    components: {
        Echart
    },
    data() {
      return {
        rs: null,
        activeName: 'first',
        maxPercent: 0.1,
        splitter: 0.01,
        shortPercent: 0.002,
        subAnalyze: null
      }
    },
    watch: {
      activeName(val) {
        if(val === 'second') {
          this.$nextTick(() => {
            this.$refs.chart.ins.resize();
          })
        }
      },
      klineData(){
        this.subAnalyze = null;
        this.analysis();
      }
    },
    mounted() {
        this.analysis();
        this.$refs.chart.ins.on('click', (sery) => {
          const cate = this.chartData[sery.seriesIndex][sery.dataIndex];
          const title = sery.seriesName + cate.categoryName + '精细分析';
          const subAnalyzeData = {
            rsTitle: title,
            klineData: {
              dataInfo: this.klineData.dataInfo,
              klines: cate.klines,
            }
          }
          this.subAnalyze = subAnalyzeData;
        })
    },
    methods: {
        getCategories() {
          const cates = [];
          const intervals = _.range(-this.maxPercent, this.maxPercent, this.splitter).map(v => {
            // 对intervals进行精度处理
            return parseFloat(v.toFixed(3));
          });
          intervals.forEach((v, idx, arr) => {
            const name = ( v * 100).toFixed(1) + '%';
            if(idx === 0) {
              cates.push({
                leftName: '',
                rightName: name,
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
              leftName: lastValueName,
              rightName: name,
              categoryName: [`(${lastValueName})`, `(${name})`].join('—'),
              cateValue: [lastValue, v],
              cateValueOpen: lastValue < 0 ? [false, true] : [true, false],
              klines: []
            });
            if(idx === (arr.length - 1)) {
              cates.push({
                leftName: name,
                rightName: '',
                categoryName: '>' + name,
                cateValue: [v, Infinity],
                cateValueOpen: [true, false],
                klines: []
              });
            }
          });
          return cates;
        },

        countKlineInfo(klines, obj) {
          const info = {
            shortHigh: 0,
            shortLow: 0,
            upCount: 0,
            downCount: 0
          };
          klines.forEach(kline => {
            if(kline.isShortLow) {
              info.shortLow += 1;
            }
            if(kline.isShortHigh) {
              info.shortHigh += 1;
            }
            if(kline.close > kline.open) {
              info.upCount+=1
            } else if(kline.close < kline.open) {
              info.downCount+=1;
            }
          });
          if(obj) {
            Object.assign(obj, info);
          }
          return info;
        },
        analysis() {
          const klineData = this.klineData;
          if(!klineData) {
            return;
          }
          const klines = klineData.klines;
          const rs = {
            dataInfo: klineData.dataInfo,
            klineCount: klines.length,
            firstKline: klines[0],
            latestKline: klines[klines.length - 1],
          };

          this.rs = rs;

          const highData = this.getCategories();
          const lowData= this.getCategories();
          const closeData =  this.getCategories();
          this.countKlineInfo(klines, rs);
          klines.forEach(kline => {
            const highCate = this.findSutableCate(kline.highIncrease, highData);
            const lowCate = this.findSutableCate(kline.lowDescrease, lowData);
            const closeCate = this.findSutableCate(kline.closePercent, closeData);
            highCate.klines.push(kline);
            lowCate.klines.push(kline);
            closeCate.klines.push(kline);
          });

          highData.forEach(cate => {
            cate.values = cate.klines.map(k => k.highIncrease);
            cate.meanValue = _.mean(cate.values);
            this.countKlineInfo(cate.klines, cate);
          });
          lowData.forEach(cate => {
            cate.values = cate.klines.map(k => k.lowDescrease);
            cate.meanValue = _.mean(cate.values);
            this.countKlineInfo(cate.klines, cate);
          });
          closeData.forEach(cate => {
            cate.values = cate.klines.map(k => k.closePercent);
            cate.meanValue = _.mean(cate.values);
            this.countKlineInfo(cate.klines, cate);
          });

          [...highData].reverse().forEach((d, idx, arr) => {
            if(d.cateValue < 0) {
              return;
            }
            const pred = arr[idx - 1];
            d.preSumCount = idx > 0 ?  pred.preSumCount + d.klines.length : d.klines.length;
          });
          lowData.forEach((d, idx, arr) => {
            if(d.cateValue > 0) {
              return;
            }
            const pred = arr[idx - 1];
            d.preSumCount = idx > 0 ?  pred.preSumCount + d.klines.length : d.klines.length;
          });

          closeData.forEach((d, idx, arr) => {
            const pred = arr[idx - 1];
            d.preSumCount = idx > 0 ?  pred.preSumCount + d.klines.length : d.klines.length;
          });
          this.chartData = [highData, lowData, closeData];
          this.drawChart();
        },
        findSutableCate(percent, categories) {
          const cate = categories.find(cate => {
            const [leftOpen, rightOpen] = cate.cateValueOpen;
            const [leftValue, rightValue] = cate.cateValue;
            return (leftOpen ? percent >= leftValue : percent > leftValue )
            && (rightOpen ? percent <= rightValue : percent < rightValue);
          });
          return cate;
        },
        drawChart() {
          const seryNames =['高点分布', '低点分布', '收盘分布'];
          const self = this;
          this.$refs.chart.ins.setOption({
            tooltip: {
              show: true,
              formatter(p) {
                const data = self.chartData[p.seriesIndex][p.dataIndex];
                let toolTip = `${p.seriesName}<br/>
                ${p.name}：${p.data}次，占比：${(100 * p.data/self.rs.klineCount).toFixed(2)}%
                <br/>
                短上影：${data.shortHigh}，短下影：${data.shortLow}，涨：${data.upCount}(${(data.upCount * 100 / p.data).toFixed(2)}%)，跌：${data.downCount}
                <br/>
                `;
                if(data.preSumCount) {
                  toolTip += `<br/>
                  <b>${p.seriesIndex === 0 ? `高于${data.leftName}` : `低于${data.rightName}`}</b>：${data.preSumCount}次，占比：${(100 * data.preSumCount/self.rs.klineCount).toFixed(2)}%`;
                }
                toolTip+= `<br/>
                <br/>
                <b>该范围平均幅度：${(data.meanValue * 100).toFixed(2)}%</b>
                <br/>
                <b>最新k线该位置建议开仓价格</b>：${(self.rs.latestKline.open * (1 + data.meanValue)).toFixed(2)}
                `;
                return toolTip;
              }
            },
            legend: {
              show: true
            },
            grid: {
              left: 0,
              top: 30,
              bottom: 20,
              right: 0,
            },

            yAxis: {
                type: 'value'
            },
            xAxis: {
              type: 'category',
              data: this.getCategories().map(c => c.categoryName),
              splitLine: {
                show: true,
              },
              axisLabel: {
                interval: 0
              }
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

<style>
.echartContainer {
  width: 100%;
  /* overflow: scroll; */
}
</style>