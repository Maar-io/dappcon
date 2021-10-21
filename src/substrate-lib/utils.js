const utils = {
  paramConversion: {
    num: [
      'Compact<Balance>',
      'BalanceOf',
      'u8', 'u16', 'u32', 'u64', 'u128',
      'i8', 'i16', 'i32', 'i64', 'i128'
    ]
  }
};

const getAddressEnum = (address) => (
  { 'Evm': address }
);

const getEraStakes = (
  contractAddress
) => {
  let eraStakeMap = new Map();

  api.query.dappsStaking.contractEraStake.entries(
    getAddressEnum(contractAddress)
  ).then(eraStakes => {
    eraStakes.forEach(([key, stake]) => {
      console.log('[key, stake] = ', key, stake)
      eraStakeMap.set(parseInt(key.args.map((k) => k.toString())[1]), stake);
    });
    console.log('getEraStakes eraStakeMap', eraStakeMap);
    return eraStakeMap;
  });
};

export default { utils, getEraStakes };
