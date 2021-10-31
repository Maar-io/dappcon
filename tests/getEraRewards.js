const contract = '0xcd8620889c1dA22ED228e6C00182177f9dAd16b7';
const DECIMALS = 1_000_000_000_000_000_000;

const currentEra = await (await api.query.dappsStaking.currentEra()).toNumber();
console.log("current era", currentEra);

const getEraStakeMap = async (
  contractAddress
) => {
  const eraStakes = await api.query.dappsStaking.contractEraStake.entries(
    { Evm: contractAddress }
  );

  let eraStakeMap = new Map();
  eraStakes.forEach(([key, stake]) => {
    eraStakeMap.set(parseInt(key.args.map((k) => k.toString())[1]), stake);
  });
  console.log("found records for this contract:", eraStakeMap.size);

  return eraStakeMap;
};

const printEraRewards = async (
    contractAddress
    ) => {
        const eraStakeMap = await getEraStakeMap(contract);
        let firstStakedEra = Math.min(...eraStakeMap.keys());
        console.log("first staked era", firstStakedEra);
        for (let era = firstStakedEra; era <= currentEra; era++) {
            const mapEntry = eraStakeMap.get(era);
            console.log('mapEntry = \n', mapEntry.stakers.size);
            if (typeof (mapEntry) !== 'undefined') {
                const claimed = parseInt(mapEntry.total / DECIMALS);
                console.log('claimedRewards = ', era, claimed, mapEntry.claimedRewards);
            }
        } 
    };

printEraRewards(contract);