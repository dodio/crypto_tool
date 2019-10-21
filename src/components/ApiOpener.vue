<template>
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
    </el-form>
</template>
<script>
export default {
    data() {
        return {
            selectedSymbol: 'BTC',
            selectedContract: 'CQ',
            size: 2000,
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
        }
    },
    methods: {
        openApi () {
            const url = `https://api.hbdm.com/market/history/kline?symbol=${[this.selectedSymbol, this.selectedContract].join('_')}&period=${this.peroid}&size=${this.size}`;
            window.open(url);
        },
    }
}
</script>