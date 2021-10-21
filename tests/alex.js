function objectMap(object, mapFn) {
    return Object.keys(object).reduce(function(result, key) {
      result[key] = mapFn(key, object[key])
      return result
    }, {})
  }
const TARGET_ERA = '5';
const TARGET_CONTRACT = '0x4D4e6e07D480F3AAE931c31430bc61ea7ef29052';
const DAPP_STAKING_ACCOUNT = 'YQnbw3oWxBk2zTouRxQyxnD2dDCFsGrRGQRaCeDLy7KKMdJ';
const ROOT = '5Cfy2rt4swoT8q1ZBut8ubxaAn7VJbwjsg9Hi7hTEwqeL8dJ';
const staking_summary = (await api.query.dappsStaking.eraRewardsAndStakes(TARGET_ERA)).toJSON();
const era_rewards = BigInt(staking_summary.rewards);
const era_stake = BigInt(staking_summary.staked);
console.log(`ERA => REWARDS: ${era_rewards} STAKE: ${era_stake}`);
const staking_info = (await api.query.dappsStaking.contractEraStake(
{'Evm': TARGET_CONTRACT},
TARGET_ERA
)).toJSON();
const contract_stake = BigInt(staking_info.total);
const stakers = staking_info.stakers;
console.log(`CONTRACT => STAKE: ${contract_stake} STAKERS: ${Object.keys(stakers).length}`);
const contract_reward = era_rewards * contract_stake / era_stake;
const total_reward = contract_reward * BigInt(2);
console.log(`REWARD => CONTRACT ${contract_reward} DOUBLE ${total_reward}`);
const rewards = objectMap(stakers, (key, value) => total_reward * BigInt(value) / BigInt(staking_info.total));
//for (staker in rewards) {
//  console.log(`STAKER ${staker} REWARDS: ${rewards[staker]}`);
//}
let reward_transfers = [];
for (staker in rewards) {
    reward_transfers.push(api.tx.balances.forceTransfer(DAPP_STAKING_ACCOUNT, staker, rewards[staker]));
}
const batch = api.tx.utility.batch(reward_transfers);
await api.tx.sudo.sudo(batch).signAndSend(ROOT);

[
// Standard protocol
[0x4633C1F0F633Cc42FD0Ba394762283606C88ae52, 2],
[0x4633C1F0F633Cc42FD0Ba394762283606C88ae52, 3],
// CryptoSpells
[0x4D4e6e07D480F3AAE931c31430bc61ea7ef29052, 1],
[0x4D4e6e07D480F3AAE931c31430bc61ea7ef29052, 2],
// My Crypto Heroes
[0xB715b849Cd7D8794Fe29e3363Efa8c419A68f6aa, 1],
[0xB715b849Cd7D8794Fe29e3363Efa8c419A68f6aa, 2],
// Community Rewards Program
[0xF87C7872Eff6F01de8efCB328471967b19E302a9, 1],
[0xF87C7872Eff6F01de8efCB328471967b19E302a9, 2]
]
