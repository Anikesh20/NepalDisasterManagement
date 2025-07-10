import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Button from './Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPressMock} />);
    fireEvent.press(getByText('Click me'));
    expect(onPressMock).toHaveBeenCalled();
  });
}); 