import tokens from './tokens';
import { FarmConfig } from './types';
export const RAC_LP_PID = 0;
export const RAC_BNB_LP_PID = 1;
export const BUSD_RAC_LP_PID = 2;

const farms: FarmConfig[] = [
  /**
   * These 3 farms (PID 0, 1, 2) should always be at the top of the file.
   */
  {
    pid: RAC_LP_PID,
    lpSymbol: 'RAC',
    lpAddresses: {
      97: '0x0bA819e30016Cf682C7795b44859148C65e62292',
      56: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    },
    token: tokens.syrup,
    quoteToken: tokens.wbnb,
  },
  {
    pid: RAC_BNB_LP_PID,
    lpSymbol: 'RAC-BNB LP',
    lpAddresses: {
      97: '0x4d6F0B03AEbFa48E185Ec4d6f7118994F0EedCD0',
      56: '0x4d6F0B03AEbFa48E185Ec4d6f7118994F0EedCD0',
    },
    token: tokens.RAC,
    quoteToken: tokens.wbnb,
  },
  {
    pid: BUSD_RAC_LP_PID,
    lpSymbol: 'BUSD-RAC LP',
    lpAddresses: {
      97: '0x756f158A2C02246Bf00bbdB051729804F2efd9c7',
      56: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    },
    token: tokens.busd,
    quoteToken: tokens.RAC,
  },
  /**
   * V3 by order of release (some may be out of PID order due to multiplier boost)
   */
];

// const farms: FarmConfig[] = []

export default farms;
