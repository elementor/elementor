import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { type ObjectPropType, type UnionPropType } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import * as boundPropContext from '../../bound-prop-context';
import { EmailFormActionControl } from '../email-form-action-control';

const wrap = ( val: string ) => ( { $$type: 'string' as const, value: val } );
const wrapStringArray = ( vals: string[] ) => ( {
	$$type: 'string-array' as const,
	value: vals.map( ( v ) => wrap( v ) ),
} );

const createStringPropType = () => createMockPropType( { kind: 'plain', key: 'string' } );

const createStringArrayPropType = () =>
	createMockPropType( {
		kind: 'array',
		key: 'string-array',
		item_prop_type: createStringPropType(),
	} );

const createRecipientUnionPropType = (): UnionPropType =>
	createMockPropType( {
		kind: 'union',
		prop_types: {
			'string-array': createStringArrayPropType(),
			dynamic: createMockPropType( {
				kind: 'plain',
				key: 'dynamic',
				settings: { categories: [ 'text' ] },
			} ),
		},
	} ) as UnionPropType;

const propType = createMockPropType( {
	kind: 'object',
	shape: {
		to: createRecipientUnionPropType(),
		subject: createMockPropType( { kind: 'plain', key: 'string' } ),
		message: createMockPropType( { kind: 'plain', key: 'string' } ),
		from: createMockPropType( { kind: 'plain', key: 'string' } ),
		'meta-data': createMockPropType( {
			kind: 'array',
			key: 'string-array',
			item_prop_type: createStringPropType(),
		} ),
		'send-as': createMockPropType( { kind: 'plain', key: 'string' } ),
		'from-name': createMockPropType( { kind: 'plain', key: 'string' } ),
		'reply-to': createMockPropType( { kind: 'plain', key: 'string' } ),
		cc: createRecipientUnionPropType(),
		bcc: createRecipientUnionPropType(),
	},
} );

const setValue = jest.fn();

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

const mockUseBoundProp = boundPropContext.useBoundProp as jest.MockedFunction< typeof boundPropContext.useBoundProp >;

const defaultEmailValue = {
	to: wrapStringArray( [ 'admin@test.com' ] ),
	from: wrap( '' ),
	'from-name': wrap( '' ),
	cc: null,
	bcc: null,
	subject: wrap( '' ),
	message: wrap( '' ),
	'reply-to': wrap( '' ),
	'meta-data': null,
	'send-as': wrap( 'html' ),
};

const setupMock = ( emailValue = defaultEmailValue ) => {
	( mockUseBoundProp as jest.Mock ).mockImplementation( ( propTypeUtil?: { key: string } ) => {
		if ( propTypeUtil?.key === 'string-array' ) {
			return {
				value: emailValue.to?.value ?? [],
				setValue,
				disabled: false,
				propType: ( propType as ObjectPropType ).shape.to,
				bind: 'to',
				path: [ 'to' ],
				resetValue: jest.fn(),
				restoreValue: jest.fn(),
			};
		}

		if ( propTypeUtil?.key === 'string' ) {
			return {
				value: '',
				setValue,
				disabled: false,
				propType: createStringPropType(),
				bind: 'subject',
				path: [ 'subject' ],
				resetValue: jest.fn(),
				restoreValue: jest.fn(),
			};
		}

		return {
			value: emailValue,
			setValue,
			disabled: false,
			propType,
			bind: 'email',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		};
	} );
};

describe( 'EmailFormActionControl', () => {
	beforeEach( () => {
		setValue.mockClear();
		setupMock();
	} );

	it( 'should define to, cc, and bcc as union prop types with dynamic support', () => {
		// Arrange
		const shape = ( propType as ObjectPropType ).shape;

		// Assert
		for ( const fieldBind of [ 'to', 'cc', 'bcc' ] as const ) {
			const fieldPropType = shape[ fieldBind ];

			expect( fieldPropType.kind ).toBe( 'union' );

			if ( fieldPropType.kind !== 'union' ) {
				throw new Error( `Expected ${ fieldBind } to be a union prop type` );
			}

			expect( fieldPropType.prop_types.dynamic?.key ).toBe( 'dynamic' );
			expect( fieldPropType.prop_types[ 'string-array' ]?.key ).toBe( 'string-array' );
		}
	} );

	it( 'should render email control with all required fields', () => {
		// Arrange & Act
		renderControl( <EmailFormActionControl />, {
			setValue,
			value: defaultEmailValue,
			bind: 'email',
			propType,
		} );

		// Assert
		expect( screen.getByText( /send to/i ) ).toBeInTheDocument();
		expect( screen.getByText( /from email/i ) ).toBeInTheDocument();
		expect( screen.getByText( /email subject/i ) ).toBeInTheDocument();
		expect( screen.getByText( /^message$/i ) ).toBeInTheDocument();
	} );

	it( 'should render send-to chips from string array', () => {
		// Arrange & Act
		renderControl( <EmailFormActionControl />, {
			setValue,
			value: defaultEmailValue,
			bind: 'email',
			propType,
		} );

		// Assert
		expect( screen.getByText( 'admin@test.com' ) ).toBeInTheDocument();
	} );

	it( 'should allow filling in email values', () => {
		// Arrange
		const toPlaceholder = 'placeholder@email.text';

		renderControl( <EmailFormActionControl toPlaceholder={ toPlaceholder } />, {
			setValue,
			value: {
				...defaultEmailValue,
				to: wrapStringArray( [] ),
			},
			bind: 'email',
			propType,
		} );

		// Assert
		expect( screen.getByPlaceholderText( toPlaceholder ) ).toBeInTheDocument();
	} );

	it( 'should toggle show-more section', () => {
		// Arrange
		renderControl( <EmailFormActionControl />, {
			setValue,
			value: defaultEmailValue,
			bind: 'email',
			propType,
		} );

		expect( screen.queryByText( /^cc$/i ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /^bcc$/i ) ).not.toBeInTheDocument();

		// Act
		const showMoreButton = screen.getByRole( 'button', { name: /show more/i } );
		fireEvent.click( showMoreButton );

		// Assert
		expect( screen.getByText( /^cc$/i ) ).toBeInTheDocument();
		expect( screen.getByText( /^bcc$/i ) ).toBeInTheDocument();
	} );

	it( 'should show collapsed fields after clicking show more', () => {
		// Arrange
		renderControl( <EmailFormActionControl />, {
			setValue,
			value: defaultEmailValue,
			bind: 'email',
			propType,
		} );

		// Act
		const showMoreButton = screen.getByRole( 'button', { name: /show more/i } );
		fireEvent.click( showMoreButton );

		// Assert
		expect( screen.getByText( /from name/i ) ).toBeInTheDocument();
		expect( screen.getByText( /reply-to/i ) ).toBeInTheDocument();
		expect( screen.getByText( /metadata/i ) ).toBeInTheDocument();
	} );
} );
