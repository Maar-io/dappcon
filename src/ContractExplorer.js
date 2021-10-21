import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Table, Header, Menu, Icon, Divider } from 'semantic-ui-react';
import { useSubstrate, utils } from './substrate-lib';
// import getEraStakes from './utils';
const DECIMALS = 1_000_000_000_000_000_000;


function Main(props) {
  const { api } = useSubstrate();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [lastStaked, setLastStaked] = useState(0);
  const [formState, setFormState] = useState(0);
  const [developer, setDeveloper] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState(0);
  const [numStakers, setNumStakers] = useState(0);
  const [previousStaked, setPreviousStaked] = useState(0);

  const getAddressEnum = (address) => (
    { 'Evm': address }
  );

  const fetchContracts = () => {
    api.query.dappsStaking.registeredDapps.keys().then(
      result => {
        console.log('registeredDapps result', result);
        const r = result.map(c => '0x' + c.toString().slice(-40))
        console.log(r);
        const contractList = r.map(c => ({ key: c, value: c, text: c }));
        console.log('fetchContracts', contractList);
        setContracts(contractList);
      }
    )
      .catch(console.error);
  };

  const resetContractInfo = () => {
    setDeveloper(0);
    setLastStaked(0);
    setLastClaimed(0);
    setNumStakers('?');
    setTotalStaked(0);
    setClaimedRewards('?');
  };

  const onContractChange = (_, data) => {
    resetContractInfo()
    console.log('onContractChange value', data.value);
    setSelectedContract(data.value);
    setFormState(data.value);
  };

  const queryDeveloper = () => {
    console.log('queryDeveloper selectedContract is', selectedContract);
    let res;
    api.query.dappsStaking.registeredDapps(getAddressEnum(selectedContract), result => {
      result.isNone ? res = 'none' : res = result.unwrap().toHuman();
      console.log('queryDeveloper res', res);
      setDeveloper(res);
    })
      .catch(console.error);
  }
  
  const queryEraStakeMap = () => {
    const getInfo = async () => {
      let eraStakeMap = new Map();

      try {
        const [eraMap] = await Promise.all([
          api.query.dappsStaking.contractEraStake.entries(
            getAddressEnum(selectedContract)
          ),
        ]);
        // console.log('contractEraStake.entries ', eraMap);
        eraMap.forEach(([key, points]) => {
          // console.log('[key, points] = ', key, points);
          const eraKey = parseInt(key.args.map((k) => k.toString())[1]);
          // console.log('eraKey', eraKey);
          eraStakeMap.set(eraKey, points.toJSON());
        });

        console.log('queryEraStakeMap eraStakeMap', eraStakeMap);
        if (eraStakeMap.size !== 0) {
          // contract last staked
          const lastStaked = Math.max(...eraStakeMap.keys());
          console.log('queryEraStakeMap lastStaked', lastStaked);
          setLastStaked(lastStaked);
          
          // number of stakers
          const entry = eraStakeMap.get(lastStaked);
          const stakerNum = Object.keys(entry.stakers).length;
          console.log('queryEraStakeMap stakerNum', stakerNum);
          setNumStakers(stakerNum)

          // total staked on the contract
          const total = parseInt(entry.total / DECIMALS);
          console.log('queryEraStakeMap total', total);
          setTotalStaked(total);

          // total rewards on the contract
          const rewards = parseInt(entry.claimed_rewards / DECIMALS);
          console.log('queryEraStakeMap claimed_rewards', rewards);
          setClaimedRewards(rewards);
        }

      } catch (e) {
        console.error(e);
      }
    };
    getInfo();
  };

  useEffect(fetchContracts, [api.query.dappsStaking]);
  useEffect(queryDeveloper, [selectedContract]);
  useEffect(queryEraStakeMap, [selectedContract]);

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
          lastClaimed={lastClaimed}
          lastStaked={lastStaked}
          totalStaked={totalStaked}
          claimedRewards={claimedRewards}
          contract={selectedContract}
          previousStaked={previousStaked}
        />
        {/* <Stakers 
          contract={selectedContract}
        /> */}
      </Form>
    </Grid.Column>

  );
}

function DisplayTable(props) {
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
                {props.lastClaimed}
                <Header.Subheader>Contract Last Claimed</Header.Subheader>
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
          {/* <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                {props.previousStaked}
                <Header.Subheader>Previously staked era</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell> */}
        </Table.Row>
      </Table.Body>
    </Table>
  </div>
}

export default function ContractExplorer(props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
