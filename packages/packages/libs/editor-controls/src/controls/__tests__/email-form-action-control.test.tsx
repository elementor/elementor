import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import * as boundPropContext from '../../bound-prop-context';
import { EmailFormActionControl } from '../email-form-action-control';

const propType = createMockPropType( {
	kind: 'object',
	shape: {
		to: createMockPropType( { kind: 'array', item_prop_type: createMockPropType( { kind: 'plain' } ) } ),
		subject: createMockPropType( { kind: 'plain' } ),
		message: createMockPropType( { kind: 'plain' } ),
		from: createMockPropType( { kind: 'plain' } ),
		'meta-data': createMockPropType( { kind: 'array', item_prop_type: createMockPropType( { kind: 'plain' } ) } ),
		'send-as': createMockPropType( { kind: 'plain' } ),
		'from-name': createMockPropType( { kind: 'plain' } ),
		'reply-to': createMockPropType( { kind: 'plain' } ),
		cc: createMockPropType( { kind: 'plain' } ),
		bcc: createMockPropType( { kind: 'plain' } ),
	},
} );
const setValue = jest.fn();

const wrap = ( val: string ) => ( { $$type: 'string' as const, value: val } );
const wrapStringArray = ( vals: string[] ) => ( {
	$$type: 'string-array' as const,
	value: vals.map( ( v ) => wrap( v ) ),
} );

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

const mockUseBoundProp = boundPropContext.useBoundProp as jest.MockedFunction< typeof boundPropContext.useBoundProp >;

const defaultEmailValue = {
	to: wrapStringArray( [ 'admin@test.com' ] ),
	from: wrap( '' ),
	fromName: wrap( '' ),
	cc: null,
	bcc: null,
	subject: wrap( '' ),
	message: wrap( '' ),
	replyTo: wrap( '' ),
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
				propType:
					( propType as unknown as { shape: Record< string, unknown > } ).shape?.to ??
					createMockPropType( { kind: 'array' } ),
				bind: 'to',
				path: [ 'to' ],
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
