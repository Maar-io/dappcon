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
  const [lastStaked, setLastStaked] = useState('');

  const getAddressEnum = (address) => (
    {'Evm': address}
  );

  const initFormState = {
    palletRpc: '',
    callable: '',
    inputParams: []
  };

  const [formState, setFormState] = useState(initFormState);
  const { palletRpc, callable, inputParams } = formState;

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

  useEffect(updateCallables, [api, interxType, palletRpc]);

  const onContractChange = (_, data) => {
    setFormState(formState => {
      let res;
      const { state, value } = data;
      if (typeof state === 'object') {
        // Input parameter updated
        const { ind, paramField: { type } } = state;
        const inputParams = [...formState.inputParams];
        inputParams[ind] = { type, value };
        res = { ...formState, inputParams };
      } else if (state === 'palletRpc') {
        res = { ...formState, [state]: value, callable: '', inputParams: [] };
        console.log('onContractChange palletRpc',)
      } else if (state === 'callable') {
        res = { ...formState, [state]: value, inputParams: [] };
        setButtonQuery(false);
        setStatus('');
        setSelectedContract(getAddressEnum(callable));
        console.log('onContractChange callable', getAddressEnum(callable));
      }
      return res;
    });
  };


  const onQueryClick = (_, data) => {
    let unsubscribe;

    const { state, value } = data;
    let res;
    res = { ...formState, [state]: value, callable: '', inputParams: [] };
    console.log('onQueryClick selected selectedContract is', selectedContract)
    setButtonQuery(true)

    unsubscribe = api.query.dappsStaking.contractLastStaked( selectedContract, result => {
      result.isNone ? setStatus('never s') : setLastStaked(result.unwrap().toHuman());
    })
    .catch(console.error);

    unsubscribe = api.query.dappsStaking.contractLastClaimed( selectedContract, result => {
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
            state='callable'
            value={callable}
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
        <div style={{ overflowWrap: 'break-word' }}>{displayData}</div>
        {/* <div style={{ overflowWrap: 'break-word' }}>{status}</div> */}
      </Form>
    </Grid.Column>
  );
}
function displayData () {
    return <h3
      {...lastClaimed}
      {...lastStaked}
    />;
}

export default function ContractExplorer(props) {
  const { api } = useSubstrate();
  return api.tx ? <Main {...props} /> : null;
}
