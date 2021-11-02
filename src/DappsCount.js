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
    const queryEraStakeMap = async () => {
      contracts.forEach(async selectedContract => {
        const eraStakeMap = new Map();
        try {
          const eraMap = await api.query.dappsStaking.contractEraStake.entries(
            getAddressEnum(selectedContract)
          );
          // console.log('DappsCount contractEraStake.entries = ', eraMap);
          eraMap.forEach(([key, points]) => {
            const eraKey = parseInt(key.args.map((k) => k.toString())[1]);
            eraStakeMap.set(eraKey, points.toJSON());
          });

          if (eraStakeMap.size !== 0) {
            // number of stakers
            const lastStaked = Math.max(...eraStakeMap.keys());
            const entry = eraStakeMap.get(lastStaked);
            const stakerNum = Object.keys(entry.stakers).length;
            setNumStakers(s => s + stakerNum);
          }
        } catch (err) {
          console.error(err);
          console.log('DappsCount contractEraStake.entries failed');
        }
      });
    };
    queryEraStakeMap();
  }, [api.query.dappsStaking, contracts]);

  useEffect(() => {
    const queryRegisteredDapps = async () => {
      try {
        const result = await api.query.dappsStaking.registeredDapps.keys();
        console.log('dappsCount =', result.length);
        setDappsCount(result.length);
      } catch (err) { console.error(err); }
    };
    queryRegisteredDapps();
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
