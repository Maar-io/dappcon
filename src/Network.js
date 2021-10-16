import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import config from './config';

import {
  Dropdown,
  Container
} from 'semantic-ui-react';

function Main (props) {
  const [networkSelected, setNetworkSelected] = useState('');

  const networkOptions =
    [
      {
        key: 'Shiden', text: 'Shiden (mainnet)', value: 'wss://shiden.api.onfinality.io/public-ws'
      },
      {
        key: 'Shibuya', text: 'Shibuya (testnet)', value: 'wss://rpc.shibuya.astar.network'
      },
      {
        key: 'Local', text: 'Local', value: 'ws://127.0.0.1:9944'
      }
    ];

  // Set the initial address
  useEffect(() => {
    const parsedQuery = queryString.parseUrl(window.location.search);
    setNetworkSelected(parsedQuery.query.rpc || config.PROVIDER_SOCKET);
  }, []);

  const onChange = network => {
    setNetworkSelected(network);

    const parsedQuery = queryString.parseUrl(window.location.search);
    parsedQuery.query.rpc = network;
    window.location = queryString.stringifyUrl(parsedQuery);
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
  return <Main {...props} />;
}
