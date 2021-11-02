const CONTRACT = '0x0000000000000000000000000000000000000001';
const ERA = 3;

const getAddressEnum = (address) => (
  { 'Evm': address }
);

await api.query.dappsStaking.contractEraStake(getAddressEnum(CONTRACT), parseInt(ERA), result => {
  result.isNone ? res = 'never' : res = result.unwrap().total.toHuman();
  console.log('Total steked =', res);
})
  .catch(console.error);
