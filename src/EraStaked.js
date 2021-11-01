import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
const DECIMALS = '1000000000000000000';

function Main (props) {
  const { api } = useSubstrate();
  // const [era, setCurrentEra] = useState(0);
  const [stakedTotal, setStakedTotal] = useState(0);
  const [rewards, setRewards] = useState(0);

  useEffect(() => {
    const updateData = async () => {
      try {
        // read current era
        const era = await api.query.dappsStaking.currentEra();

        // read rewards and staked for current era
        const result = await api.query.dappsStaking.eraRewardsAndStakes(era);

        // extract staked amount (TVL)
        const tvl = parseInt(result.unwrap().staked.valueOf() / DECIMALS);
        console.log('TVL =', tvl);
        setStakedTotal(tvl);

        // read accumulated rewards in this era
        const acc = await api.query.dappsStaking.blockRewardAccumulator();
        const reward = parseInt(acc / DECIMALS);
        setRewards(reward);
      } catch (err) { console.error(err); }
    };
    updateData();
  }, [api.query.dappsStaking, api.query.dappsStaking.blockRewardAccumulator]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign='center'>
          <Statistic
            label='TVL in dApps'
            value={stakedTotal}
          />
        </Card.Content>
        <Card.Content extra>
          upcoming rewards
          <Icon name='hand point right outline' />
          {rewards}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function EraStaked (props) {
  const { api } = useSubstrate();
  return api.query.dappsStaking
    ? <Main {...props} />
    : null;
}
