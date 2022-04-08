import { useTranslation } from 'contexts/Localization';
import React from 'react';
import styled from 'styled-components';
import LogoPng from './farm.png';

const FarmHeader: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <img src={LogoPng} alt="" />
      <div>{t('There are various farming opportunities available at RAC Farms')}</div>
    </div>
  );
};

export default styled(FarmHeader)`
  padding-top: 11px;
  text-align: center;
  > img {
    height: 88px;
  }
  > div {
    font-size: 12px;
    color: #f6941d;
    margin-top: 14px;
    margin-bottom: 43px;
  }
`;
