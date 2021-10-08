import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
const CONTRACT = '0x0000000000000000000000000000000000000002';

function Main (props) {
  const { api } = useSubstrate();
  const [dappsCount, setDappsCount] = useState(0);
  const [preApproval, setPreApproval] = useState('unknown');

  const getAddressEnum = (address) => (
      {'Evm': address}
    );

  // const contractEraStake = api.query.dappsStaking.contractEraStake;
  // useEffect(() => {
  //   let unsubscribeAll = null;
  //   contractEraStake(getAddressEnum(CONTRACT), 529, result => {
  //     console.log('contractEraStake ', result.unwrap().toHuman());
  //   })
  //   .then(unsub => {
  //     unsubscribeAll = unsub;
  //   })
  //   .catch(console.error);
  //   return () => unsubscribeAll && unsubscribeAll();
  // }, [contractEraStake]);


  const regDapp = api.query.dappsStaking.registeredDapps;
  useEffect(() => {
    let unsubscribe;
    api.query.dappsStaking.preApprovalIsEnabled((result) => {
      setPreApproval(result.toString());
    });
    console.log(getAddressEnum(CONTRACT));
    regDapp(getAddressEnum(CONTRACT), result => {
      if (result.isNone) {
        setDappsCount('<None>');
        console.log('registeredDapps <None>');
      } else {
        setDappsCount(100);
        console.log('registeredDapps result', result.toString());
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
    .catch(console.error);
    console.log('registeredDapps end', dappsCount);

    return () => unsubscribe && unsubscribe();
  }, [regDapp]);

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
