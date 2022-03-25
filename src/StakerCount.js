import React, { useEffect, useState } from 'react';
import { Grid, Card, Statistic } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';

function Main (props) {
  const { api } = useSubstrate();
  const [contracts, setContracts] = useState([]);
  const [numStakers, setNumStakers] = useState(0);

  const getAddressEnum = (address) => (
    { Evm: address }
  );

  const fetchContracts = () => {
    api.query.dappsStaking.registeredDapps.keys().then(
      result => {
        // console.log('registeredDapps result', result);
        const r = result.map(c => '0x' + c.toString().slice(-40));
        // console.log(r);
        const contractList = r.map(c => (c));
        console.log('fetchContracts', contractList);
        setContracts(contractList);
      }
    )
      .catch(console.error);
  };

  const queryEraStakeMap = () => {
    const getInfo = async () => {
      contracts.forEach(async selectedContract => {
        const eraStakeMap = new Map();
        try {
          const [eraMap] = await Promise.all([
            api.query.dappsStaking.contractEraStake.entries(
              getAddressEnum(selectedContract)
            )
          ]);
          // console.log('contractEraStake.entries ', eraMap);
          eraMap.forEach(([key, points]) => {
            // console.log('[key, points] = ', key, points);
            const eraKey = parseInt(key.args.map((k) => k.toString())[1]);
            // console.log('eraKey', eraKey);
            eraStakeMap.set(eraKey, points.toJSON());
          });

          // console.log('queryEraStakeMap eraStakeMap', eraStakeMap);
          if (eraStakeMap.size !== 0) {
            // number of stakers
            const lastStaked = Math.max(...eraStakeMap.keys());
            // console.log('queryEraStakeMap lastStaked', lastStaked);
            const entry = eraStakeMap.get(lastStaked);
            const stakerNum = parseInt(entry.number_of_stakers);
            // console.log('queryEraStakeMap stakerNum', stakerNum);
            setNumStakers(s => s + stakerNum);
          }
        } catch (e) {
          console.error(e);
        }
      });
    };
    getInfo();
  };

  useEffect(fetchContracts, [api.query.dappsStaking]);
  useEffect(queryEraStakeMap, [api.query.dappsStaking, contracts]);

  return (
    <Grid.Column>
      <Card color='purple'>
        <Card.Content textAlign='center'>
          <Statistic
            label='Stakers Count'
            value={numStakers}
          />
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function StakerCount (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
