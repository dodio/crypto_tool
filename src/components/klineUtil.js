import _ from 'lodash';

export function conbineKlines (klines) {
  const firstK = klines[0];
  const lastK = _.last(klines);
  if (!firstK) {
    throw new Error('klines is empty');
  }
  const newKline = {
    'amount': _.sumBy(klines, 'amount'),
    'close': lastK.close,
    'count': _.sumBy(klines, 'count'),
    'high': _.maxBy(klines, 'high').high,
    'id': firstK.id,
    'low': _.minBy(klines, 'low').low,
    'open': firstK.open,
    'vol': _.sumBy(klines, 'vol')
  };
  return newKline;
}
