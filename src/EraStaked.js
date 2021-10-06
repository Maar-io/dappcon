import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  // const [era, setCurrentEra] = useState(0);
  const [stakedTotal, setStakedTotal] = useState(0);
  // const currentEra = api.query.dappsStaking.currentEra;
  const eraRewardsAndStakes = api.query.dappsStaking.eraRewardsAndStakes;

  useEffect(() => {
    let unsubscribe;
    // currentEra(number => {
    //   setCurrentEra(number.toNumber());
    // })

    // api.query.dappsStaking.eraRewardsAndStakes(529, (result) => {
    //   const temp = result;
    //   console.log('staked = ', temp);
    //   setStakedTotal(temp);
    // })
    //   .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.dappsStaking, eraRewardsAndStakes]);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign='center'>
          <Statistic
            label='Staked tokens'
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
  return api.query.dappsStaking.eraRewardsAndStakes
    ? <Main {...props} />
    : null;
}
