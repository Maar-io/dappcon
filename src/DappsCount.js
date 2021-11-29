import React, { useEffect, useState } from 'react';
import { Statistic, Grid, Card, Icon, Progress } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [dappsCount, setDappsCount] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [numStakers, setNumStakers] = useState(0);
  const [fillup, setFillup] = useState(0);

  const getAddressEnum = (address) => (
    { Evm: address }
  );

  useEffect(() => {
    const calcProgress = async () => {
      try {
        const maxStakers = await api.consts.dappsStaking.maxNumberOfStakersPerContract.toNumber();
        const available = dappsCount * maxStakers;
        setFillup(numStakers / available * 100);
      } catch (err) { console.error(err); }
    };
    calcProgress();
  }, [dappsCount, api.consts.dappsStaking.maxNumberOfStakersPerContract, numStakers]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        let result = await api.query.dappsStaking.registeredDapps.keys();
        result = result.map(c => '0x' + c.toString().slice(-40));
        setContracts(result);
      } catch (err) { console.error(err); }
    };
    fetchContracts();
  }, [api.query.dappsStaking]);

  useEffect(() => {
    const calcNumStakers = async () => {
      const currentEra = (await api.query.dappsStaking.currentEra()).toNumber();
      contracts.forEach(async selectedContract => {
        // iterate from currentEra backwards until you find record for ContractEraStake
        for (let era = currentEra; era > 0; era -= 1) {
          try {
            const staking_info = (await api.query.dappsStaking.contractEraStake(
              getAddressEnum(selectedContract), era
            )).toJSON();

            if (staking_info !== null){
              // found record for ContractEraStake
              const stakerNum = Object.keys(staking_info.stakers).length
              console.log('Num stakers =', stakerNum );
              setNumStakers(s => s + stakerNum);
              break;
            }
          } catch (err) {
            console.error(err);
            console.log('DappsCount contractEraStake.entries failed');
          }
        }
      });
    };
    calcNumStakers();
  }, [api.query.dappsStaking, contracts]);

  useEffect(() => {
    const queryRegisteredDapps = async () => {
      return await api.query.dappsStaking.registeredDapps.keys((result) => {
        console.log('dappsCount =', result.length);
        setDappsCount(result.length);
      });
    }

    const unsub = queryRegisteredDapps();

    return function cleanup() {
      unsub;
    };
  });

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
          Stakers Count and Capacity:
          <Icon name='user' /> {numStakers}
          <Progress percent={fillup} indicating warning />
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
