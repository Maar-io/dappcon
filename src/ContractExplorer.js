import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Table, Header, Icon } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
const DECIMALS = 1_000_000_000_000_000_000;

function Main (props) {
  const { api } = useSubstrate();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(0);
  const [oldestToClaim, setOldestToClaim] = useState(0);
  const [lastStaked, setLastStaked] = useState(0);
  const [formState, setFormState] = useState(0);
  const [developer, setDeveloper] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState(0);
  const [numStakers, setNumStakers] = useState(0);
  const [erasToClaim, setErasToClaim] = useState(0);
  const [firstTime, setFirstTimeStaked] = useState(0);

  const getAddressEnum = (address) => (
    { Evm: address }
  );

  const resetContractInfo = () => {
    setDeveloper(0);
    setLastStaked(0);
    setOldestToClaim(0);
    setNumStakers('?');
    setTotalStaked(0);
    setClaimedRewards('?');
    setErasToClaim(0);
  };

  const onContractChange = (_, data) => {
    resetContractInfo();
    console.log('onContractChange value', data.value);
    setSelectedContract(data.value);
    setFormState(data.value);
  };

  const queryEraStakeMap = () => {
    const getInfo = async () => {
      const eraStakeMap = new Map();

      try {
        const eraMap = await api.query.dappsStaking.contractEraStake.entries(
          getAddressEnum(selectedContract)
        );
        console.log('contractEraStake.entries ', eraMap);
        eraMap.forEach(([key, points]) => {
          // console.log('[key, points] = ', key, points);
          const eraKey = parseInt(key.args.map((k) => k.toString())[1]);
          // console.log('eraKey', eraKey);
          eraStakeMap.set(eraKey, points.toJSON());
        });

        console.log('queryEraStakeMap eraStakeMap', eraStakeMap);
        if (eraStakeMap.size !== 0) {
          // TODO: Not correct anymore since the map is no longer sparse - we have entry for each era.
          // contract last staked
          const lastStaked = Math.max(...eraStakeMap.keys());
          console.log('queryEraStakeMap lastStaked', lastStaked);
          setLastStaked(lastStaked);

          // number of stakers
          const entry = eraStakeMap.get(lastStaked);
          const stakerNum = parseInt(entry.number_of_stakers);
          console.log('queryEraStakeMap stakerNum', stakerNum);
          setNumStakers(stakerNum);

          // total staked on the contract
          const total = parseInt(entry.total / DECIMALS);
          console.log('queryEraStakeMap total', total);
          setTotalStaked(total);

          // last claimed amount of rewards on the contract
          // TODO: this isn't valid anymore
          const rewards = 0;
          console.log('queryEraStakeMap last claimed_rewards', rewards);
          // oldest era to Claim
          api.query.dappsStaking.currentEra(currentEra => {
            // TODO: there is no more history depth
            const historyDepth = currentEra;
            let firstStakedEra = Math.min(...eraStakeMap.keys());
            setClaimedRewards(0);
            setFirstTimeStaked(firstStakedEra);
            firstStakedEra = Math.max(firstStakedEra, Math.max(1, currentEra - historyDepth));
            let oldest = firstStakedEra;
            // find era when it was last claimed
            for (let era = firstStakedEra; era <= currentEra; era++) {
              const mapEntry = eraStakeMap.get(era);
              if (typeof (mapEntry) !== 'undefined') {
                // TODO: not relevant anymore
                const claimed = 1;
                setClaimedRewards(r => r + claimed);
                // console.log('claimedRewards = ', era, claimed);
                if (claimed === 0) {
                  oldest = era - 1;
                  // console.log('oldest  0 = ', era);
                  break;
                }
              } else { // map entry can be undefined if there were no staking in last era
                oldest = era - 1;
                // console.log('oldest = ', era);
              }
            }
            setOldestToClaim(oldest);
            setErasToClaim(currentEra - oldest - 1);
          }).catch(console.error);
        }
      } catch (err) {
        console.error(err);
        console.log('queryEraStakeMap failed');
      }
    };
    getInfo();
  };

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const result = await api.query.dappsStaking.registeredDapps.keys();
        console.log('registeredDapps result', result);
        const r = result.map(c => '0x' + c.toString().slice(-40));
        // console.log(r);
        const contractList = r.map(c => ({ key: c, value: c, text: c }));
        console.log('fetchContracts', contractList);
        setContracts(contractList);
      } catch (err) {
        console.error(err);
        console.log('fetchContracts registeredDapps.keys() failed');
      }
    };
    fetchContracts();
  }, [api.query.dappsStaking]);

  useEffect(() => {
    const queryDeveloper = async () => {
      try {
        const result = await api.query.dappsStaking.registeredDapps(getAddressEnum(selectedContract));
        let res;
        result.isNone ? res = 'none' : res = result.unwrap().developer.toHuman();
        console.log('contract=', selectedContract, 'setDeveloper to', res);
        setDeveloper(res);
      } catch (err) {
        console.error(err);
        console.log('queryEraStakeMap registeredDapps failed');
      }
    };
    queryDeveloper();
  }, [api.query.dappsStaking, selectedContract]);

  // TODO: removed history depth
  useEffect(queryEraStakeMap, [api.query.dappsStaking, selectedContract]);

  return (
    <Grid.Column width={8}>
      <h1>Contract Explorer</h1>
      <Form>
        <Form.Field>
          <Dropdown
            placeholder='Contract'
            fluid
            label='Contract'
            onChange={onContractChange}
            search
            selection
            value={formState}
            options={contracts}
          />
        </Form.Field>
        <DisplayTable
          developer={developer}
          numStakers={numStakers}
          firstTime={firstTime}
          oldestToClaim={oldestToClaim}
          lastStaked={lastStaked}
          totalStaked={totalStaked}
          claimedRewards={claimedRewards}
          contract={selectedContract}
          erasToClaim={erasToClaim}
        />
      </Form>
    </Grid.Column>

  );
}

function DisplayTable (props) {
  return <div style={{ overflowWrap: 'break-word' }}>
    <img alt='robots' src={`https://robohash.org/${props.contract}`} />
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell >Contract Address</Table.HeaderCell>
          <Table.HeaderCell >{props.contract}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell >Developer's account:</Table.HeaderCell>
          <Table.HeaderCell >{props.developer}</Table.HeaderCell>
          <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                {props.firstTime}
                <Header.Subheader>First Time Staked</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                {props.lastStaked}
                <Header.Subheader>Contract Last Staked</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell >
            <Header as='h2'>
              <Header.Content>
                {props.oldestToClaim}
                <Header.Subheader>Last Era Claimed</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                <Icon name='user' />
                {props.numStakers}
                <Header.Subheader>Number of Stakers</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                {props.totalStaked}
                <Header.Subheader>Total Staked</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell >
            <Header as='h2'>
              <Header.Content>
                {props.claimedRewards}
                <Header.Subheader>Claimed Rewards</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                {props.erasToClaim}
                <Header.Subheader>Unclaimed eras</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </div>;
}

export default function ContractExplorer (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
