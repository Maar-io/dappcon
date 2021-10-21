const contract = '0x0000000000000000000000000000000000000001';

const getAddressEnum = (address) => (
  { 'Evm': address }
);

const lastStaked = await api.query.dappsStaking.contractLastStaked(getAddressEnum(contract), result => {
  result.isNone ? res = 'never' : res = result.unwrap().toNumber();
  console.log('Era when contract was last staked is ', res);
})
  .catch(console.error);

await api.query.dappsStaking.contractEraStake(getAddressEnum(contract), parseInt(3), result => { // TODO unsigned(laststaked)
  result.isNone ? res = 'never' : res = result.unwrap().total.toHuman();
  console.log('Total steked =', res);
})
  .catch(console.error);
  