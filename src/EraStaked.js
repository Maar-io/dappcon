import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  // const [era, setCurrentEra] = useState(0);
  const [stakedTotal, setStakedTotal] = useState(42);
  const [preApproval, setPreApproval] = useState('unknown');
  // const currentEra = api.query.dappsStaking.currentEra;
  const eraRewardsAndStakes = api.query.dappsStaking.eraRewardsAndStakes;
  

  useEffect(() => {
    let unsubscribe;
    // currentEra(number => {
    //   setCurrentEra(number.toNumber());
    // })

    api.query.dappsStaking.preApprovalIsEnabled( (result) => {
      setPreApproval(result.toString());
    })
      .catch(console.error);
    // api.query.dappsStaking.eraRewardsAndStakes(529, (result) => {
    //   const temp = result;
    //   console.log('staked = ', temp);
    //   setStakedTotal(temp);
    // })
    //   .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.dappsStaking, eraRewardsAndStakes]);

  // useEffect(() => {
  //   let unsubscribeAll = null;
  //   currentEra(number => {
  //     setCurrentEra(number.toNumber());
  //     setEraCountdown(blockPerEra.toNumber() * blockDuration);
  //   })
  //     .then(unsub => {
  //       unsubscribeAll = unsub;
  //     })
  //     .catch(console.error);

  //   console.log('currentEra', currentEra);
  //   console.log('blockPerEra', blockPerEra);
  //   return () => unsubscribeAll && unsubscribeAll();
  // }, [currentEra, blockPerEra]);

  // const countDown = () => {
  //   setEraCountdown(time => time - 1);
  // };

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
         preappoval enabled: {preApproval}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function CurrentEra (props) {
  const { api } = useSubstrate();
  return api.query.dappsStaking.currentEra
    ? <Main {...props} />
    : null;
}
