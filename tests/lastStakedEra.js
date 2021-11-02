const CONTRACT = '0xf87c7872eff6f01de8efcb328471967b19e302a9';

const currentEra = await(await api.query.dappsStaking.currentEra()).toNumber();
console.log('currentEra', currentEra);

for (era = currentEra; era > currentEra - 10; era -= 1) {
  try {
    await api.query.dappsStaking.contractEraStake({ Evm: CONTRACT }, era);
    console.log('lastStakedEra', era);
    break;
  } catch { console.error }
}