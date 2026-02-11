import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen, within } from '@testing-library/react';

import * as boundPropContext from '../../bound-prop-context';
import { EmailControl } from '../email-control';

const propType = createMockPropType( { kind: 'object' } );
const setValue = jest.fn();

const wrap = ( val: string ) => ( { $$type: 'string' as const, value: val } );

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

const mockUseBoundProp = boundPropContext.useBoundProp as jest.MockedFunction< typeof boundPropContext.useBoundProp >;

describe( 'EmailControl', () => {
	beforeEach( () => {
		setValue.mockClear();
		mockUseBoundProp.mockReturnValue( {
			value: {
				to: wrap( '' ),
				from: wrap( '' ),
				fromName: wrap( '' ),
				cc: null,
				bcc: null,
				subject: wrap( '' ),
				message: wrap( '' ),
				replyTo: wrap( '' ),
				'meta-data': null,
				'send-as': wrap( 'html' ),
			},
			setValue,
			disabled: false,
			propType,
			bind: 'email',
			path: [],
			resetValue: jest.fn(),
			restoreValue: jest.fn(),
		} );
	} );

	it( 'should render email control with all required fields', () => {
		// Arrange & Act
		renderControl( <EmailControl />, {
			setValue,
			value: {
				to: wrap( '' ),
				from: wrap( '' ),
				fromName: wrap( '' ),
				subject: wrap( '' ),
				message: wrap( '' ),
				replyTo: wrap( '' ),
				'send-as': wrap( 'html' ),
			},
			bind: 'email',
			propType,
		} );

		// Assert
		expect( screen.getByText( /send to/i ) ).toBeInTheDocument();
		expect( screen.getByText( /from email/i ) ).toBeInTheDocument();
		expect( screen.getByText( /email subject/i ) ).toBeInTheDocument();
		expect( screen.getByText( /^message$/i ) ).toBeInTheDocument();
	} );

	it( 'should allow filling in email values', () => {
		// Arrange
		const testEmail = 'test@example.com';
		renderControl( <EmailControl />, {
			setValue,
			value: {
				to: wrap( '' ),
				from: wrap( '' ),
				fromName: wrap( '' ),
				subject: wrap( '' ),
				message: wrap( '' ),
				replyTo: wrap( '' ),
				'send-as': wrap( 'html' ),
			},
			bind: 'email',
			propType,
		} );

		// Act
		const toInput = screen.getByPlaceholderText( /where should we send new submissions/i );
		fireEvent.change( toInput, { target: { value: testEmail } } );

		// Assert
		expect( setValue ).toHaveBeenCalled();
	} );

	it( 'should toggle show-more section', () => {
		// Arrange
		renderControl( <EmailControl />, {
			setValue,
			value: {
				to: wrap( '' ),
				from: wrap( '' ),
				fromName: wrap( '' ),
				subject: wrap( '' ),
				message: wrap( '' ),
				replyTo: wrap( '' ),
				'send-as': wrap( 'html' ),
			},
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

	it( 'should allow filling values in show-more fields', () => {
		// Arrange
		renderControl( <EmailControl />, {
			setValue,
			value: {
				to: wrap( '' ),
				from: wrap( '' ),
				fromName: wrap( '' ),
				cc: null,
				bcc: null,
				subject: wrap( '' ),
				message: wrap( '' ),
				replyTo: wrap( '' ),
				'send-as': wrap( 'html' ),
			},
			bind: 'email',
			propType,
		} );

		// Act
		const showMoreButton = screen.getByRole( 'button', { name: /show more/i } );
		fireEvent.click( showMoreButton );

		// Assert
		expect( screen.getByText( /^cc$/i ) ).toBeInTheDocument();
		expect( screen.getByText( /^bcc$/i ) ).toBeInTheDocument();
	} );

	it( 'should show collapsed fields after clicking show more', () => {
		// Arrange
		renderControl( <EmailControl />, {
			setValue,
			value: {
				to: wrap( '' ),
				from: wrap( '' ),
				fromName: wrap( '' ),
				subject: wrap( '' ),
				message: wrap( '' ),
				replyTo: wrap( '' ),
				'send-as': wrap( 'html' ),
			},
			bind: 'email',
			propType,
		} );

		// Act
		const showMoreButton = screen.getByRole( 'button', { name: /show more/i } );
		fireEvent.click( showMoreButton );

		// Assert
		expect( screen.getByText( /from name/i ) ).toBeInTheDocument();
		expect( screen.getByText( /reply-to/i ) ).toBeInTheDocument();
		expect( screen.getByText( /meta data/i ) ).toBeInTheDocument();
	} );
} );
