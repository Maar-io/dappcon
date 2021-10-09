import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
const DECIMALS = 1_000_000_000_000_000_000;

function Main (props) {
  const { api } = useSubstrate();
  const [era, setCurrentEra] = useState(0);
  const [stakedTotal, setStakedTotal] = useState(0);

  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.currentEra(e => {
      setCurrentEra(e.toNumber());
    });

    api.query.dappsStaking.eraRewardsAndStakes(era, (result) => {
      if (result.isNone) {
        setStakedTotal('<None>');
      } else {
        const tvl = parseInt(result.unwrap().staked.valueOf() / DECIMALS);
        setStakedTotal(tvl);
      }
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.dappsStaking, era]);

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
         stake
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
