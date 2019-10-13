<template>
    <div class="result">
      <h2 style="text-align:center;">{{title}}</h2>
      <el-divider/>
      <el-form :inline="true" size="mini">
        <el-form-item label="最大波幅">
          <el-input-number v-model="maxPercent" @change="analysis" :step="0.01" :min="0.01" :max="1"></el-input-number>
        </el-form-item>
        <el-form-item label="分隔区间">
          <el-input-number v-model="splitter" @change="analysis" :step="0.001" :min="0.001" :max="0.2"></el-input-number>
        </el-form-item>
        <el-form-item label="短影线百分比定义">
          <el-input-number v-model="shortPercent" @change="analysis" :step="0.001" :min="0.001" :max="0.1"></el-input-number>
        </el-form-item>
      </el-form>
      <el-tabs v-model="activeName" type="border-card">
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
                        <div :v-html="`<div>${getCateDescription(0, scope.$index)}</div>`"></div>
                      </template>
                    </el-table-column>
                    <el-table-column label="最大跌幅">
                      <template slot-scope="scope">
                        <div :v-html="`<div>${getCateDescription(1, scope.$index)}</div>`"></div>
                      </template>
                    </el-table-column>
                    <el-table-column label="收盘">
                      <template slot-scope="scope">
                        <div :v-html="`<div>${getCateDescription(2, scope.$index)}</div>`"></div>
                      </template>
                    </el-table-column>
                  </el-table>
              </template>
              <h3 v-else>暂无结果</h3>
          </el-tab-pane>
          <el-tab-pane label="振幅分布图" name="second">
              <div class="echartContainer">
                  <div style="width: 100%;height: 600px;">
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
              
              <el-col :span="24">
                <div style="width:100%;height: 300px;" v-if="pieIntervalData">
                  <PieChart title="本区间各k险间隔分布比例" :dataObj="pieIntervalData"/>
                </div>
              </el-col>
              
            </el-row>
          </el-tab-pane>
      </el-tabs>
      
      <el-tabs type="border-card" v-model="subActiveName" v-if="subAnalyze.length"  @edit="tabRemove">
        <el-tab-pane v-for="sub in subAnalyze" :key="sub.tabId" :label="sub.rsTitle" :closable="true" :name="sub.tabId">
          <KlineDataAnalyzer :title="sub.rsTitle" :klineData="sub.klineData"/>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-if="selecttedCate" :visible="true" title="设置细分分析参数">
        <h3>当前选择区间：{{selecttedCate.sery.seriesName}}:{{selecttedCate.categoryName}}</h3>
        <el-form>
          <el-form-item label="区间选择">
            <el-select
              v-model="subCateParam.zone">
              <el-option value="self">{{selecttedCate.categoryName}}</el-option>
              <el-option value="withBefore">小于{{selecttedCate.rightName}}</el-option>
              <el-option value="withAfter">大于{{selecttedCate.leftName}}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-switch
              v-model="subCateParam.present"
              active-text="分析被选择区间的k线"
              inactive-text="分析被选择区间后续k线">
            </el-switch>
          </el-form-item>
          <el-form-item v-if="!subCateParam.present">
            <el-switch
              v-model="subCateParam.after"
              :active-text="subCateParam.after ? '后' : ''"
              :inactive-text="subCateParam.after ? '' : '前'">
            </el-switch>
            <el-switch
              v-model="subCateParam.single"
              :active-text="subCateParam.single ? '第' : ''"
              :inactive-text="subCateParam.single ? '' : '连续'">
            </el-switch>
            <el-input-number v-model="subCateParam.n" :step="1" :min="1" :max="5"></el-input-number>
          </el-form-item>
          <el-form-item label="分析组合k线">
            <el-button-group>
              <el-button size="mini" :type="subCateParam.vk === null ? 'primary' : 'default'" @click="subCateParam.vk = null">无</el-button>
              <el-button size="mini" v-for="vk in conbineKlines" :key="vk.label" :type="subCateParam.vk === vk ? 'primary' : 'default'" @click="subCateParam.vk = vk">{{vk.label}}</el-button>
            </el-button-group>
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
import moment from 'moment';
import { conbineKlines } from './klineUtil';
const seryNames = ['高点分布', '低点分布', '收盘分布'];

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
      pieIntervalData: null,
      conbineKlines: [{
        interval: 5 * 60,
        label: '5min',
      }, {
        interval: 15 * 60,
        label: '15min',
      }, {
        interval: 30 * 60,
        label: '30min',
      }, {
        interval: 60 * 60,
        label: '60min',
      }, {
        interval: 4 * 60 * 60,
        label: '4hour',
      }, {
        interval: 6 * 60 * 60,
        label: '6hour',
      }, {
        interval: 12 * 60 * 60,
        label: '12hour',
      }, {
        interval: 24 * 60 * 60,
        label: '1day',
      }, {
        interval: 7 * 24 * 60 * 60,
        label: '7day',
      }, {
        interval: 14 * 24 * 60 * 60,
        label: '2weeks',
      }, {
        interval: 30 * 24 * 60 * 60,
        label: '1month',
      }].filter(vk => this.$root.klineTimeInterval < vk.interval && vk.interval < this.$root.klineTimeInterval * 2000)
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
      if(!sery.value) {
        return;
      }
      const cate = this.chartData[sery.seriesIndex][sery.dataIndex];
      cate.sery = sery;
      this.selecttedCate = cate;
      this.subCateParam = {
        present: false,
        single: true,
        after: true,
        n: 1,
        zone: 'self',
        vk: null
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
      const { present, single, n, after, zone, vk } = this.subCateParam;
      const tabId = String(Math.random());
      const subAnalyzeData = {
        tabId,
        klineData: {
          dataInfo: this.klineData.dataInfo
        }
      };
      const wholeKlines = this.$root.wholeKlineData.klines;
      const directionText = after ? '后' : '前';
      let selectedKlines;
      let titleCate;

      if(zone === 'self') {
        selectedKlines = cate.klines;
        titleCate = cate.categoryName;
      } else if( zone === 'withBefore') {
        const seryData = this.chartData[sery.seriesIndex];
        const cateIndex = seryData.findIndex(d => d === cate);
        selectedKlines = Array.prototype.concat.apply([], seryData.slice(0, cateIndex + 1).map(d => d.klines));
        titleCate = `低于${cate.rightName}`;
      } else {
        const seryData = this.chartData[sery.seriesIndex];
        const cateIndex = seryData.findIndex(d => d === cate);
        selectedKlines = Array.prototype.concat.apply([], seryData.slice(cateIndex, seryData.length).map(d => d.klines));
        titleCate = `高于${cate.leftName}`;
      }

      if (present) {
        subAnalyzeData.rsTitle = sery.seriesName + titleCate + '精细分析';
        subAnalyzeData.klineData.klines = selectedKlines;
      } else if (single) {
        subAnalyzeData.rsTitle = sery.seriesName + titleCate + `${directionText}第${n}k线分析`;
        subAnalyzeData.klineData.klines = selectedKlines.map(k => {
          return wholeKlines[k.index + (after ? n : -n)];
        }).filter(k => !!k);
      } else {
        subAnalyzeData.rsTitle = sery.seriesName + titleCate + `连续${directionText}${n}k线分析`;
        // all 1 - n klines
        const allKlines = Array.prototype.concat.apply([],
          Array.from({ length: n }).map((v, idx) => {
            const n = idx + 1;
            return selectedKlines.map(k => {
              return wholeKlines[k.index + (after ? n : -n)];
            }).filter(k => !!k);
          })
        ).sort((a, b) => a.id - b.id);
        console.log('后nk线', allKlines);
        subAnalyzeData.klineData.klines = _.sortedUniqBy(allKlines, 'id');
      }
      console.log('数量', selectedKlines.length, subAnalyzeData.klineData.klines.length);
      if(vk) {
        subAnalyzeData.klineData.klines = subAnalyzeData.klineData.klines.map(kline => {
          const nextK = wholeKlines[kline.index + 1];
          const endKTime = nextK.id + vk.interval;
          const endK = wholeKlines.findIndex(k => k.id >= endKTime);
          // 即kline后续k线不足以组成一根完整的 组合kline，就抛弃
          if(endK === -1 || !nextK) {
            return null;
          }
          const klines = wholeKlines.slice(kline.index + 1, endK);
          const vKline = conbineKlines(klines);
          console.log(klines.length, vk.label);
          return vKline;
        }).filter(k => !!k);
        const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
        subAnalyzeData.klineData.klines.forEach((k, idx) => {
          k.index = idx;
          k.highIncrease = (k.high - k.open) / k.open; // 最高增幅
          k.lowDescrease = (k.low - k.open) / k.open; // 最低增幅
          k.closePercent = (k.close - k.open) / k.open;
          const day = moment(k.id * 1e3);
          k.datetime = day.format('YYYY-MM-DD HH:mm');
          k.HH = day.format('HH') + '点';
          k.WeekDay = '周' + WEEKDAYS[day.weekday()];
        })
        subAnalyzeData.rsTitle = `(组合${vk.label})` + subAnalyzeData.rsTitle;
      }

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

        cate.intervals = this.getIntervals(cate.klines);
        cate.meanInterval = _.mean(cate.intervals);

        this.countKlineInfo(cate.klines, cate);
      });
      lowData.forEach(cate => {
        cate.values = cate.klines.map(k => k.lowDescrease);
        cate.meanValue = _.mean(cate.values);

        cate.intervals = this.getIntervals(cate.klines);
        cate.meanInterval = _.mean(cate.intervals);

        this.countKlineInfo(cate.klines, cate);
      });
      closeData.forEach(cate => {
        cate.values = cate.klines.map(k => k.closePercent);
        cate.meanValue = _.mean(cate.values);

        cate.intervals = this.getIntervals(cate.klines);
        cate.meanInterval = _.mean(cate.intervals);

        this.countKlineInfo(cate.klines, cate);
      });

      const intervals = this.getIntervals(klines);
      const intervalCountMap = _.mapKeys(_.groupBy(intervals), (value, key) => `间隔${key}k(${(100 * value.length / intervals.length).toFixed(2)}%)`);

      this.chartData = [highData, lowData, closeData];
      this.pieHourData = klineHourMap;
      this.pieWeekData = weekDayMap;
      this.pieIntervalData = intervalCountMap;
      this.drawChart();
      this.putToTable();
    },

    getIntervals(klines) {
      const klineTimeInterval = this.$root.klineTimeInterval;
      if(klines.length < 2) {
        return [];
      }
      const intervals = [];
      for(let i = 1; i < klines.length; i++) {
        const intervalTime = klines[i].id - klines[i-1].id;
        intervals.push( (intervalTime - klineTimeInterval) / klineTimeInterval);
      }
      return intervals;
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
      const self = this;
      const cates = this.getCategories();
      this.$refs.chart.ins.setOption({
        tooltip: {
          show: true,
          formatter (p) {
            if(!p.value) {
              return '';
            }
            return `${p.seriesName}<br/>${self.getCateDescription(p.seriesIndex, p.dataIndex)}`;
          },
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
                },
                itemStyle: {
                  opacity: 0
                }
              };
            }),
            name: seryNames[idx],
            label: {
              show: true,
              position: 'top'
            },
            barMinHeight: 20
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
    },

    countPercent(mono, deno, precision = 2) {
      return (100 * mono / deno ).toFixed(precision)
    },

    getCateDescription(seriesIndex, dataIndex) {
      const seryData = this.chartData[seriesIndex];
      const cateData = seryData[dataIndex];
      if(!cateData.klines.length) {
        return '';
      }
      const leftCateDatas = seryData.slice(0, dataIndex + 1);
      const rightCateDatas = seryData.slice(dataIndex, seryData.length);
      const lasteKline = _.last(this.$root.wholeKlineData.klines);

      const cateTotalCount = cateData.klines.length;
      const totalKlineAmount = this.rs.klineCount;
      const countPercent = this.countPercent;

      let toolTip = `
          ${cateData.categoryName}：${cateTotalCount}次，占比：${countPercent(cateTotalCount, totalKlineAmount)}%
          <br/>
          短上影线：${cateData.shortHigh}次（${countPercent(cateData.shortHigh, cateTotalCount)}%），
          短下影线：${cateData.shortLow}次（${countPercent(cateData.shortLow, cateTotalCount)}%）
          <br/>
          涨：${cateData.upCount}次（${countPercent(cateData.upCount, cateTotalCount)}%），
          跌：${cateData.downCount}次（${countPercent(cateData.downCount, cateTotalCount)}%）
          <br/>
          `;

      const percentKey = ['highIncrease', 'lowDescrease', 'closePercent'][seriesIndex];

      if (seriesIndex !== 0 && leftCateDatas.length) {
        // 本cate不是高点分类数据，展示低于本cate的一些数据;
        const klineCount = _.sumBy(leftCateDatas, 'klines.length');
        if(klineCount > cateTotalCount) {
          const shortHigh = _.sumBy(leftCateDatas, 'shortHigh');
          const shortLow = _.sumBy(leftCateDatas, 'shortLow');
          const upCount = _.sumBy(leftCateDatas, 'upCount');
          const downCount = _.sumBy(leftCateDatas, 'downCount');
          const averagePercent = _.sum(leftCateDatas.map(c => _.sumBy(c.klines, percentKey))) / klineCount;

          toolTip += `
          <br/>
          低于${cateData.rightName}：${klineCount}次，占整体数据：${countPercent(klineCount, totalKlineAmount)}%
          <br/>
          本区间占其中：${countPercent(cateTotalCount, klineCount)}%，
          平均${averagePercent > 0 ? '涨' : '跌'}幅：${countPercent(averagePercent, 1)}%
          <br/>
          短上影线：${shortHigh}次（${countPercent(shortHigh, klineCount)}%），
          短下影线：${shortLow}次（${countPercent(shortLow, klineCount)}%）
          <br/>
          涨：${upCount}次（${countPercent(upCount, klineCount)}%），
          跌：${downCount}次（${countPercent(downCount, klineCount)}%）
          <br/>
          `;
        }
      }

      if (seriesIndex !== 1) {
        // 本cate不是低点分类数据，展示高于本cate的一些数据;
        const klineCount = _.sumBy(rightCateDatas, 'klines.length');
        if(klineCount > cateTotalCount) {
          const shortHigh = _.sumBy(rightCateDatas, 'shortHigh');
          const shortLow = _.sumBy(rightCateDatas, 'shortLow');
          const upCount = _.sumBy(rightCateDatas, 'upCount');
          const downCount = _.sumBy(rightCateDatas, 'downCount');
          const averagePercent = _.sum(rightCateDatas.map(c => _.sumBy(c.klines, percentKey))) / klineCount;

          toolTip += `
          <br/>
          高于${cateData.leftName}：${klineCount}次，占整体数据：${countPercent(klineCount, totalKlineAmount)}%
          <br/>
          本区间占其中：${countPercent(cateTotalCount, klineCount)}%，平均${averagePercent > 0 ? '涨' : '跌'}幅：${countPercent(averagePercent, 1)}%
          <br/>
          短上影线：${shortHigh}次（${countPercent(shortHigh, klineCount)}%），
          短下影线：${shortLow}次（${countPercent(shortLow, klineCount)}%）
          <br/>
          涨：${upCount}次（${countPercent(upCount, klineCount)}%），
          跌：${downCount}次（${countPercent(downCount, klineCount)}%）
          <br/>
          `;
        }
      }
      const cateLastKline = _.last(cateData.klines);
      const klineTimeInterval = this.$root.klineTimeInterval;

      toolTip += `
          <br/>
          <b>该范围平均幅度：${(cateData.meanValue * 100).toFixed(2)}%</b>
          <br/>
          <b>最新k线该位置建议开仓价格</b>：${(lasteKline.open * (1 + cateData.meanValue)).toFixed(2)}
          <br/>
          最后发生时间：<b>${cateLastKline.datetime}</b>，价格：${[cateLastKline.high, cateLastKline.low, cateLastKline.close][seriesIndex]}
          ${cateData.intervals.length && `
          <br/>
          <b>平均间隔</b>：${cateData.meanInterval.toFixed(1)}k线
          <br/>
          <font color="LawnGreen">相对安全时间：${getMeanIntervalTime(0.25)}</font><br/>
          <font color="yellow">预警时间：${getMeanIntervalTime(0.5)}</font><br/>
          <font color="orange">危险时间：${getMeanIntervalTime(0.75)}</font><br/>
          <font color="LightCoral">按平均间隔时间在：${getMeanIntervalTime()}</font>
          <br/>
          `}
          `;
        function getMeanIntervalTime(pos  = 1) {
          return moment(Math.round(cateLastKline.id + pos * cateData.meanInterval * klineTimeInterval) * 1e3).format('YYYY-MM-DD HH:mm:ss')
        } 
      return toolTip;
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
