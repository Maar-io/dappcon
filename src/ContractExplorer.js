import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Button } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { blake2AsHex } from '@polkadot/util-crypto';


function Main (props) {
  const { api } = useSubstrate();
  const [callables, setCallables] = useState([]);
  const [buttonQuery, setButtonQuery] = useState(true);
  const [selectedContract, setSelectedContract] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [lastStaked, setLastStaked] = useState(0);
  const [formState, setFormState] = useState(0);

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
    // const c =
    //   [
    //     { key: '0x0000000000000000000000000000000000000002', value: '0x0000000000000000000000000000000000000002', text: '0x0000000000000000000000000000000000000002' },
    //     { key: '0x0000000000000000000000000000000000000003', value: '0x0000000000000000000000000000000000000003', text: '0x0000000000000000000000000000000000000003' },
    //     { key: '0x0000000000000000000000000000000000000004', value: '0x0000000000000000000000000000000000000004', text: '0x0000000000000000000000000000000000000004' }
    //   ];        0x000.000.000.000.000.000.000.000.000.000.000.000.000.0
    // setCallables(c);

    //api.query.dappsStaking.registeredDapps.keys().then(
      // result => {
      //   console.log('registeredDapps result', result);
      //   const r = result.map(c => '0x' + c.toString().slice(-40))
      //   console.log(r);
      // }).catch(console.error);
    setButtonQuery(true);
  };

  const onContractChange = (_, data) => {
    console.log('onContractChange value', data.value);
    setButtonQuery(false);
    setSelectedContract(getAddressEnum(data.value));
    setFormState(data.value);
  };

  const onQueryClick = (_, data) => {
    let unsubscribe;

    console.log('onQueryClick selectedContract is', selectedContract);
    setButtonQuery(true);

    unsubscribe = api.query.dappsStaking.contractLastStaked(selectedContract, result => {
      result.isNone ? setLastStaked('never s') : setLastStaked(result.unwrap().toNumber());
    })
      .catch(console.error);

    unsubscribe = api.query.dappsStaking.contractLastClaimed(selectedContract, result => {
      result.isNone ? setLastClaimed('never c') : setLastClaimed(result.unwrap().toHuman());
    })
      .catch(console.error);

    return () => unsubscribe;
  };

  useEffect(updateCallables, [api.query.dappsStaking]);
  useEffect(onQueryClick, [api.query.dappsStaking, selectedContract]);

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
        <Form.Field style={{ textAlign: 'center' }}>
          <Button primary
            disabled={buttonQuery}
            circular
            onClick={onQueryClick}
            size='big'
            color={buttonQuery ? 'green' : 'red'}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>
          <h3> lastClaimed = {lastClaimed} </h3>
          <h3> lastStaked = {lastStaked} </h3>
        </div>
      </Form>
    </Grid.Column>
  );
}

export default function ContractExplorer (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
