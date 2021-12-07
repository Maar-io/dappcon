import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon, Progress } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main(props) {
  const { api } = useSubstrate();
  const [era, setCurrentEra] = useState(0);
  const [blockCountdown, setBlockCountdown] = useState(0);
  const [progress, setProgress] = useState(0);

  const blockPerEra = api.consts.dappsStaking.blockPerEra.toNumber();
  const currentEra = api.query.dappsStaking.currentEra;
  const bestNumber = api.derive.chain.bestNumber;

  useEffect(() => {
    let unsubscribeAll = null;

    bestNumber(number => {
      setProgress((number % blockPerEra) / blockPerEra * 100);
      setBlockCountdown(blockPerEra - (number % blockPerEra));
    })
      .then(unsub => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    api.query.dappsStaking.currentEra(e => {
      setCurrentEra(e.toNumber());
    }).catch(console.error);


    return () => unsubscribeAll && unsubscribeAll();
  }, [currentEra, bestNumber, blockPerEra, api.query.dappsStaking]);

  return (
    <Grid.Column>
      <Card color='purple'>
        <Card.Content textAlign='center'>
          <Statistic
            label='Current Era'
            value={era}
          />
        </Card.Content>
        <Card.Content extra>
          Blocks until new era :
          <Icon name='time' /> {blockCountdown}
          <Progress percent={progress} indicating success />
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
