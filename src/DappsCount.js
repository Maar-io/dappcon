import { Null } from '@polkadot/types';
import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [dappsCount, setDappsCount] = useState(0);
  const [preApproval, setPreApproval] = useState('unknown');

  const regDapp = api.query.dappsStaking.registeredDapps;
  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.preApprovalIsEnabled((result) => {
      setPreApproval(result.toString());
    });
    console.log('registeredDapps', dappsCount);
    regDapp(Null, newValue => {
      if (newValue.isNone) {
        setDappsCount('<None>');
        console.log('newValue <None>');
      } else {
        setDappsCount(newValue.unwrap().toNumber());
        console.log('newValue.unwrap()', newValue.unwrap());
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.dappsStaking, dappsCount]);

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
  return api.query.dappsStaking.registeredDapps
    ? <Main {...props} />
    : null;
}
