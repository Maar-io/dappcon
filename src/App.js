import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './AccountSelector';
import ContractExplorer from './ContractExplorer';
// import Balances from './Balances';
import EraStaked from './EraStaked';
// import BlockNumber from './BlockNumber';
import EraNumber from './EraNumber';
import Events from './Events';
import DSInteractor from './DSInteractor';
import DappsCount from './DappsCount';
// import Metadata from './Metadata';
import NodeInfo from './NodeInfo';
import Staker from './Staker';
import TemplateModule from './TemplateModule';
// import Transfer from './Transfer';
// import Upgrade from './Upgrade';

function Main () {
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();
  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${JSON.stringify(err, null, 4)}`}
        />
      </Grid.Column>
    </Grid>;

  if (apiState === 'ERROR') return message(apiError);
  else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>
      <Container>
        <Grid stackable columns='equal'>
          <Grid.Row stretched>
            <EraNumber />
            <DappsCount />
            <EraStaked />
            <NodeInfo />
          </Grid.Row>
          {/* <Grid.Row stretched>
            <Balances />
          </Grid.Row> */}
          {/* <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Upgrade accountPair={accountPair} />
          </Grid.Row> */}
          <Grid.Row>
            <ContractExplorer />
            <Events />
          </Grid.Row>
          <Grid.Row>
            <TemplateModule accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
          <h1>Stakers</h1>
            <Staker setAccountAddress={setAccountAddress}/>
          </Grid.Row>
          <Grid.Row>
            <DSInteractor accountPair={accountPair} />
            <Staker setAccountAddress={setAccountAddress}/>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function App () {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
