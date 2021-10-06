import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main(props) {
  const { api } = useSubstrate();
  const [era, setCurrentEra] = useState(0);
  const [dappsCount, setDappsCount] = useState(0);

  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.registeredDapps(newValue => {
      // The storage value is an Option<u32>
      // So we have to check whether it is None first
      // There is also unwrapOr
      currentEra(number => {
        setCurrentEra(number.toNumber());
        setEraCountdown(blockPerEra.toNumber() * blockDuration);
      })
      if (newValue.isNone) {
        setDappsCount('<None>');
      } else {
        setDappsCount(newValue.unwrap().toNumber());
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.dappsStaking]);

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
            label='dApps Count'
            value={dappsCount}
          />
        </Card.Content>
        <Card.Content extra>
          <Icon name='time' />
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function CurrentEra(props) {
  const { api } = useSubstrate();
  return api.query.dappsStaking.currentEra
    ? <Main {...props} />
    : null;
}
