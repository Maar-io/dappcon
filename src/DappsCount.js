import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
const CONTRACT = '0x0000000000000000000000000000000000000002';

function Main (props) {
  const { api } = useSubstrate();
  const [dappsCount, setDappsCount] = useState(0);
  const [preApproval, setPreApproval] = useState('unknown');

  const getAddressEnum = (address) => (
    [{"Evm": address}]
  );

  const regDapp = api.query.dappsStaking.registeredDevelopers;
  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.preApprovalIsEnabled((result) => {
      setPreApproval(result.toString());
    });
    console.log(getAddressEnum(CONTRACT));
    regDapp({}, result => {
      if (result.isNone) {
        setDappsCount('<None>');
        console.log('registeredDapps <None>');
      } else {
        // const tvl = result.unwrap().staked.valueOf() / DECIMALS;
        // setStakedTotal(tvl);
        setDappsCount(100);
        console.log('registeredDapps.unwrap()', result.unwrap());
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
    .catch(console.error);
    console.log('registeredDapps end', dappsCount);

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
