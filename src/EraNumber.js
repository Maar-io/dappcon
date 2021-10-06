import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  // const { network } = props;
  const [era, setCurrentEra] = useState(0);
  const [eraCountdown, setEraCountdown] = useState(0);
  const blockPerEra = api.consts.dappsStaking.blockPerEra;
  const currentEra = api.query.dappsStaking.currentEra;
  const blockDuration = 2; // TODO duration per network

  useEffect(() => {
    let unsubscribeAll = null;
    currentEra(number => {
      setCurrentEra(number.toNumber());
      setEraCountdown(blockPerEra.toNumber() * blockDuration);
    })
      .then(unsub => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    console.log('currentEra', currentEra);
    console.log('blockPerEra', blockPerEra);
    return () => unsubscribeAll && unsubscribeAll();
  }, [currentEra, blockPerEra]);

  const countDown = () => {
    setEraCountdown(time => time - 1);
  };

  useEffect(() => {
    const id = setInterval(countDown, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign='center'>
          <Statistic
            label='Current Era'
            value={era}
          />
        </Card.Content>
        <Card.Content extra>
          <Icon name='time' /> {eraCountdown}
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
