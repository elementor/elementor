import { type UseQueryResult } from '@elementor/query';
import { act, renderHook } from '@testing-library/react';

import { type User } from '../types';
import { useCurrentUser } from '../use-current-user';
import { useSuppressedMessage } from '../use-suppressed-message';
import { useUpdateCurrentUser } from '../use-update-current-user';

jest.mock( '../use-current-user' );
jest.mock( '../use-update-current-user' );

describe( 'useSuppressedMessage', () => {
	it( 'returns false and suppressMessage function when message is not suppressed', () => {
		// Arrange.
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { suppressedMessages: [ 'non-existing-message' ] },
		} as UseQueryResult< User, Error > );

		const mutate = jest.fn();
		jest.mocked( useUpdateCurrentUser ).mockReturnValue( { mutate } as never );

		// Act.
		const { result } = renderHook( () => useSuppressedMessage( 'test-message' ) );

		// Assert.
		const [ isMessageSuppressed, suppressMessage ] = result.current;

		expect( isMessageSuppressed ).toBe( false );

		act( () => {
			suppressMessage();
		} );

		expect( mutate ).toHaveBeenCalledWith( { suppressedMessages: [ 'non-existing-message', 'test-message' ] } );
	} );

	it( 'returns true and suppressMessage function when message is already suppressed', () => {
		// Arrange.
		jest.mocked( useCurrentUser ).mockReturnValue( {
			data: { suppressedMessages: [ 'test-message' ] },
		} as UseQueryResult< User, Error > );

		const mutate = jest.fn();

		jest.mocked( useUpdateCurrentUser ).mockReturnValue( { mutate } as never );

		// Act.
		const { result } = renderHook( () => useSuppressedMessage( 'test-message' ) );

		// Assert.
		const [ isMessageSuppressed, suppressMessage ] = result.current;

		expect( isMessageSuppressed ).toBe( true );

		act( () => {
			suppressMessage();
		} );

		expect( mutate ).not.toHaveBeenCalled();
	} );
} );
