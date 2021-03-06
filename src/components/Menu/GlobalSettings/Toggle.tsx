import React from 'react';
import ToggleOn from './imgs/open.svg';
import ToggleOff from './imgs/close.svg';

export interface ToggleProps {
  checked?: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => {
  return <img style={{ cursor: 'pointer' }} src={checked ? ToggleOn : ToggleOff} alt="" onClick={onChange} />;
};

export default Toggle;
