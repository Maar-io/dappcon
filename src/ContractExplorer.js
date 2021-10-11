import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Table, Header, Image, Menu, Icon } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import Stakers from './Stakers';


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
  const [stakers, setStakers] = useState([]);

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

  const queryLastClaimed = () => {
    let res;
    api.query.dappsStaking.contractLastClaimed(getAddressEnum(selectedContract), result => {
      result.isNone ? res = 'never' : res = result.unwrap().toHuman();
      console.log('queryLastClaimed res', res);
      setLastClaimed(res);
    })
      .catch(console.error);
  }

  const queryLastStaked = () => {
    let res;
    api.query.dappsStaking.contractLastStaked(getAddressEnum(selectedContract), result => {
      result.isNone ? res = 'never' : res = result.unwrap().toString();
      console.log('queryLastStaked res', res);
      setLastStaked(res);
    })
      .catch(console.error);
  }

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
        setNumStakers(result.unwrap().stakers.size);
        console.log('queryContractEraStake total', result.unwrap().stakers.size);
        // const s = result.unwrap().stakers.map(entry => ({ account: entry, staked: entry}));
        let stakerList;

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

  const doQuery = (_, data) => {
    console.log('doQuery selectedContract is', selectedContract);
    queryLastStaked();
    queryLastClaimed();
  };

  const doQueryContractInfo = () => {
    queryDeveloper();
    queryContractEraStake();
  }

  useEffect(updateCallables, [api.query.dappsStaking]);
  useEffect(doQuery, [selectedContract]);
  useEffect(doQueryContractInfo, [lastStaked]);

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
        />
        {/* <DisplayAllTable
          contracts = {callables}
        /> */}
        {/* <Stakers 
          contract={selectedContract}
          /> */}
      </Form>
    </Grid.Column>
  );
}

function DisplayPlain(props) {
  return <div style={{ overflowWrap: 'break-word' }}>
    <img alt='robots' src={`https://robohash.org/${props.contract}`} />
    <h3> contract = {props.contract} </h3>
    <h3> developer = {props.developer} </h3>
    <h3> lastClaimed = {props.lastClaimed} </h3>
    <h3> lastStaked = {props.lastStaked} </h3>
    <h3> totalStaked = {props.totalStaked} </h3>
    <h3> claimed rewards = {props.claimedRewards} </h3>
    <h3> number of stakers = {props.numStakers} </h3>
    {/* <h3> stakers = {stakers} </h3> */}
  </div>
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
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Developer's account</Table.Cell>
          <Table.Cell>
            <Header as='h4' image>
              <Image src={`https://robohash.org/${props.developer}`} size='mini' />
              <Header.Content>
                {props.developer}
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
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
                ?
                <Header.Subheader>TBA</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </div>
}

function DisplayAllTable(props) {
  console.log(props.contracts);
  return <div style={{ overflowWrap: 'break-word' }}>
  <Table celled>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Contract</Table.HeaderCell>
        <Table.HeaderCell>Last Staked</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
    {
        props.contracts && props.contracts.map((contract) =>
          <Table.Row
            key={contract}>
            <Table.Cell>{contract.key}</Table.Cell>
            <Table.Cell>{contract.key}</Table.Cell>
          </Table.Row>
        )
      }
    </Table.Body>

    <Table.Footer>
      <Table.Row>
        <Table.HeaderCell colSpan='3'>
          <Menu floated='right' pagination>
            <Menu.Item as='a' icon>
              <Icon name='chevron left' />
            </Menu.Item>
            <Menu.Item as='a'>1</Menu.Item>
            <Menu.Item as='a'>2</Menu.Item>
            <Menu.Item as='a'>3</Menu.Item>
            <Menu.Item as='a'>4</Menu.Item>
            <Menu.Item as='a' icon>
              <Icon name='chevron right' />
            </Menu.Item>
          </Menu>
        </Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  </Table>
  </div>
}

export default function ContractExplorer(props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
