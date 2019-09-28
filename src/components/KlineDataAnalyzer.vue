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
                  <el-divider></el-divider>
                  <el-table :data="rsTable" row-key="categoryName">
                    <el-table-column prop="categoryName" label="幅度"></el-table-column>
                    <el-table-column label="最大涨幅">
                      <template slot-scope="scope">
                        <el-tag>数量：{{scope.row.highCate.klines.length}}</el-tag>
                        <template v-if="scope.row.highCate.klines.length">
                            <el-tag>比例：{{(100 * scope.row.highCate.klines.length/rs.klineCount).toFixed(2)}}%</el-tag>
                            <el-tag>平均幅度：{{(scope.row.highCate.meanValue * 100).toFixed(2)}}%</el-tag>
                            <el-alert>
                              短上影：{{scope.row.highCate.shortHigh}}，短下影：{{scope.row.highCate.shortLow}}，涨：{{scope.row.highCate.upCount}}({{(scope.row.highCate.upCount * 100 / scope.row.highCate.klines.length).toFixed(2)}}%)，跌：{{scope.row.highCate.downCount}}
                            </el-alert>
                            <el-alert v-if="scope.row.highCate.preSumCount">
                              <b>高于{{scope.row.highCate.leftName}}</b>：{{scope.row.highCate.preSumCount}}次，占比：{{(100 * scope.row.highCate.preSumCount/rs.klineCount).toFixed(2)}}%`;
                            </el-alert>
                        </template>
                      </template>
                    </el-table-column>

                    <el-table-column label="最大跌幅">
                      <template slot-scope="scope">
                        <el-tag>数量：{{scope.row.lowCate.klines.length}}</el-tag>
                        <template v-if="scope.row.lowCate.klines.length">
                          <el-tag>比例：{{(100 * scope.row.lowCate.klines.length/rs.klineCount).toFixed(2)}}%</el-tag>
                          <el-tag>平均幅度：{{(scope.row.lowCate.meanValue * 100).toFixed(2)}}%</el-tag>
                          <el-alert>
                            短上影：{{scope.row.lowCate.shortHigh}}，短下影：{{scope.row.lowCate.shortLow}}，涨：{{scope.row.lowCate.upCount}}({{(scope.row.lowCate.upCount * 100 / scope.row.lowCate.klines.length).toFixed(2)}}%)，跌：{{scope.row.lowCate.downCount}}
                          </el-alert>

                          <el-alert v-if="scope.row.lowCate.preSumCount">
                            <b>低于{{scope.row.lowCate.rightName}}</b>：{{scope.row.lowCate.preSumCount}}次，占比：{{(100 * scope.row.lowCate.preSumCount/rs.klineCount).toFixed(2)}}%`;
                          </el-alert>
                        </template>
                      </template>
                    </el-table-column>

                    <el-table-column label="收盘">
                      <template slot-scope="scope">
                        <el-tag>数量：{{scope.row.closeCate.klines.length}}</el-tag>
                        <template v-if="scope.row.closeCate.klines.length">
                          <el-tag>比例：{{(100 * scope.row.closeCate.klines.length/rs.klineCount).toFixed(2)}}%</el-tag>
                          <el-tag>平均幅度：{{(scope.row.closeCate.meanValue * 100).toFixed(2)}}%</el-tag>
                          <el-alert>
                            短上影：{{scope.row.closeCate.shortHigh}}，短下影：{{scope.row.closeCate.shortLow}}，涨：{{scope.row.closeCate.upCount}}({{(scope.row.closeCate.upCount * 100 / scope.row.closeCate.klines.length).toFixed(2)}}%)，跌：{{scope.row.closeCate.downCount}}
                          </el-alert>
                          <el-alert v-if="scope.row.closeCate.preSumCount">
                            <b>低于{{scope.row.closeCate.rightName}}</b>：{{scope.row.closeCate.preSumCount}}次，占比：{{(100 * scope.row.closeCate.preSumCount/rs.klineCount).toFixed(2)}}%`;
                          </el-alert>
                        </template>
                      </template>
                    </el-table-column>
                  </el-table>
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
                  <el-input-number v-model="shortPercent" @change="analysis" :step="0.001" :min="0.001" :max="0.1"></el-input-number>
                </el-form-item>
              </el-form>
              <el-divider/>
              <div class="echartContainer">
                  <div style="width: 100%;height: 500px;">
                      <Echart ref="chart" />
                  </div>
              </div>
          </el-tab-pane>
          <el-tab-pane label="时间比例图" name="third">
            <el-row v-if="activeName === 'third'">
              <el-col :span="12">
                <div style="width:100%;height: 300px;" v-if="pieHourData">
                  <PieChart @item-click="setSubAnalyzerByPie" title="小时分布比例" :dataObj="pieHourData"/>
                </div>
              </el-col>
              <el-col :span="12">
                <div style="width:100%;height: 300px;" v-if="pieWeekData">
                  <PieChart @item-click="setSubAnalyzerByPie" title="周内日分布比例" :dataObj="pieWeekData"/>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
      </el-tabs>
      
      <el-tabs v-model="subActiveName" v-if="subAnalyze.length"  @edit="tabRemove" style="margin-top: 20px;">
        <el-tab-pane v-for="sub in subAnalyze" :key="sub.tabId" :label="sub.rsTitle" :closable="true" :name="sub.tabId">
          <KlineDataAnalyzer :title="sub.rsTitle" :klineData="sub.klineData"/>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-if="selecttedCate" :visible="true" title="设置细分分析参数">
        <h3>当前选择区间：{{selecttedCate.sery.seriesName}}:{{selecttedCate.categoryName}}</h3>
        <el-form>
          <el-form-item>
            <el-switch
              v-model="subCateParam.present"
              active-text="分析本区间k线"
              inactive-text="分析本区间后续k线">
            </el-switch>
          </el-form-item>
          <el-form-item v-if="!subCateParam.present">
            <el-switch
              v-model="subCateParam.after"
              active-text="后"
              inactive-text="前">
            </el-switch>
            <el-switch
              v-model="subCateParam.single"
              active-text="第"
              inactive-text="连续">
            </el-switch>
            <el-input-number v-model="subCateParam.n" :step="1" :min="1" :max="5"></el-input-number>
          </el-form-item>
          <el-form-item>
            <el-button @click="selecttedCate=null,subCateParam=null">取消</el-button>
            <el-button @click="setSubAnalyzer" type="primary">确定</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
</template>

<script>
import Echart from './Echart';
import PieChart from './PieChart';
import _ from 'lodash';

export default {
  name: 'KlineDataAnalyzer',
  props: {
    title: String,
    klineData: Object
  },
  components: {
    Echart,
    PieChart
  },
  data () {
    return {
      rs: null,
      subActiveName: '',
      activeName: 'second',
      maxPercent: 0.1,
      splitter: 0.01,
      shortPercent: 0.002,
      subAnalyze: [],
      selecttedCate: null,
      subCateParam: null,
      rsTable: [],
      pieHourData: null,
      pieWeekData: null,
    };
  },
  watch: {
    activeName (val) {
      if (val === 'second') {
        this.$nextTick(() => {
          this.$refs.chart.ins.resize();
        });
      }
    },
    klineData () {
      this.subAnalyze = null;
      this.analysis();
    }
  },
  mounted () {
    this.analysis();
    this.$refs.chart.ins.on('click', (sery) => {
      const cate = this.chartData[sery.seriesIndex][sery.dataIndex];
      cate.sery = sery;
      this.selecttedCate = cate;
      this.subCateParam = {
        present: false,
        single: true,
        after: true,
        n: 1
      };
    });
  },
  methods: {
    tabRemove (targetName, action) {
      if (action === 'remove') {
        let tabs = this.subAnalyze;
        let activeName = this.subActiveName;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.tabId === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.tabId;
              } else {
                activeName = 'second';
              }
            }
          });
        }
        this.subActiveName = activeName;
        this.subAnalyze = tabs.filter(tab => tab.tabId !== targetName);
      }
    },
    setSubAnalyzer () {
      const cate = this.selecttedCate;
      const sery = cate.sery;
      const { present, single, n, after } = this.subCateParam;
      const tabId = String(Math.random());
      const subAnalyzeData = {
        tabId,
        klineData: {
          dataInfo: this.klineData.dataInfo
        }
      };
      const wholeKlines = this.$root.wholeKlineData.klines;
      const directionText = after ? '后' : '前';

      if (present) {
        subAnalyzeData.rsTitle = sery.seriesName + cate.categoryName + '精细分析';
        subAnalyzeData.klineData.klines = cate.klines;
      } else if (single) {
        subAnalyzeData.rsTitle = sery.seriesName + cate.categoryName + `${directionText}第${n}k线分析`;
        subAnalyzeData.klineData.klines = cate.klines.map(k => {
          return wholeKlines[k.index + (after ? n : -n)];
        }).filter(k => !!k);
      } else {
        subAnalyzeData.rsTitle = sery.seriesName + cate.categoryName + `连续${directionText}${n}k线分析`;
        // all 1 - n klines
        const allKlines = Array.prototype.concat.apply([],
          Array.from({ length: n }).map((v, idx) => {
            const n = idx + 1;
            return cate.klines.map(k => {
              return wholeKlines[k.index + (after ? n : -n)];
            }).filter(k => !!k);
          })
        ).sort((a, b) => a.id - b.id);
        console.log('后nk线', allKlines);
        subAnalyzeData.klineData.klines = _.sortedUniqBy(allKlines, 'id');
      }
      console.log('数量', cate.klines.length, subAnalyzeData.klineData.klines.length);

      this.subAnalyze.push(subAnalyzeData);
      this.subCateParam = null;
      this.selecttedCate = null;
      this.subActiveName = subAnalyzeData.tabId;
    },
    setSubAnalyzerByPie(sanData) {
      const tabId = String(Math.random());
      const subAnalyzeData = {
        tabId,
        rsTitle: `${sanData.name}k线数据分析`,
        klineData: {
          dataInfo: this.klineData.dataInfo,
          klines: sanData.klines
        }
      };
      console.log(sanData);
      this.$confirm(`是否详细分析${sanData.name}的k线数据`).then(() => {
        this.subAnalyze.push(subAnalyzeData);
        this.subActiveName = subAnalyzeData.tabId;
      });
    },
    getCategories () {
      const cates = [];
      const intervals = _.range(-this.maxPercent, this.maxPercent, this.splitter).map(v => {
        // 对intervals进行精度处理
        return parseFloat(v.toFixed(3));
      });
      intervals.forEach((v, idx, arr) => {
        const name = (v * 100).toFixed(1) + '%';
        if (idx === 0) {
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
        const lastValue = arr[idx - 1];
        const lastValueName = (lastValue * 100).toFixed(1) + '%';
        cates.push({
          leftName: lastValueName,
          rightName: name,
          categoryName: [`(${lastValueName})`, `(${name})`].join('—'),
          cateValue: [lastValue, v],
          cateValueOpen: lastValue < 0 ? [false, true] : [true, false],
          klines: []
        });
        if (idx === (arr.length - 1)) {
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

    countKlineInfo (klines, obj) {
      const info = {
        shortHigh: 0,
        shortLow: 0,
        upCount: 0,
        downCount: 0
      };
      klines.forEach(kline => {
        if (kline.highIncrease - kline.closePercent <= this.shortPercent) {
          info.shortHigh += 1;
        }
        if (kline.closePercent - kline.lowDescrease <= this.shortPercent) {
          info.shortLow += 1;
        }
        if (kline.close > kline.open) {
          info.upCount += 1;
        } else if (kline.close < kline.open) {
          info.downCount += 1;
        }
      });
      if (obj) {
        Object.assign(obj, info);
      }
      return info;
    },
    analysis () {
      const klineData = this.klineData;
      if (!klineData) {
        return;
      }
      const klines = klineData.klines;
      const rs = {
        dataInfo: klineData.dataInfo,
        klineCount: klines.length,
        firstKline: klines[0],
        latestKline: klines[klines.length - 1]
      };

      this.rs = rs;

      const highData = this.getCategories();
      const lowData = this.getCategories();
      const closeData = this.getCategories();
      const klineHourMap = {};
      const weekDayMap = {};
      this.countKlineInfo(klines, rs);
      klines.forEach(kline => {
        const highCate = this.findSutableCate(kline.highIncrease, highData);
        const lowCate = this.findSutableCate(kline.lowDescrease, lowData);
        const closeCate = this.findSutableCate(kline.closePercent, closeData);
        highCate.klines.push(kline);
        lowCate.klines.push(kline);
        closeCate.klines.push(kline);

        if (klineHourMap[kline.HH]) {
          klineHourMap[kline.HH].push(kline);
        } else {
          klineHourMap[kline.HH] = [kline];
        }
        if (weekDayMap[kline.WeekDay]) {
          weekDayMap[kline.WeekDay].push(kline);
        } else {
          weekDayMap[kline.WeekDay] = [kline];
        }
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
        if (d.cateValue < 0) {
          return;
        }
        const pred = arr[idx - 1];
        d.preSumCount = idx > 0 ? pred.preSumCount + d.klines.length : d.klines.length;
      });
      lowData.forEach((d, idx, arr) => {
        if (d.cateValue > 0) {
          return;
        }
        const pred = arr[idx - 1];
        d.preSumCount = idx > 0 ? pred.preSumCount + d.klines.length : d.klines.length;
      });

      closeData.forEach((d, idx, arr) => {
        const pred = arr[idx - 1];
        d.preSumCount = idx > 0 ? pred.preSumCount + d.klines.length : d.klines.length;
      });
      this.chartData = [highData, lowData, closeData];
      this.pieHourData = klineHourMap;
      this.pieWeekData = weekDayMap;
      this.drawChart();
      this.putToTable();
    },
    findSutableCate (percent, categories) {
      const cate = categories.find(cate => {
        const [leftOpen, rightOpen] = cate.cateValueOpen;
        const [leftValue, rightValue] = cate.cateValue;
        return (leftOpen ? percent >= leftValue : percent > leftValue) &&
            (rightOpen ? percent <= rightValue : percent < rightValue);
      });
      return cate;
    },
    drawChart () {
      const seryNames = ['高点分布', '低点分布', '收盘分布'];
      const self = this;
      const lasteKline = _.last(self.$root.wholeKlineData.klines);
      const cates = this.getCategories();
      this.$refs.chart.ins.setOption({
        tooltip: {
          show: true,
          formatter (p) {
            const data = self.chartData[p.seriesIndex][p.dataIndex];
            let toolTip = `${p.seriesName}<br/>
                ${data.categoryName}：${p.data}次，占比：${(100 * p.data / self.rs.klineCount).toFixed(2)}%
                <br/>
                短上影：${data.shortHigh}，短下影：${data.shortLow}，涨：${data.upCount}(${(data.upCount * 100 / p.data).toFixed(2)}%)，跌：${data.downCount}
                <br/>
                `;
            if (data.preSumCount) {
              toolTip += `<br/>
                  <b>${p.seriesIndex === 0 ? `高于${data.leftName}` : `低于${data.rightName}`}</b>：${data.preSumCount}次，占比：${(100 * data.preSumCount / self.rs.klineCount).toFixed(2)}%`;
            }
            toolTip += `<br/>
                <br/>
                <b>该范围平均幅度：${(data.meanValue * 100).toFixed(2)}%</b>
                <br/>
                <b>最新k线该位置建议开仓价格</b>：${(lasteKline.open * (1 + data.meanValue)).toFixed(2)}
                `;
            return toolTip;
          }
        },
        legend: {
          show: true
        },
        grid: {
          left: 0,
          top: 40,
          bottom: 20,
          right: 0
        },

        yAxis: {
          type: 'value'
        },
        xAxis: {
          type: 'category',
          data: cates.map((c, idx) => (idx === cates.length - 1 || idx === 0) ? c.categoryName : c.leftName),
          splitLine: {
            show: true
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
              if (count) {
                return count;
              }
              return {
                value: count,
                label: {
                  show: false
                }
              };
            }),
            name: seryNames[idx],
            label: {
              show: true,
              position: 'top'
            }
          };
        })
      });
    },

    putToTable () {
      const cates = this.getCategories();
      this.chartData[0].forEach((cate, idx) => {
        cates[idx].highCate = cate;
      });
      this.chartData[1].forEach((cate, idx) => {
        cates[idx].lowCate = cate;
      });
      this.chartData[2].forEach((cate, idx) => {
        cates[idx].closeCate = cate;
      });
      this.rsTable = cates;
    }
  }
};
</script>

<style>
.echartContainer {
  width: 100%;
  /* overflow: scroll; */
}
</style>
