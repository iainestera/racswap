import { ContextApi } from 'contexts/Localization/types';
import { PageMeta } from './types';

export const DEFAULT_META: PageMeta = {
  title: 'RACSwap',
  description:
    'The most popular AMM on BSC by user count! Earn rac through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by PancakeSwap), NFTs, and more, on a platform you can trust.',
  image: 'https://pancakeswap.finance/images/hero.png',
};

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  switch (path) {
    case '/':
      return {
        title: `${t('Home')} | ${t('RACSwap')}`,
      };
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('RACSwap')}`,
      };
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('RACSwap')}`,
      };
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('RACSwap')}`,
      };
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('RACSwap')}`,
      };
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('RACSwap')}`,
      };
    case '/collectibles':
      return {
        title: `${t('Collectibles')} | ${t('RACSwap')}`,
      };
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('RACSwap')}`,
      };
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('RACSwap')}`,
      };
    case '/profile/tasks':
      return {
        title: `${t('Task Center')} | ${t('RACSwap')}`,
      };
    case '/profile':
      return {
        title: `${t('Your Profile')} | ${t('RACSwap')}`,
      };
    default:
      return null;
  }
};
