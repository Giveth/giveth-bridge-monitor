// eslint-ignore
import BigNumber from 'bignumber.js';

export const estimateGasFees = async context => {
  const block = await context.library.eth.getBlock('latest');
  const baseFee = block.baseFeePerGas;
  const maxFeePerGas = new BigNumber(baseFee).multipliedBy(2);
  const maxPriorityFeePerGas = new BigNumber('3000000000');
  return { maxFeePerGas, maxPriorityFeePerGas, type: '0x2' };
};

export const sendTx = async (context, tx) => {
  const gas = await estimateGasFees(context);
  tx.send({ from: context.account, ...gas });
};
