import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Label
} from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';

function Main(props) {
  const [accountSelected, setAccountSelected] = useState('');

  return (
    <Container>
      <h1>Contract Stakers</h1>
      for contract {props.contract}
      {props.stakers && props.stakers.map((staker) => (
        <h1>staker={staker}</h1>
      ))}
    </Container>
  );
}


export default function Stakers(props) {
  return <Main {...props} />
}
