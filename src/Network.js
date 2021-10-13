import React, { useState, useEffect } from 'react';

import {
  Dropdown,
  Container
} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main (props) {
  const [networkSelected, setNetworkSelected] = useState('');

  const networkOptions =
    [
      {
        key: 'Shiden', text: 'Shiden (mainnet)', value: 'wss://rpc.shiden.astar.network'
      },
      {
        key: 'Shibuya', text: 'Shibuya (testnet)', value: 'wss://rpc.shibuya.astar.network'
      },
      {
        key: 'Local', text: 'Local', value: 'ws://127.0.0.1:9944'
      }
    ];

  const initialNetwork =
    networkOptions.length > 0 ? networkOptions[0].name : '';

  // Set the initial address
  useEffect(() => {
    console.log('useEffect selected Network', networkSelected);
  }, [networkSelected, initialNetwork]);

  const onChange = network => {
    setNetworkSelected(network);
  };

  return (
    <Container>
      <Dropdown
        search
        selection
        clearable
        placeholder='Select the Network'
        options={networkOptions}
        onChange={(_, dropdown) => {
          onChange(dropdown.value);
        }}
        value={networkSelected}
      />
    </Container>
  );
}

export default function Network (props) {
  const { api } = useSubstrate();
  return api.query ? <Main {...props} /> : null;
}
