import React, { useEffect, useState } from 'react';
import { Grid, Form, Dropdown, Table, Header, Icon } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { projectContractName } from './NamedContracts';
const DECIMALS = 1_000_000_000_000_000_000;

function Main (props) {
  const { api } = useSubstrate();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(0);
  const [formState, setFormState] = useState(0);
  const [developer, setDeveloper] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState(0);
  const [numStakers, setNumStakers] = useState(0);
  const [erasToClaim, setErasToClaim] = useState(0);
  const [firstTime, setFirstTimeStaked] = useState(0);
  const [unclaimedEras, setUnclaimedEras] = useState(0);
  const [projectName, setProjectName] = useState('');

  const getAddressEnum = (address) => ({ Evm: address });

  const resetContractInfo = () => {
    setDeveloper(0);
    setNumStakers('?');
    setTotalStaked(0);
    setClaimedRewards('?');
    setErasToClaim(0);
    setUnclaimedEras('');
    setProjectName('');
  };

  const onContractChange = (_, data) => {
    resetContractInfo();
    console.log('onContractChange value', data.value);
    setSelectedContract(data.value);
    setFormState(data.value);
    setProjectName(projectContractName[data.value]);
  };

  const querycontractEraStakeMap = () => {
    const getInfo = async () => {
      const contractEraStakeMap = new Map();
      const eraInfoMap = new Map();

      try {
        // fetch all contractEraStake entries for selected contract and convert to map
        const contractEraStakeEntries =
          await api.query.dappsStaking.contractEraStake.entries(
            getAddressEnum(selectedContract)
          );
        contractEraStakeEntries.forEach(([key, points]) => {
          // console.log('[key, points] = ', key, points);
          const eraKey = parseInt(key.args.map((k) => k.toString())[1]);
          // console.log('eraKey', eraKey);
          contractEraStakeMap.set(eraKey, points.toJSON());
        });

        // fetch all generalEraInfo entries and convert to map
        const eraInfoEntires =
          await api.query.dappsStaking.generalEraInfo.entries();
        eraInfoEntires.forEach(([key, eraInfo]) => {
          const eraKey = parseInt(key.args.map((k) => k.toString())[0]);
          // console.log('eraInfo', eraInfo.toJSON());
          eraInfoMap.set(eraKey, eraInfo.toJSON());
        });

        // calculate unclaimed eras
        let unclaimed = 0;
        contractEraStakeMap.forEach((contractStakeInfo) => {
          // console.log('contractStakeInfo = ', contractStakeInfo);
          if (contractStakeInfo.contractRewardClaimed === false) unclaimed++;
        });
        console.log('unclaimed eras', unclaimed);
        setErasToClaim(unclaimed - 1);

        if (contractEraStakeMap.size !== 0) {
          // First era with staking record
          const firstStaked = Math.min(...contractEraStakeMap.keys());
          setFirstTimeStaked(firstStaked);
          console.log('firstStakedEra', firstStaked);

          api.query.dappsStaking
            .currentEra((currentEra) => {
              const current = currentEra.toNumber();
              console.log('currentEra', current);
              const entry = contractEraStakeMap.get(current);

              // number of stakers
              const stakerNum = parseInt(entry.numberOfStakers);
              console.log('numberOfStakers', stakerNum);
              setNumStakers(stakerNum);

              // total staked on the contract
              const total = parseInt(entry.total / DECIMALS);
              console.log('total', total);
              setTotalStaked(total);

              // calculate claimed rewards
              let rewarded = 0;
              let unclaimedEra = '';
              for (let era = firstStaked; era <= currentEra; era++) {
                const contractStakeInfo = contractEraStakeMap.get(era);
                const eraInfo = eraInfoMap.get(era);
                if (contractStakeInfo) {
                  if (contractStakeInfo.contractRewardClaimed) {
                    const ratio = contractStakeInfo.total / eraInfo.staked;
                    // console.log('ratio', ratio);
                    // console.log('available ', eraInfo.rewards.dapps / DECIMALS);
                    // console.log('rewarded ', eraInfo.rewards.dapps * ratio / DECIMALS);
                    rewarded += eraInfo.rewards.dapps * ratio;
                  } else {
                    unclaimedEra += era.toString() + ' ';
                  }
                  // console.log('contractStakeInfo = ', era + ' => ' + parseInt(contractStakeInfo.total / DECIMALS) + ' ' + contractStakeInfo.contractRewardClaimed);
                } else {
                  console.log(selectedContract + ' missing contractStakeInfo for era', era);
                }
              }
              console.log('claimedRewards', parseInt(rewarded / DECIMALS));
              console.log('unclaimedEra', unclaimedEra);
              setClaimedRewards(parseInt(rewarded / DECIMALS));
              setUnclaimedEras(unclaimedEra);
            })
            .catch(console.error);
        }
      } catch (err) {
        console.error(err);
        console.log('querycontractEraStakeMap failed');
      }
    };
    getInfo();
  };

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const result = await api.query.dappsStaking.registeredDapps.keys();
        console.log('registeredDapps result', result);
        const r = result.map((c) => '0x' + c.toString().slice(-40));
        // console.log(r);
        const contractList = r.map((c) => ({ key: c, value: c, text: c }));
        console.log('fetchContracts', contractList);
        setContracts(contractList);
      } catch (err) {
        console.error(err);
        console.log('fetchContracts registeredDapps.keys() failed');
      }
    };
    fetchContracts();
  }, [api.query.dappsStaking]);

  useEffect(() => {
    const queryDeveloper = async () => {
      try {
        const result = await api.query.dappsStaking.registeredDapps(
          getAddressEnum(selectedContract)
        );
        let res;
        result.isNone
          ? (res = 'none')
          : (res = result.unwrap().developer.toHuman());
        console.log('contract=', selectedContract, 'setDeveloper to', res);
        setDeveloper(res);
      } catch (err) {
        console.error(err);
        console.log('querycontractEraStakeMap registeredDapps failed');
      }
    };
    queryDeveloper();
  }, [api.query.dappsStaking, selectedContract]);

  useEffect(querycontractEraStakeMap, [
    api.query.dappsStaking,
    selectedContract
  ]);

  return (
    <Grid.Column width={8}>
      <h1>Contract Explorer - {projectName}</h1>
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
            options={contracts}
          />
        </Form.Field>
        <DisplayTable
          developer={developer}
          numStakers={numStakers}
          firstTime={firstTime}
          totalStaked={totalStaked}
          claimedRewards={claimedRewards}
          contract={selectedContract}
          erasToClaim={erasToClaim}
          unclaimedEras={unclaimedEras}
        />
      </Form>
    </Grid.Column>
  );
}

function DisplayTable (props) {
  return (
    <div style={{ overflowWrap: 'break-word' }}>
      <img alt='robots' src={`https://robohash.org/${props.contract}`} />
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Contract Address</Table.HeaderCell>
            <Table.HeaderCell>{props.contract}</Table.HeaderCell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell>Developer's account:</Table.HeaderCell>
            <Table.HeaderCell>{props.developer}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Header as='h2'>
                <Header.Content>
                  {props.firstTime}
                  <Header.Subheader>First Era Staked</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>
              <Header as='h2'>
                <Header.Content>
                  <Icon name='user' />
                  {props.numStakers}
                  <Header.Subheader>Number of Stakers</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Header as='h2'>
                <Header.Content>
                  {props.totalStaked}
                  <Header.Subheader>Total Staked</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>
              <Header as='h2'>
                <Header.Content>
                  {props.claimedRewards}
                  <Header.Subheader>Claimed Rewards</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Header as='h2'>
                <Header.Content>
                  {props.erasToClaim}
                  <Header.Subheader>Number of unclaimed eras</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
            <Table.Cell>
              <Header as='h2'>
                <Header.Content>
                  {props.unclaimedEras}
                  <Header.Subheader>Unclaimed Eras</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
}

export default function ContractExplorer (props) {
  const { api } = useSubstrate();
  return api ? <Main {...props} /> : null;
}
