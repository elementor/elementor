import { act, renderHook } from '@testing-library/react';

import { useSingleExpandedCard } from '../use-single-expanded-card';

describe( 'useSingleExpandedCard', () => {
	it( 'starts with no card expanded by default', () => {
		// Arrange & Act.
		const { result } = renderHook( () => useSingleExpandedCard() );

		// Assert.
		expect( result.current.expandedId ).toBeNull();
	} );

	it( 'expands a card when toggled from a collapsed state', () => {
		// Arrange.
		const { result } = renderHook( () => useSingleExpandedCard() );

		// Act.
		act( () => result.current.toggle( 'audits/images-too-large' ) );

		// Assert.
		expect( result.current.expandedId ).toBe( 'audits/images-too-large' );
	} );

	it( 'collapses the expanded card when toggled again', () => {
		// Arrange.
		const { result } = renderHook( () => useSingleExpandedCard() );
		act( () => result.current.toggle( 'audits/images-too-large' ) );

		// Act.
		act( () => result.current.toggle( 'audits/images-too-large' ) );

		// Assert.
		expect( result.current.expandedId ).toBeNull();
	} );

	it( 'switches to the newly toggled card, collapsing the previous one', () => {
		// Arrange.
		const { result } = renderHook( () => useSingleExpandedCard() );
		act( () => result.current.toggle( 'audits/images-too-large' ) );

		// Act.
		act( () => result.current.toggle( 'audits/privacy-policy' ) );

		// Assert.
		expect( result.current.expandedId ).toBe( 'audits/privacy-policy' );
	} );
} );
