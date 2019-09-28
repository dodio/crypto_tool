<template>
  <div class="kline">
    <el-tabs v-model="activeName">
      <el-tab-pane label="输入k线数据" name="input">
          <el-form>
              <el-form-item label="选择币种">
                <el-select v-model="selectedSymbol">
                  <el-option v-for="s in symbols" :value="s" :key="s">{{s}}</el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="合约类型">
                <el-select v-model="selectedContract">
                  <el-option v-for="t in contractType" :key="t.type" :value="t.type">{{t.name}}</el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="k线周期">
                <el-select v-model="peroid">
                  <el-option v-for="t in peroids" :key="t" :value="t">{{t}}</el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="数据量">
                <el-input-number v-model="size" :min="5" :step="1"></el-input-number>
              </el-form-item>
              <el-button @click="openApi" type="primary">打开接口</el-button>
              <el-alert type="info" :closable="false">火币合约api文档：<a href="https://huobiapi.github.io/docs/dm/v1/cn/#k" target="_blank" rel="noopener noreferrer">https://huobiapi.github.io/docs/dm/v1/cn/#k</a></el-alert>
              <el-divider/>
                <el-form-item label="k线数据">
                  <el-input type="textarea" v-model="klineData" placeholder="填入获取的K线数据"></el-input>
                </el-form-item>
              <el-button type="primary" @click="analysis">分析</el-button>
          </el-form>
      </el-tab-pane>
      <el-tab-pane label="分析结果" name="result">
        <KlineDataAnalyzer v-if="parsedKlineData" :title="rsTitle" :klineData="parsedKlineData"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
// @ is an alias to /src
import moment from 'moment';
import _ from 'lodash';
import KlineDataAnalyzer from '../components/KlineDataAnalyzer';

export default {
  components: {
    KlineDataAnalyzer
  },
  data () {
    return {
      activeName: 'input',
      klineData: '',
      selectedSymbol: 'BTC',
      selectedContract: 'CQ',
      size: 100,
      peroid: '1day',
      symbols: 'BTC,ETH,EOS,LTC,BSV,BCH,XRP,TRX'.split(','),
      contractType: [
        {
          type: 'CW',
          name: '当周'
        },
        {
          type: 'NW',
          name: '次周'
        },
        {
          type: 'CQ',
          name: '当季'
        }
      ],
      peroids: '1min,5min,15min,30min,60min,4hour,1day,1mon'.split(','),
      parsedKlineData: null,
      rsTitle: ''
    };
  },
  methods: {
    openApi () {
      const url = `https://api.hbdm.com/market/history/kline?symbol=${[this.selectedSymbol, this.selectedContract].join('_')}&period=${this.peroid}&size=${this.size}`;
      window.open(url);
    },
    getKlineData () {
      if (!this.klineData) {
        this.$message({
          message: '没有填写k线数据',
          type: 'error'
        });
        return;
      }
      let klines = [];
      const klineData = {};
      try {
        const inputData = JSON.parse(this.klineData);
        klineData.dataInfo = inputData.ch || '未识别数据周期信息';
        klines = inputData.data || inputData || [];
      } catch (err) {
        return this.$message(err.message);
      }

      klines.forEach((k, idx) => {
        k.index = idx;
        k.highIncrease = (k.high - k.open) / k.open; // 最高增幅
        k.lowDescrease = (k.low - k.open) / k.open; // 最低增幅
        k.closePercent = (k.close - k.open) / k.open;
        const day = moment(k.id * 1e3);
        k.datetime = day.format('YYYY-MM-DD HH:mm');
        k.HHMM = day.format('HH:mm');
        k.WeekDay = '周' + day.day();
        console.log(k.WeekDay);
      });

      klineData.klines = klines;
      return klineData;
    },
    analysis () {
      const parsedKlineData = this.getKlineData();
      this.parsedKlineData = this.$root.wholeKlineData = parsedKlineData;
      this.activeName = 'result';
      this.rsTitle = parsedKlineData.dataInfo + '整体分析';
    }
  }
};
</script>
