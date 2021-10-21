import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Table, Header, Menu, Icon, Divider } from 'semantic-ui-react';
import { useSubstrate, utils } from './substrate-lib';
// import getEraStakes from './utils';


function Main(props) {
  const { api } = useSubstrate();
  const [callables, setCallables] = useState([]);
  const [selectedContract, setSelectedContract] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [lastStaked, setLastStaked] = useState(0);
  const [formState, setFormState] = useState(0);
  const [developer, setDeveloper] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState(0);
  const [numStakers, setNumStakers] = useState(0);
  const [previousStaked, setPreviousStaked] = useState(0);
  const [eraStakeMap, setEraStakeMap] = useState(0);

  const getAddressEnum = (address) => (
    { 'Evm': address }
  );

  const updateCallables = () => {
    api.query.dappsStaking.registeredDapps.keys().then(
      result => {
        console.log('registeredDapps result', result);
        const r = result.map(c => '0x' + c.toString().slice(-40))
        console.log(r);
        const callables = r.map(c => ({ key: c, value: c, text: c }));
        console.log('updateCallables callables', callables);
        setCallables(callables);
      }
    )
      .catch(console.error);
  };

  const resetContractInfo = () => {
    setDeveloper(0);
    setLastStaked(0);
    setLastClaimed(0);
    setNumStakers('?');
    setClaimedRewards('?');
  };

  const onContractChange = (_, data) => {
    resetContractInfo()
    console.log('onContractChange value', data.value);
    setSelectedContract(data.value);
    setFormState(data.value);
  };

  // const queryLastClaimed = () => {
  //   let res;
  //   api.query.dappsStaking.contractLastClaimed(getAddressEnum(selectedContract), result => {
  //     result.isNone ? res = 'never' : res = result.unwrap().toHuman();
  //     console.log('queryLastClaimed res', res);
  //     setLastClaimed(res);
  //   })
  //     .catch(console.error);
  // }

  const getContractLastStakedEra = () => {
    let eraIndex;

    // eraIndex = Math.max(...eraStakeMap.keys());
    console.log('getContractLastStakedEra eraStakeMap', eraStakeMap);
    // setLastStaked(eraIndex);

    // if (eraStakeMap.len) {
    // }
    // else{
    //   console.log('getContractLastStakedEra undefined');

    // }
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

  const queryContractEraStake = () => {
    console.log('queryContractEraStake selectedContract is', selectedContract, "last staked", lastStaked);
    api.query.dappsStaking.contractEraStake(getAddressEnum(selectedContract), lastStaked, result => {
      if (result.isNone) {
        console.log('queryContractEraStake result.isNone');
        setTotalStaked(0);
        setClaimedRewards(0);
        setNumStakers(0);
      }
      else {
        console.log('queryContractEraStake res', result.unwrap().toHuman());
        setTotalStaked(result.unwrap().total.toHuman());
        console.log('queryContractEraStake total', result.unwrap().total.toHuman());
        setClaimedRewards(result.unwrap().claimed_rewards.toHuman());
        console.log('queryContractEraStake total', result.unwrap().claimed_rewards.toHuman());
        setPreviousStaked(result.unwrap().former_staked_era.toString());
        setNumStakers(result.unwrap().stakers.size);
        console.log('queryContractEraStake total', result.unwrap().stakers.size);

        setLastStaked(res)

        // const s = result.unwrap().stakers.map(entry => ({ account: entry, staked: entry}));
        // let stakerList;
        // stakerList = Object.entries(result.unwrap().stakers.toHuman()).map((key, value) =>({account: key, staked: value}) )
        // for (const [key, value] of Object.entries(result.unwrap().stakers.toHuman())) {
        //   stakerList[key] = value;
        // }
        // setStakers(stakerList)
        // console.log('queryContractEraStake stakers', stakerList);

        //setStakers(result.unwrap().stakers);
      };
    })
      .catch(console.error);
  }

  
  const queryEraStakeMap = () => {
    const getInfo = async () => {
      let contractEraStakeEntries = new Map();

      try {
        const [eraMap] = await Promise.all([
          api.query.dappsStaking.c(
            getAddressEnum(selectedContract)
          ),
        ]);
        console.log('contractEraStake.entries ', eraMap);
        eraMap.forEach(([key, stake]) => {
          console.log('[key, stake] = ', key, stake)
          eraStakeMap.set(parseInt(key.args.map((k) => k.toString())[1]), stake);
        });
        console.log('queryEraStakeMap eraStakeMap', eraStakeMap);
        const eraIndex = Math.max(...eraStakeMap.keys());
        setLastStaked(eraIndex);
      } catch (e) {
        console.error(e);
      }
    };
    contractEraStakeEntries();

    // console.log('queryEraStakeMap selectedContract is', selectedContract);
    // utils.getEraStakes(selectedContract).then(eraStakeMap => {
    //   setEraStakeMap(eraStakes);
    // }
    // );
  };

  const doQueryContractInfo = () => {
    queryDeveloper();
    queryContractEraStake();
  }

  useEffect(updateCallables, [api.query.dappsStaking]);
  useEffect(queryEraStakeMap, [selectedContract]);
  useEffect(getContractLastStakedEra, [eraStakeMap]);
  // useEffect(doQueryContractInfo, [lastStaked]);

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
            options={callables}
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

// function DisplayPlain(props) {
//   return <div style={{ overflowWrap: 'break-word' }}>
//     <img alt='robots' src={`https://robohash.org/${props.contract}`} />
//     <h3> contract = {props.contract} </h3>
//     <h3> developer = {props.developer} </h3>
//     <h3> lastClaimed = {props.lastClaimed} </h3>
//     <h3> lastStaked = {props.lastStaked} </h3>
//     <h3> totalStaked = {props.totalStaked} </h3>
//     <h3> claimed rewards = {props.claimedRewards} </h3>
//     <h3> number of stakers = {props.numStakers} </h3>
//     {/* <h3> stakers = {stakers} </h3> */}
//   </div>
// }

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
          <Table.Cell>
            <Header as='h2'>
              <Header.Content>
                {props.previousStaked}
                <Header.Subheader>Previously staked era</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </div>
}

export default function ContractExplorer(props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
