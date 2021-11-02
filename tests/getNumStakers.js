// Shiden
const CONTRACT = '0xf87c7872eff6f01de8efcb328471967b19e302a9';
const ERA = 15;

try {
  const eraStake = (await api.query.dappsStaking.contractEraStake({ 'Evm': CONTRACT }, ERA)).toJSON();
  const stakerNum = Object.keys(eraStake.stakers).length;
  console.log('stakerNum = ', stakerNum);
} catch (err) {
  console.error(err);
  console.log('failed')
};


// Shibuya testnet
const CONTRACT = '0x03b233193e1f59edbdb154a9f59347dd40584f5a';
const ERA = 15;
