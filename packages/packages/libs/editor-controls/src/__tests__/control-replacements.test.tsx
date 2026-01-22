import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { useBoundProp } from '../bound-prop-context';
import { ControlReplacementsProvider, createControlReplacementsRegistry } from '../control-replacements';
import { createControl } from '../create-control';

jest.mock( '../bound-prop-context' );

describe( 'control-replacements', () => {
	const Control = createControl( ( { text }: { text: string } ) => <p>{ text }</p> );

	beforeEach( () => {
		jest.mocked( useBoundProp ).mockReturnValue( { value: 'value' } as never );
	} );

	it( 'should render the first matching replacement control component when its condition is met', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		jest.mocked( useBoundProp )
			.mockReturnValueOnce( {
				value: 'should-not-be-replaced',
			} as never )
			.mockReturnValueOnce( {
				value: 'should-be-replaced-by-2-or-3',
			} as never );

		registerControlReplacement( {
			id: 'replacement-1',
			component: () => <div>replacement-1</div>,
			condition: ( { value } ) => value === 'should-be-replaced-by-1',
		} );

		registerControlReplacement( {
			id: 'replacement-2',
			component: () => <div>replacement-2</div>,
			condition: ( { value } ) => value === 'should-be-replaced-by-2-or-3',
		} );

		registerControlReplacement( {
			id: 'replacement-3',
			component: () => <div>replacement-3</div>,
			condition: ( { value } ) => value === 'should-be-replaced-by-2-or-3',
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="should-not-be-replaced" />
				<Control text="should-be-replaced" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.getByText( 'should-not-be-replaced' ) ).toBeInTheDocument();

		expect( screen.queryByText( 'should-be-replaced' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'replacement-2' ) ).toBeInTheDocument();

		expect( screen.queryByText( 'replacement-1' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'replacement-3' ) ).not.toBeInTheDocument();
	} );

	it( 'should not replace if the condition throws', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		registerControlReplacement( {
			id: 'throwing-replacement',
			component: () => <div>replacement</div>,
			condition: () => {
				throw new Error( 'Error' );
			},
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="control-text" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.getByText( 'control-text' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'replacement' ) ).not.toBeInTheDocument();
	} );

	it( 'should pass placeholder value to condition function', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: 'test-value',
			placeholder: 'test-placeholder',
		} as never );

		registerControlReplacement( {
			id: 'replacement-with-placeholder',
			component: () => <div>replacement-with-placeholder</div>,
			condition: ( { value, placeholder } ) => value === 'test-value' && placeholder === 'test-placeholder',
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="control-text" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.queryByText( 'control-text' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'replacement-with-placeholder' ) ).toBeInTheDocument();
	} );

	it( 'should handle undefined placeholder value', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: 'test-value',
		} as never );

		registerControlReplacement( {
			id: 'replacement-no-placeholder',
			component: () => <div>replacement-no-placeholder</div>,
			condition: ( { placeholder } ) => typeof placeholder === 'undefined',
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="control-text" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.queryByText( 'control-text' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'replacement-no-placeholder' ) ).toBeInTheDocument();
	} );

	it( 'should use placeholder value when making replacement decisions', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		jest.mocked( useBoundProp ).mockReturnValue( {
			placeholder: 'special-placeholder',
		} as never );

		registerControlReplacement( {
			id: 'placeholder-based-replacement',
			component: () => <div>placeholder-based-replacement</div>,
			condition: ( { placeholder } ) => placeholder === 'special-placeholder',
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="control-text" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.queryByText( 'control-text' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'placeholder-based-replacement' ) ).toBeInTheDocument();
	} );

	it( 'should render original control when all replacements in chain are exhausted', () => {
		// Arrange
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		const ReplacementWithOriginal = ( { OriginalControl, ...props }: { OriginalControl: React.ComponentType } ) => (
			<div>
				<span>replacement-wrapper</span>
				<OriginalControl { ...props } />
			</div>
		);

		registerControlReplacement( {
			id: 'only-replacement',
			component: ReplacementWithOriginal,
			condition: () => true,
		} );

		// Act
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="original-control" />
			</ControlReplacementsProvider>
		);

		// Assert
		expect( screen.getByText( 'replacement-wrapper' ) ).toBeInTheDocument();
		expect( screen.getByText( 'original-control' ) ).toBeInTheDocument();
	} );

	it( 'should pass wrapped control as OriginalControl to replacements', () => {
		// Arrange
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();
		let receivedOriginalControl: React.ComponentType | null = null;

		const CapturingReplacement = ( { OriginalControl }: { OriginalControl: React.ComponentType } ) => {
			receivedOriginalControl = OriginalControl;
			return <div>capturing-replacement</div>;
		};

		registerControlReplacement( {
			id: 'capturing-replacement',
			component: CapturingReplacement,
			condition: () => true,
		} );

		// Act
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="original-control" />
			</ControlReplacementsProvider>
		);

		// Assert
		expect( receivedOriginalControl ).not.toBeNull();
		expect( receivedOriginalControl ).toBe( Control );
	} );

	it( 'should support three levels of replacement chaining', () => {
		// Arrange
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		const FirstReplacement = ( { OriginalControl, ...props }: { OriginalControl: React.ComponentType } ) => (
			<section aria-label="first-level">
				<OriginalControl { ...props } />
			</section>
		);

		const SecondReplacement = ( { OriginalControl, ...props }: { OriginalControl: React.ComponentType } ) => (
			<section aria-label="second-level">
				<OriginalControl { ...props } />
			</section>
		);

		const ThirdReplacement = ( { OriginalControl, ...props }: { OriginalControl: React.ComponentType } ) => (
			<section aria-label="third-level">
				<OriginalControl { ...props } />
			</section>
		);

		registerControlReplacement( {
			id: 'first',
			component: FirstReplacement,
			condition: () => true,
		} );

		registerControlReplacement( {
			id: 'second',
			component: SecondReplacement,
			condition: () => true,
		} );

		registerControlReplacement( {
			id: 'third',
			component: ThirdReplacement,
			condition: () => true,
		} );

		// Act
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="original-control" />
			</ControlReplacementsProvider>
		);

		// Assert
		expect( screen.getByRole( 'region', { name: 'first-level' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'region', { name: 'second-level' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'region', { name: 'third-level' } ) ).toBeInTheDocument();
		expect( screen.getByText( 'original-control' ) ).toBeInTheDocument();
	} );

	it( 'should not cause infinite loop when replacement renders OriginalControl', () => {
		// Arrange
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();
		let renderCount = 0;

		const CountingReplacement = ( { OriginalControl, ...props }: { OriginalControl: React.ComponentType } ) => {
			renderCount++;
			return (
				<div>
					<span>replacement</span>
					<OriginalControl { ...props } />
				</div>
			);
		};

		registerControlReplacement( {
			id: 'counting-replacement',
			component: CountingReplacement,
			condition: () => true,
		} );

		// Act
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="original-control" />
			</ControlReplacementsProvider>
		);

		// Assert
		expect( renderCount ).toBe( 1 );
		expect( screen.getByText( 'replacement' ) ).toBeInTheDocument();
		expect( screen.getByText( 'original-control' ) ).toBeInTheDocument();
	} );
} );
