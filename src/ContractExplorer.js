import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Button } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { blake2AsHex } from '@polkadot/util-crypto';
import { DeveloperConsole } from './substrate-lib/components';


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

  const onContractChange = (_, data) => {
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
    let res;
    api.query.dappsStaking.registeredDapps(getAddressEnum(selectedContract), result => {
      result.isNone ? res = 'none' : res = result.unwrap().toHuman();
      console.log('queryDeveloper res', res);
      setDeveloper(res);
    })
      .catch(console.error);
  }

  const queryContractEraStake = () => {
    api.query.dappsStaking.contractEraStake(getAddressEnum(getAddressEnum(selectedContract)), lastStaked, result => {
      if (result.isNone) {
        setTotalStaked(0);
        setClaimedRewards(0);
        setNumStakers(0);
      }
      else {
        console.log('queryContractEraStake res', result.unwrap().toHuman());
        setTotalStaked(result.unwrap().total.toHuman());
        setClaimedRewards(result.unwrap().claimed_rewards.toHuman());
        setNumStakers(result.unwrap().stakers.size);
        // setStakers(result.unwrap().stakers);
      };
    })
      .catch(console.error);
  }

  const doQuery = (_, data) => {
    console.log('doQuery selectedContract is', selectedContract);
    queryLastStaked();
    queryLastClaimed();
    queryDeveloper();
    queryContractEraStake();
  };

  useEffect(updateCallables, [api.query.dappsStaking]);
  useEffect(doQuery, [selectedContract]);

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
        <DisplayPlain
          developer = {developer}
          numStakers = {numStakers}
          lastClaimed = {lastClaimed}
          lastStaked = {lastStaked}
          totalStaked = {totalStaked}
          claimedRewards = {claimedRewards}
          contract = {selectedContract}
          />
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

export default function ContractExplorer(props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
