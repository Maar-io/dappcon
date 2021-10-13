import React, { useState, createRef } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message, Segment, Image, Divider } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

// import NetworkSelector from './NetworkSelector';
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
import Constants from './Constants';
import Network from './Network';
// import Transfer from './Transfer';
// import Upgrade from './Upgrade';

function Main() {
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
        <Grid centered columns={2}>

        </Grid>
      </Sticky>
      <Divider />
      <Container>
        <style>
          {`
            html, body {
              background-color: #252839 !important;
            }
            p {
              align-content: center;
              background-color: #495285;
              color: #fff;
              display: flex;
              flex-direction: column;
              justify-content: center;
              min-height: 6em;
            }
            p > span {
              opacity: 0.4;
              text-align: center;
            }
          }
          `}
        </style>
        <Grid stackable columns='equal'>
          <Grid.Row>
            <Image src={`${process.env.PUBLIC_URL}/assets/astar_dashboard.png`} size='huge' />
            <Network />
          </Grid.Row>
          <Grid.Row stretched>
            <EraNumber />
            <DappsCount />
            <EraStaked />
            <NodeInfo />
          </Grid.Row>
          <Divider />
          <Grid.Row>
            <Constants />
          </Grid.Row>
          <Divider />
          {/* <Grid.Row stretched>
            <Balances />
          </Grid.Row> */}
          {/* <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Upgrade accountPair={accountPair} />
          </Grid.Row> */}
          <Grid.Row>
            <Segment raised>
              <ContractExplorer />
            </Segment>
          </Grid.Row>
          <Divider />
          <Grid.Row>
            <Segment raised>
              <DSInteractor accountPair={accountPair} />
            </Segment>
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
