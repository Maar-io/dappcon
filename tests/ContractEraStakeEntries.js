const CONTRACT = '0xf87c7872eff6f01de8efcb328471967b19e302a9';

const currentEra = await (await api.query.dappsStaking.currentEra()).toNumber();
console.log('currentEra', currentEra );

const eraStakes = await api.query.dappsStaking.contractEraStake.entries({ Evm: CONTRACT });

let eraStakeMap = new Map();
  eraStakes.forEach(([key, stake]) => {
    eraStakeMap.set(parseInt(key.args.map((k) => k.toString())[1]), stake);
  });
console.log('eraStakeMap', eraStakeMap );
const lastStakedEra = Math.max(...eraStakeMap.keys());
console.log('lastStakedEra', lastStakedEra );