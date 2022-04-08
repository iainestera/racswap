import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { Route, useRouteMatch, useLocation } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { useWeb3React } from '@web3-react/core';
import { RowType, Flex } from '@kaco/uikit';
import { ChainId } from '@pancakeswap/sdk';
import FlexLayout from 'components/Layout/Flex';
import Page from 'components/Layout/Page';
import { useFarms, usePollFarmsData, usePriceCakeBusd } from 'state/farms/hooks';
import usePersistState from 'hooks/usePersistState';
import { Farm } from 'state/types';
import { getBalanceNumber } from 'utils/formatBalance';
import { getFarmApr } from 'utils/apr';
import { orderBy } from 'lodash';
import isArchivedPid from 'utils/farmHelpers';
import { latinise } from 'utils/latinise';
import { useUserFarmStakedOnly } from 'state/user/hooks';
import Loading from 'components/Loading';
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard';
import Table from './components/FarmTable/FarmTable';
import { RowProps } from './components/FarmTable/Row';
import { DesktopColumnSchema, ViewMode } from './components/types';
import FarmHeader from './components/FarmHeader';
import { RAC_LP_PID } from 'config/constants/farms';

// const StyledImage = styled(Image)`
//   margin-left: auto;
//   margin-right: auto;
//   margin-top: 58px;
// `;
const NUMBER_OF_FARMS_VISIBLE = 12;

const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return null;
};

const Farms: React.FC = () => {
  const { path } = useRouteMatch();
  const { pathname } = useLocation();
  const { data: farmsLP, userDataLoaded } = useFarms();
  const cakePrice = usePriceCakeBusd();
  const [query] = useState('');
  const [viewMode] = usePersistState(ViewMode.TABLE, { localStorageKey: 'pancake_farm_view' });
  const { account } = useWeb3React();
  const [sortOption] = useState('hot');
  const chosenFarmsLength = useRef(0);

  const isArchived = pathname.includes('archived');
  const isInactive = pathname.includes('history');
  const isActive = !isInactive && !isArchived;

  usePollFarmsData(isArchived);

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded);

  const [stakedOnly] = useUserFarmStakedOnly(isActive);

  // const activeFarms = farmsLP.filter(
  //   (farm) => farm.pid !== KACO_LP_PID && farm.multiplier !== '0X' && !isArchivedPid(farm.pid),
  // );

  const activeFarms = farmsLP.filter((farm) => farm.pid !== RAC_LP_PID && !isArchivedPid(farm.pid));
  const inactiveFarms = farmsLP.filter(
    (farm) => farm.pid !== RAC_LP_PID && farm.multiplier === '0X' && !isArchivedPid(farm.pid),
  );
  const archivedFarms = farmsLP.filter((farm) => isArchivedPid(farm.pid));

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  );

  const stakedArchivedFarms = archivedFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  );

  const farmsList = useCallback(
    (farmsToDisplay: Farm[]): FarmWithStakedValue[] => {
      let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteToken.busdPrice) {
          return farm;
        }
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice);
        const { cakeRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity, farm.lpAddresses[ChainId.MAINNET])
          : { cakeRewardsApr: 0, lpRewardsApr: 0 };

        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity };
      });

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase());
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
          return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery);
        });
      }
      return farmsToDisplayWithAPR;
    },
    [cakePrice, query, isActive],
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE);
  const [observerIsSet, setObserverIsSet] = useState(false);

  const chosenFarmsMemoized = useMemo(() => {
    let chosenFarms = [];

    const sortFarms = (farms: FarmWithStakedValue[]): FarmWithStakedValue[] => {
      switch (sortOption) {
        case 'apr':
          return orderBy(farms, (farm: FarmWithStakedValue) => farm.apr + farm.lpRewardsApr, 'desc');
        case 'multiplier':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
            'desc',
          );
        case 'earned':
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
            'desc',
          );
        case 'liquidity':
          return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'desc');
        default:
          return farms;
      }
    };

    // console.log(
    //   'stakedOnlyFarms',
    //   stakedOnlyFarms,
    //   'stakedArchivedFarms',
    //   stakedArchivedFarms,
    //   'activeFarms',
    //   activeFarms,
    //   'inactiveFarms',
    //   inactiveFarms,
    // );
    if (isActive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms);
    }
    if (isInactive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(inactiveFarms);
    }
    if (isArchived) {
      chosenFarms = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms);
    }

    return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible);
  }, [
    sortOption,
    activeFarms,
    farmsList,
    inactiveFarms,
    archivedFarms,
    isActive,
    isInactive,
    isArchived,
    stakedArchivedFarms,
    stakedOnly,
    stakedOnlyFarms,
    numberOfFarmsVisible,
  ]);

  chosenFarmsLength.current = chosenFarmsMemoized.length;

  useEffect(() => {
    const showMoreFarms = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
          if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
            return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE;
          }
          return farmsCurrentlyVisible;
        });
      }
    };

    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMoreFarms, {
        rootMargin: '0px',
        threshold: 1,
      });
      loadMoreObserver.observe(loadMoreRef.current);
      setObserverIsSet(true);
    }
  }, [chosenFarmsMemoized, observerIsSet]);

  // console.log('chosenFarmsMemoized', chosenFarmsMemoized);
  const rowData = chosenFarmsMemoized.map((farm) => {
    const { token, quoteToken } = farm;
    const tokenAddress = token.address;
    const quoteTokenAddress = quoteToken.address;
    //WAIT
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '');

    const row: RowProps = {
      apr: {
        value: getDisplayApr(farm.apr, farm.lpRewardsApr),
        multiplier: farm.multiplier,
        lpLabel,
        tokenAddress,
        quoteTokenAddress,
        cakePrice,
        originalValue: farm.apr,
      },
      farm: {
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        quoteToken: farm.quoteToken,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
      },
      multiplier: {
        multiplier: farm.multiplier,
      },
      details: farm,
    };

    return row;
  });

  const renderContent = (): JSX.Element => {
    if (viewMode === ViewMode.TABLE && rowData.length) {
      const columnSchema = DesktopColumnSchema;

      const columns = columnSchema.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
          switch (column.name) {
            case 'farm':
              return b.id - a.id;
            case 'apr':
              if (a.original.apr.value && b.original.apr.value) {
                return Number(a.original.apr.value) - Number(b.original.apr.value);
              }

              return 0;
            case 'earned':
              return a.original.earned.earnings - b.original.earned.earnings;
            default:
              return 1;
          }
        },
        sortable: column.sortable,
      }));

      return <Table data={rowData} columns={columns} userDataReady={userDataReady} />;
    }

    return (
      <FlexLayout style={{ background: 'rgba(0,0,0,0)' }}>
        <Route exact path={`${path}`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed={false}
            />
          ))}
        </Route>
        <Route exact path={`${path}/history`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </Route>
        <Route exact path={`${path}/archived`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </Route>
      </FlexLayout>
    );
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0)' }}>
      <Page>
        <FarmHeader />
        {renderContent()}
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
        <div ref={loadMoreRef} />
      </Page>
    </div>
  );
};

export default Farms;
