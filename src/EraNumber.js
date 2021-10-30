import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon, Progress } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [era, setCurrentEra] = useState(0);
  const [blockCountdown, setBlockCountdown] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        // set current era
        const era = await api.query.dappsStaking.currentEra();
        setCurrentEra(era.toNumber());

        // set progress and block countdown
        const blockPerEra = await api.consts.dappsStaking.blockPerEra.toNumber();
        await api.derive.chain.bestNumber(bestNumber => {
          setProgress((bestNumber % blockPerEra) / blockPerEra * 100);
          setBlockCountdown(blockPerEra - (bestNumber % blockPerEra));
        });
      } catch (err) {
        console.error(err);
      }
    };
    getData();
  }, [api.consts.dappsStaking.blockPerEra, api.query.dappsStaking, api.derive.chain]);

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

export default function EraNumber (props) {
  const { api } = useSubstrate();
  return api.query.dappsStaking.currentEra
    ? <Main {...props} />
    : null;
}
