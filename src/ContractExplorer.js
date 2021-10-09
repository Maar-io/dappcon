import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Button } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

const argIsOptional = (arg) =>
  arg.type.toString().startsWith('Option<');

function Main(props) {
  const { api, jsonrpc } = useSubstrate();
  const { accountPair } = props;
  const [status, setStatus] = useState(null);

  const [interxType, setInterxType] = useState('QUERY');
  const [palletRPCs, setPalletRPCs] = useState([{ key: 'dappsStaking', value: 'dappsStaking', text: 'dappsStaking' }]);
  const [callables, setCallables] = useState([]);
  const [paramFields, setParamFields] = useState([]);
  const [buttonQuery, setButtonQuery] = useState(true);
  const [selectedContract, setSelectedContract] = useState(0);
  const [lastClaimed, setLastClaimed] = useState(0);
  const [lastStaked, setLastStaked] = useState(0);
  const [formState, setFormState] = useState('');

  const getAddressEnum = (address) => (
    { 'Evm': address }
  );



  const updateCallables = () => {
    const c =
      [
        { key: '0x0000000000000000000000000000000000000002', value: '0x0000000000000000000000000000000000000002', text: '0x0000000000000000000000000000000000000002' },
        { key: '0x0000000000000000000000000000000000000003', value: '0x0000000000000000000000000000000000000003', text: '0x0000000000000000000000000000000000000003' },
        { key: '0x0000000000000000000000000000000000000004', value: '0x0000000000000000000000000000000000000004', text: '0x0000000000000000000000000000000000000004' }
      ];
    setCallables(c);
    setButtonQuery(true);
  };


  const onContractChange = (_, data) => {
    console.log('onContractChange value', data.value);
    setButtonQuery(false);
    setLastClaimed('?');
    setLastStaked('?');
    setSelectedContract(getAddressEnum(data.value));
    setFormState(data.value)
    // setFormState(formState => {
    //   let res;
    //   const { state, value } = data;
    //   if (typeof state === 'object') {
    //     // Input parameter updated
    //     const { ind, paramField: { type } } = state;
    //     const inputParams = [...formState.inputParams];
    //     inputParams[ind] = { type, value };
    //     res = { ...formState, inputParams };
    //     console.log('setFormState object value', value);
    //     console.log('setFormState res', res);
    //   } else {
    //     res = { ...formState, [state]: value, inputParams: [] };
    //     console.log('setFormState else value', value);
    //     console.log('setFormState res', res);
    //     setSelectedContract(getAddressEnum(data.value));
    //     // console.log('onContractChange selectedContract', selectedContract);
    //   }
    //   return res;
    // });
  };


  const onQueryClick = (_, data) => {
    let unsubscribe;

    console.log('onQueryClick selectedContract is', selectedContract)
    setButtonQuery(true)

    unsubscribe = api.query.dappsStaking.contractLastStaked(selectedContract, result => {
      result.isNone ? setStatus('never s') : setLastStaked(result.unwrap().toHuman());
    })
      .catch(console.error);

    unsubscribe = api.query.dappsStaking.contractLastClaimed(selectedContract, result => {
      result.isNone ? setStatus('never c') : setLastClaimed(result.unwrap().toHuman());
    })
      .catch(console.error);

    // unsubscribe = api.query.dappsStaking.registeredDapps.keys().then(
    //   result => {
    //     result.isNone ? setStatus('None') : setStatus(result.length);
    //   }
    // ).catch(console.error);

    return () => unsubscribe;
  };
  useEffect(updateCallables, [api]);
  useEffect(onQueryClick, [lastClaimed, lastStaked]);

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
        {/* <div style={{ overflowWrap: 'break-word' }}>{displayData}</div> */}
        <div style={{ overflowWrap: 'break-word' }}>
          <h3> lastClaimed = {lastClaimed} </h3>
          <h3> lastStaked = {lastStaked} </h3>
        </div>
      </Form>
    </Grid.Column>
  );
}
function displayData(prop) {
  return <h3
    {...lastClaimed}
    {...lastStaked}
  />;
}

export default function ContractExplorer(props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
