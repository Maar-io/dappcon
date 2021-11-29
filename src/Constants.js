import React, { useEffect, useState } from 'react';
import { Icon, Step } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
const DECIMALS = 1_000_000_000_000_000_000;

function Main (props) {
  const { api } = useSubstrate();
  const [blocksPerEra, setBlocksPerEra] = useState(0);
  const [maxStakers, setMaxStakers] = useState(0);
  const [historyDepth, setHistoryDepth] = useState(0);
  const [minStaking, setMinStaking] = useState(0);

  useEffect(() => {
    let unsubscribe;
    const blockPerEra = api.consts.dappsStaking.blockPerEra.toNumber();
    setBlocksPerEra(blockPerEra);
    const stakers = api.consts.dappsStaking.maxNumberOfStakersPerContract.toNumber();
    setMaxStakers(stakers);
    const depth = api.consts.dappsStaking.historyDepth.toNumber();
    setHistoryDepth(depth);
    const stakingAmount = api.consts.dappsStaking.minimumStakingAmount.valueOf();
    setMinStaking(parseInt(stakingAmount / DECIMALS));
    return () => unsubscribe;
  }, [api.consts]);

  return (
    <Step.Group>
      <Step active>
        <Icon name='truck' />
        <Step.Content>
          <Step.Title>{blocksPerEra}</Step.Title>
          <Step.Description>Blocks per Era</Step.Description>
        </Step.Content>
      </Step>

      <Step active>
        <Icon name='user' />
        <Step.Content>
          <Step.Title>{maxStakers}</Step.Title>
          <Step.Description>Max Stakers per contract </Step.Description>
        </Step.Content>
      </Step>

      <Step active>
        <Icon name='exclamation triangle' />
        <Step.Content>
          <Step.Title>{historyDepth}</Step.Title>
          <Step.Description>Rewards expire (in eras) </Step.Description>
        </Step.Content>
      </Step>
      <Step active>
        <Icon name='money bill alternate' />
        <Step.Content>
          <Step.Title>{minStaking}</Step.Title>
          <Step.Description>Minimum staking amount </Step.Description>
        </Step.Content>
      </Step>
    </Step.Group>
  );
}

export default function Constants (props) {
  const { api } = useSubstrate();
  return api.consts
    ? <Main {...props} />
    : null;
}
