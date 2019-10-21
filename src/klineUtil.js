import moment from 'moment';
export const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function parseKlineData (klineData) {
  if (!klineData) {
    throw new Error('缺少k线文本数据');
  }
  let klines = [];
  const klineDataObj = {};
  const inputData = JSON.parse(klineData);
  klineDataObj.dataInfo = inputData.ch || '未识别数据周期信息';
  if (inputData.ch) {
    const klineInfo = inputData.ch.split('.');
    klineDataObj.klineInfo = {
      pair: klineInfo[1],
      symbol: klineInfo[1].split('_')[0],
      contractType: klineInfo[1].split('_')[1],
      peroid: klineInfo[3]
    };
  }
  klines = inputData.data || inputData || [];

  klines.forEach((k, idx) => {
    k.index = idx;
    k.highIncrease = (k.high - k.open) / k.open; // 最高增幅
    k.lowDescrease = (k.low - k.open) / k.open; // 最低增幅
    k.closePercent = (k.close - k.open) / k.open;
    const day = moment(k.id * 1e3);
    k.datetime = day.format('YYYY-MM-DD HH:mm');
    k.HH = day.format('HH') + '点';
    k.WeekDay = '周' + WEEKDAYS[day.weekday()];
  });

  klineDataObj.klines = klines;
  return klineDataObj;
}
