import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [dappsCount, setDappsCount] = useState(0);
  const [preApproval, setPreApproval] = useState('unknown');

  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.preApprovalIsEnabled((result) => {
      setPreApproval(result.toString());
    });

    unsubscribe = api.query.dappsStaking.registeredDapps.keys().then(
      result => {
        setDappsCount(result.length);
      }
    )
      .catch(console.error);

    return () => unsubscribe;
  }, [api.query.dappsStaking, api.query.dappsStaking.registeredDapps]);

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
          preappoval enabled: {preApproval}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function DappsCount (props) {
  const { api } = useSubstrate();
  return api.query.dappsStaking &&
    api.query.dappsStaking.registeredDapps
    ? <Main {...props} />
    : null;
}
