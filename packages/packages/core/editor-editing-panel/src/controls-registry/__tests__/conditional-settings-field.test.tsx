import * as React from 'react';
import { createMockElementType, createMockPropType, renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';
import { useElementSettings } from '@elementor/editor-elements';
import { type PropValue } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';

import { mockElement } from '../../__tests__/utils';
import { ElementProvider } from '../../contexts/element-context';
import { SettingsField } from '../settings-field';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementSettings: jest.fn(),
	updateElementSettings: jest.fn(),
	getElementLabel: jest.fn(),
	getElementSettings: jest.fn(),
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );

const wrap = ( val: string ) => ( { $$type: 'string' as const, value: val } );

describe( 'ConditionalSettingsField with shouldHide', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should hide email fields when email is not in actions-after-submit', () => {
		// Arrange
		const propsSchema = {
			'actions-after-submit': createMockPropType( {
				kind: 'array',
				item_prop_type: createMockPropType( { kind: 'plain' } ),
			} ),
			email: createMockPropType( {
				kind: 'object',
				dependencies: {
					relation: 'or',
					terms: [
						{
							operator: 'contains',
							path: [ 'actions-after-submit' ],
							value: 'email',
						},
					],
					shouldHide: true,
				},
				shape: {
					to: createMockPropType( { kind: 'plain' } ),
					from: createMockPropType( { kind: 'plain' } ),
					subject: createMockPropType( { kind: 'plain' } ),
				},
			} ),
		};

		const elementType = createMockElementType( { propsSchema } );
		const element = mockElement();

		jest.mocked( useElementSettings ).mockReturnValue( {
			'actions-after-submit': {
				$$type: 'array',
				value: [ wrap( 'collect-submissions' ) ],
			},
		} as Record< string, PropValue > );

		// Act
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind="email" propDisplayName={ __( 'Email', 'elementor' ) }>
					<div data-testid="email-fields">Email Control Content</div>
				</SettingsField>
			</ElementProvider>
		);

		// Assert
		expect( screen.queryByTestId( 'email-fields' ) ).not.toBeInTheDocument();
	} );

	it( 'should show email fields when email is in actions-after-submit', () => {
		// Arrange
		const propsSchema = {
			'actions-after-submit': createMockPropType( {
				kind: 'array',
				item_prop_type: createMockPropType( { kind: 'plain' } ),
			} ),
			email: createMockPropType( {
				kind: 'object',
				dependencies: {
					relation: 'or',
					terms: [
						{
							operator: 'contains',
							path: [ 'actions-after-submit' ],
							value: 'email',
						},
					],
					shouldHide: true,
				},
				shape: {
					to: createMockPropType( { kind: 'plain' } ),
					from: createMockPropType( { kind: 'plain' } ),
					subject: createMockPropType( { kind: 'plain' } ),
				},
			} ),
		};

		const elementType = createMockElementType( { propsSchema } );
		const element = mockElement();

		jest.mocked( useElementSettings ).mockReturnValue( {
			'actions-after-submit': {
				$$type: 'array',
				value: [ wrap( 'collect-submissions' ), wrap( 'email' ) ],
			},
		} as Record< string, PropValue > );

		// Act
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind="email" propDisplayName={ __( 'Email', 'elementor' ) }>
					<div data-testid="email-fields">Email Control Content</div>
				</SettingsField>
			</ElementProvider>
		);

		// Assert
		expect( screen.getByTestId( 'email-fields' ) ).toBeInTheDocument();
	} );

	it( 'should hide email fields when dependency is not met', () => {
		// Arrange
		const propsSchema = {
			'actions-after-submit': createMockPropType( {
				kind: 'array',
				item_prop_type: createMockPropType( { kind: 'plain' } ),
			} ),
			email: createMockPropType( {
				kind: 'object',
				dependencies: {
					relation: 'or',
					terms: [
						{
							operator: 'contains',
							path: [ 'actions-after-submit' ],
							value: 'email',
						},
					],
					shouldHide: true,
				},
				shape: {
					to: createMockPropType( { kind: 'plain' } ),
				},
			} ),
		};

		const elementType = createMockElementType( { propsSchema } );
		const element = mockElement();

		jest.mocked( useElementSettings ).mockReturnValue( {
			'actions-after-submit': {
				$$type: 'array',
				value: [ wrap( 'webhook' ) ],
			},
		} as Record< string, PropValue > );

		// Act
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind="email" propDisplayName={ __( 'Email', 'elementor' ) }>
					<div data-testid="email-fields">Email Control Content</div>
				</SettingsField>
			</ElementProvider>
		);

		// Assert
		expect( screen.queryByTestId( 'email-fields' ) ).not.toBeInTheDocument();
	} );

	it( 'should show email fields when adding email chip to actions-after-submit', () => {
		// Arrange
		const propsSchema = {
			'actions-after-submit': createMockPropType( {
				kind: 'array',
				item_prop_type: createMockPropType( { kind: 'plain' } ),
			} ),
			email: createMockPropType( {
				kind: 'object',
				dependencies: {
					relation: 'or',
					terms: [
						{
							operator: 'contains',
							path: [ 'actions-after-submit' ],
							value: 'email',
						},
					],
					shouldHide: true,
				},
				shape: {
					to: createMockPropType( { kind: 'plain' } ),
					from: createMockPropType( { kind: 'plain' } ),
					subject: createMockPropType( { kind: 'plain' } ),
				},
			} ),
		};

		const elementType = createMockElementType( { propsSchema } );
		const element = mockElement();

		jest.mocked( useElementSettings ).mockReturnValue( {
			'actions-after-submit': {
				$$type: 'array',
				value: [ wrap( 'collect-submissions' ) ],
			},
		} as Record< string, PropValue > );

		const { rerender } = renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind="email" propDisplayName={ __( 'Email', 'elementor' ) }>
					<div data-testid="email-fields">Email Control Content</div>
				</SettingsField>
			</ElementProvider>
		);

		expect( screen.queryByTestId( 'email-fields' ) ).not.toBeInTheDocument();

		// Act
		jest.mocked( useElementSettings ).mockReturnValue( {
			'actions-after-submit': {
				$$type: 'array',
				value: [ wrap( 'collect-submissions' ), wrap( 'email' ) ],
			},
		} as Record< string, PropValue > );

		rerender(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind="email" propDisplayName={ __( 'Email', 'elementor' ) }>
					<div data-testid="email-fields">Email Control Content</div>
				</SettingsField>
			</ElementProvider>
		);

		// Assert
		expect( screen.getByTestId( 'email-fields' ) ).toBeInTheDocument();
	} );
} );
