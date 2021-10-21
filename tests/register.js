const contract = '0x0000000000000000000000000000000000000002';
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

const getAddressEnum = (address) => (
  { 'Evm': address }
);

// Create a extrinsic, transferring randomAmount units to Bob.
const register = api.tx.dappsStaking.register(getAddressEnum(contract));

await register.signAndSend(
  ALICE, 
  ({ events = [], status }) => {
  if (status.isInBlock) {
    console.log('Successful registration of ' + contract + ' with hash ' + status.asInBlock.toHex());
  } else {
    console.log('Status of transfer: ' + status.type);
  }

  events.forEach(({ phase, event: { data, method, section } }) => {
    console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
  });
});
  