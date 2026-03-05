import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { SizeInput } from '../size-input';

describe('SizeInput', () => {
	const defaultProps = {
		type: 'number' as const,
		value: 10,
		onChange: jest.fn(),
		InputProps: {
			endAdornment: <span data-testid="end-adornment">px</span>,
		},
	};

	const getInput = (type: 'number' | 'text' = 'number') =>
		screen.getByRole(type === 'number' ? 'spinbutton' : 'textbox');

	describe('rendering', () => {
		it('should render with required props', () => {
			render(<SizeInput {...defaultProps} />);

			const input = getInput();

			expect(input).toBeInTheDocument();
			expect(input).toHaveValue(10);
		});

		it('should pass id to the underlying input', () => {
			render(<SizeInput {...defaultProps} id="size-input-id" />);

			expect(getInput()).toHaveAttribute('id', 'size-input-id');
		});

		it('should pass type "text" when specified', () => {
			render(<SizeInput {...defaultProps} type="text" />);

			const input = getInput('text');

			expect(input).toHaveAttribute('type', 'text');
			expect(input).toHaveValue('10');
		});

		it('should pass placeholder to the underlying input', () => {
			render(<SizeInput {...defaultProps} placeholder="Enter size" />);

			expect(getInput()).toHaveAttribute('placeholder', 'Enter size');
		});

		it('should render endAdornment from InputProps', () => {
			render(<SizeInput {...defaultProps} />);

			// eslint-disable-next-line testing-library/no-test-id-queries
			const endAdornment = screen.getByTestId('end-adornment');

			expect(endAdornment).toBeInTheDocument();
			expect(endAdornment).toHaveTextContent('px');
		});

		it('should handle undefined value', () => {
			render(<SizeInput {...defaultProps} value={undefined} />);

			const input = getInput();

			expect(input).toBeInTheDocument();
		});

		it('should handle large numbers', () => {
			const largeValue = 999999999999;

			render(<SizeInput {...defaultProps} value={largeValue} />);

			expect(getInput()).toHaveValue(largeValue);
		});

		it('should handle decimal numbers', () => {
			render(<SizeInput {...defaultProps} value={10.5} />);

			expect(getInput()).toHaveValue(10.5);
		});
	});

	describe('event handlers', () => {
		it('should call onChange when input value changes', () => {
			const onChange = jest.fn();

			render(<SizeInput {...defaultProps} onChange={onChange} />);

			fireEvent.input(getInput(), { target: { value: '20' } });

			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'input' }));
			expect(onChange.mock.calls[0][0].target).toBeInstanceOf(HTMLInputElement);
		});

		it('should call onBlur when fired', () => {
			const onBlur = jest.fn();
			render(<SizeInput {...defaultProps} onBlur={onBlur} />);

			fireEvent.blur(getInput());

			expect(onBlur).toHaveBeenCalled();
		});
	});
});
