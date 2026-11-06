import { renderHook } from '@testing-library/react';

import { useActionProps } from '../use-action-props';

describe( 'useAngieActionProps', () => {
	it( 'should not be visible', () => {
		const { result } = renderHook( () => useActionProps() );

		expect( result.current.visible ).toBe( false );
	} );
} );
