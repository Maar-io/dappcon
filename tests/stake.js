const contract = '0x0000000000000000000000000000000000000002';
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

const getAddressEnum = (address) => (
  { 'Evm': address }
);

// Create a extrinsic, Bob stakes 100 tokens on the contract.
const amount = BigNumber(100_000_000_000_000_000_000);
const stake = api.tx.dappsStaking.bondAndStake(getAddressEnum(contract), amount);

await stake.signAndSend(BOB, ({ events = [], status }) => {
  if (status.isInBlock) {
    console.log('Successful stake of ' + contract + ' with hash ' + status.asInBlock.toHex());
  } else {
    console.log('Status of transfer: ' + status.type);
  }

  events.forEach(({ phase, event: { data, method, section } }) => {
    console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
  });
});
  