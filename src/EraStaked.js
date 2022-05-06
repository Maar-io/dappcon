import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
const DECIMALS = 1_000_000_000_000_000_000;

function Main (props) {
  const { api } = useSubstrate();
  const [era, setCurrentEra] = useState(0);
  const [stakedTotal, setStakedTotal] = useState(0);
  const [totalReward, setTotalRewards] = useState(0);
  const [dappReward, setDappRewards] = useState(0);

  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.currentEra(e => {
      setCurrentEra(e.toNumber());
    });

    api.query.dappsStaking.generalEraInfo(era, (result) => {
      if (result.isNone) {
        setStakedTotal('<None>');
      } else {
        const tvl = parseInt(result.unwrap().staked.valueOf() / DECIMALS / 1_000_000);
        setStakedTotal(tvl);
      }
    })
      .catch(console.error);

    api.query.dappsStaking.blockRewardAccumulator((result) => {
      if (result.isNone) {
        setTotalRewards('<None>');
      } else {
        const totalReward = (parseInt(result.stakers) + parseInt(result.dapps)) / DECIMALS;
        const dappReward = parseInt(result.dapps) / DECIMALS;
        setTotalRewards(parseInt(totalReward));
        setDappRewards(parseInt(dappReward));
      }
    })
      .catch(console.error);

    return () => unsubscribe;
  }, [api.query.dappsStaking, era]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign='center'>
          <Statistic
            label='TVL in dApps (mil)'
            value={stakedTotal}
          />
        </Card.Content>
        <Card.Content extra>

          dapp rewards
          <Icon name='hand point right outline' />
          {dappReward} ({totalReward})
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
