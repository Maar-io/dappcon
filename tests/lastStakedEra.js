
const currentEra = await (await api.query.dappsStaking.currentEra()).toNumber();
const contract = '0x0000000000000000000000000000000000000005';
const getAddressEnum = (address) => ({ Evm: address });

const getEraStakes = async (
  contractAddress
) => {
  const eraStakes = await api.query.dappsStaking.contractEraStake.entries(
    getAddressEnum(contractAddress)
  );

  let eraStakeMap = new Map();
  eraStakes.forEach(([key, stake]) => {
    eraStakeMap.set(parseInt(key.args.map((k) => k.toString())[1]), stake);
  });

  return eraStakeMap;
};

const eraStakeMap = await getEraStakes(contract);
console.log('getEraStakes', eraStakeMap );

const getContractLastStakedEra = async (
  contractAddress
) => {
  const eraStakeMap = await getEraStakes(contract);
  const eraIndex = Math.max(...eraStakeMap.keys());

  return eraIndex;
};


const lastStakedEra = await getContractLastStakedEra(contract);
console.log('lastStakedEra', lastStakedEra );