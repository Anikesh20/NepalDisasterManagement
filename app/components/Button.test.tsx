import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Button from './Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<Button title="Click me" onPress={onPressMock} />);
    fireEvent.press(getByTestId('button-touchable'));
    expect(onPressMock).toHaveBeenCalled();
  });
}); 