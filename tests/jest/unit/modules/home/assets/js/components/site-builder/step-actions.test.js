import { fireEvent, render } from '@testing-library/react';
import { StepWithInput, StepWithoutInput, StepLoader, getStepAction } from 'elementor/modules/home/assets/js/site-builder/components/step-actions';

jest.mock( 'elementor/modules/home/assets/js/site-builder/components/styled-components', () => {
	const PropTypes = require( 'prop-types' );

	const PlannerInputRow = ( { children } ) => <div data-testid="input-row">{ children }</div>;
	PlannerInputRow.propTypes = { children: PropTypes.node };

	const PlannerInputColumn = ( { children } ) => <div data-testid="input-column">{ children }</div>;
	PlannerInputColumn.propTypes = { children: PropTypes.node };

	const PlannerTextField = ( { placeholder, value, onChange, onKeyDown } ) => (
		<input
			data-testid="text-field"
			placeholder={ placeholder }
			value={ value }
			onChange={ onChange }
			onKeyDown={ onKeyDown }
		/>
	);
	PlannerTextField.propTypes = {
		placeholder: PropTypes.string,
		value: PropTypes.string,
		onChange: PropTypes.func,
		onKeyDown: PropTypes.func,
	};

	const CreateSiteButton = ( { children, onClick, disabled } ) => (
		<button type="button" onClick={ onClick } disabled={ disabled }>
			{ children }
		</button>
	);
	CreateSiteButton.propTypes = {
		children: PropTypes.node,
		onClick: PropTypes.func,
		disabled: PropTypes.bool,
	};

	return { PlannerInputRow, PlannerInputColumn, PlannerTextField, CreateSiteButton };
} );

jest.mock( 'elementor/modules/home/assets/js/icons/arrow-right-icon', () => () => null );

jest.mock( '@elementor/ui', () => {
	const PropTypes = require( 'prop-types' );
	const Typography = ( { children } ) => <span>{ children }</span>;
	Typography.propTypes = { children: PropTypes.node };
	const Box = ( { children } ) => <div>{ children }</div>;
	Box.propTypes = { children: PropTypes.node };
	const CircularProgress = () => <div data-testid="circular-progress" />;
	return { Typography, Box, CircularProgress };
} );

const defaultInputProps = {
	buttonLabel: 'Create my site',
	placeholder: 'What site do you want to build?',
	inputValue: '',
	onInputChange: jest.fn(),
	onKeyDown: jest.fn(),
	onSubmit: jest.fn(),
};

const defaultWithoutInputProps = {
	buttonLabel: 'Visit sitemap',
	text: 'Your sitemap is waiting for you to continue.',
	onSubmit: jest.fn(),
};

describe( 'StepWithInput', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'disables the button when inputValue is empty', () => {
		const { getByRole } = render( <StepWithInput { ...defaultInputProps } inputValue="" /> );
		expect( getByRole( 'button', { name: /create my site/i } ).disabled ).toBe( true );
	} );

	it( 'disables the button when inputValue is whitespace only', () => {
		const { getByRole } = render( <StepWithInput { ...defaultInputProps } inputValue="   " /> );
		expect( getByRole( 'button', { name: /create my site/i } ).disabled ).toBe( true );
	} );

	it( 'enables the button when inputValue has content', () => {
		const { getByRole } = render( <StepWithInput { ...defaultInputProps } inputValue="My portfolio" /> );
		expect( getByRole( 'button', { name: /create my site/i } ).disabled ).toBe( false );
	} );

	it( 'calls onSubmit when the button is clicked', () => {
		const onSubmit = jest.fn();
		const { getByRole } = render(
			<StepWithInput { ...defaultInputProps } inputValue="My portfolio" onSubmit={ onSubmit } />,
		);
		fireEvent.click( getByRole( 'button', { name: /create my site/i } ) );
		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls onKeyDown when a key is pressed in the input', () => {
		const onKeyDown = jest.fn();
		const { getByTestId } = render(
			<StepWithInput { ...defaultInputProps } onKeyDown={ onKeyDown } />,
		);
		fireEvent.keyDown( getByTestId( 'text-field' ), { key: 'Enter' } );
		expect( onKeyDown ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders the placeholder text', () => {
		const { getByPlaceholderText } = render( <StepWithInput { ...defaultInputProps } /> );
		expect( getByPlaceholderText( 'What site do you want to build?' ) ).toBeTruthy();
	} );
} );

describe( 'StepWithoutInput', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'renders the description text', () => {
		const { getByText } = render( <StepWithoutInput { ...defaultWithoutInputProps } /> );
		expect( getByText( 'Your sitemap is waiting for you to continue.' ) ).toBeTruthy();
	} );

	it( 'renders an enabled button', () => {
		const { getByRole } = render( <StepWithoutInput { ...defaultWithoutInputProps } /> );
		expect( getByRole( 'button', { name: /visit sitemap/i } ).disabled ).toBe( false );
	} );

	it( 'calls onSubmit when the button is clicked', () => {
		const onSubmit = jest.fn();
		const { getByRole } = render(
			<StepWithoutInput { ...defaultWithoutInputProps } onSubmit={ onSubmit } />,
		);
		fireEvent.click( getByRole( 'button', { name: /visit sitemap/i } ) );
		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );
} );

describe( 'StepLoader', () => {
	it( 'renders a circular progress indicator', () => {
		const { getByTestId } = render( <StepLoader /> );
		expect( getByTestId( 'circular-progress' ) ).toBeTruthy();
	} );
} );

describe( 'getStepAction', () => {
	it( 'returns a StepWithInput element when hasInput is true', () => {
		const handlers = {
			inputValue: '',
			onInputChange: jest.fn(),
			onKeyDown: jest.fn(),
			onSubmit: jest.fn(),
		};
		const stepConfig = {
			hasInput: true,
			buttonLabel: 'Create my site',
			placeholder: 'What site do you want to build?',
		};
		const { getByTestId } = render( getStepAction( stepConfig, handlers ) );
		expect( getByTestId( 'text-field' ) ).toBeTruthy();
	} );

	it( 'returns a StepWithoutInput element when hasInput is false', () => {
		const handlers = {
			inputValue: '',
			onInputChange: jest.fn(),
			onKeyDown: jest.fn(),
			onSubmit: jest.fn(),
		};
		const stepConfig = {
			hasInput: false,
			buttonLabel: 'Visit sitemap',
			text: 'Your sitemap is waiting.',
		};
		const { queryByTestId } = render( getStepAction( stepConfig, handlers ) );
		expect( queryByTestId( 'text-field' ) ).toBeNull();
	} );
} );
