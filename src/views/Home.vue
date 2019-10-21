<template>
  <div class="kline">
    <el-tabs v-model="activeName" :before-leave="beforeTabChange">
      <el-tab-pane label="输入k线数据" name="input">
        <ApiOpener />
        <el-divider/>
        <el-form>
          <el-form-item label="k线数据">
              <el-input type="textarea" v-model="klineData" placeholder="填入获取的K线数据"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="analysis">分析</el-button>
      </el-tab-pane>
      <el-tab-pane label="分析结果" name="result">
        <KlineDataAnalyzer v-if="parsedKlineData" :title="rsTitle" :klineData="parsedKlineData"/>
      </el-tab-pane>
      <el-tab-pane label="开新窗" name="new">
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
// @ is an alias to /src
import moment from 'moment';
import _ from 'lodash';
import KlineDataAnalyzer from '../components/KlineDataAnalyzer';
import ApiOpener from '../components/ApiOpener';
import { parseKlineData, WEEKDAYS} from '../klineUtil';

export default {
  components: {
    KlineDataAnalyzer,
    ApiOpener
  },
  data () {
    return {
      activeName: 'input',
      klineData: '',
      parsedKlineData: null,
      rsTitle: ''
    };
  },
  watch: {
    
  },
  methods: {
    beforeTabChange(val, prev) {
      if(val === 'new') {
        window.open(location.href);
        return false;
      }
    },
    getKlineData () {
      if (!this.klineData) {
        this.$message({
          message: '没有填写k线数据',
          type: 'error'
        });
        return;
      }
      try {
        return parseKlineData(this.klineData);
      } catch(err) {
        this.$message(err.message);
      }
    },
    analysis () {
      if(this.parsedKlineData) {
        this.parsedKlineData = null;
        // empty charts
        setTimeout(() => {
          this.analysis();
        }, 1e3);
        return;
      }
      const parsedKlineData = this.getKlineData();
      this.parsedKlineData = this.$root.wholeKlineData = parsedKlineData;
      this.$root.klineTimeInterval = parsedKlineData.klines[1].id - parsedKlineData.klines[0].id;
      this.activeName = 'result';
      this.rsTitle = parsedKlineData.dataInfo + '整体分析';
    }
  }
};
</script>
