import React from 'react';
import styled from 'styled-components';
import { Button, Heading, Text } from '@kaco/uikit';
import Page from 'components/Layout/Page';
import { useTranslation } from 'contexts/Localization';
import LogoMainSvg from 'components/svg/logo-main.svg';

const StyledNotFound = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  justify-content: center;
`;

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Page>
      <StyledNotFound>
        <img alt="" src={LogoMainSvg} style={{ marginBottom: '8px', width: '64px' }} />
        <Heading scale="xxl">Come Soon</Heading>
        <Text mb="16px">{t('Oops, page not found.')}</Text>
        <Button as="a" href="/swap" scale="sm">
          {t('Back Home')}
        </Button>
      </StyledNotFound>
    </Page>
  );
};

export default NotFound;
