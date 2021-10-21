import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Table, Header, Menu, Icon, Divider } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import Stakers from './Stakers';


function Main(props) {
  const { api } = useSubstrate();
  const [allContracts, setAllContracts] = useState([]);
  const contractInfo =
  {
    contract: 'None',
    lastClaimed: 0,
    lastStaked: 0
  };
  const [contractsData, setContractsData] = useState([]);

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
    resetContractInfo()
    console.log('onContractChange value', data.value);
    setSelectedContract(data.value);
    setFormState(data.value);
  };

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

  // const queryAllContracts = () => {
  //   console.log('queryContractEraStake selectedContract is', selectedContract, "last staked", lastStaked);
  //   api.query.dappsStaking.contractEraStake(getAddressEnum(selectedContract), lastStaked, result => {
  //     if (result.isNone) {
  //       console.log('queryContractEraStake result.isNone');
  //       setTotalStaked(0);
  //       setClaimedRewards(0);
  //       setNumStakers(0);
  //     }
  //     else {
  //       console.log('queryContractEraStake res', result.unwrap().toHuman());
  //       setTotalStaked(result.unwrap().total.toHuman());
  //       console.log('queryContractEraStake total', result.unwrap().total.toHuman());
  //       setClaimedRewards(result.unwrap().claimed_rewards.toHuman());
  //       console.log('queryContractEraStake total', result.unwrap().claimed_rewards.toHuman());
  //       setPreviousStaked(result.unwrap().former_staked_era.toString());
  //       setNumStakers(result.unwrap().stakers.size);
  //       console.log('queryContractEraStake total', result.unwrap().stakers.size);
  //     };
  //   })
  //     .catch(console.error);
  // }


  // const doQueryContractInfo = () => {
  //   queryDeveloper();
  //   queryContractEraStake();
  // }


  const queryLastClaimed = (contract) => {
    let res;
    api.query.dappsStaking.contractLastClaimed(getAddressEnum(contract), result => {
      result.isNone ? res = 'never' : res = result.unwrap().toHuman();
      console.log('AllContracts contractLastStaked', res);
      return res
    })
      .catch(console.error);
    return 0;
  }

  const queryLastStaked = (contract) => {
    let res;
    api.query.dappsStaking.contractLastStaked(getAddressEnum(contract), result => {
      result.isNone ? res = 'never' : res = result.unwrap().toString();
      console.log('AllContracts contractLastStaked', res);
      return res;
    })
      .catch(console.error);
    return 0;
  }

  const queryAllContracts = () => {
    let contractInfo = new Object;
    console.log('queryAllContracts', allContracts);
    allContracts.forEach(contract => {
      contractInfo.contract = contract;
      let lastStaked = queryLastStaked(contract);
      contractInfo.lastStaked = lastStaked
      let lastClaimed = queryLastClaimed(contract);
      contractInfo.lastClaimed = lastClaimed

      setContractsData(prevState => [...prevState, contractInfo]);
      console.log('***ContractInfo', contractInfo);
    });
  };

  const getAllContracts = () => {
    let unsubscribe;

    unsubscribe = api.query.dappsStaking.registeredDapps.keys().then(
      result => {
        const contractList = result.map(c => '0x' + c.toString().slice(-40))
        setAllContracts(contractList);
      }
    )
      .catch(console.error);

    return () => unsubscribe;
  };

  useEffect(getAllContracts, []);
  useEffect(queryAllContracts, [allContracts]);

  return (
    <Grid.Column width={8}>
      <h1>Contract List</h1>
      <DisplayAllTable
        contractsData={contractsData}
      />
    </Grid.Column>

  );
}

function DisplayAllTable(props) {
  console.log('render', props.contractsData);
  return <div style={{ overflowWrap: 'break-word' }}>
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Contract</Table.HeaderCell>
          <Table.HeaderCell>Last Staked</Table.HeaderCell>
          <Table.HeaderCell>Last Claimed</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {
          props.contractsData && props.contractsData.map((contracts, index) =>
            <Table.Row
              key={index}>
              <Table.Cell>{contracts.contract}</Table.Cell>
              <Table.Cell>{contracts.lastStaked}</Table.Cell>
              <Table.Cell>{contracts.lastStaked}</Table.Cell>
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

export default function AllContracts(props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
