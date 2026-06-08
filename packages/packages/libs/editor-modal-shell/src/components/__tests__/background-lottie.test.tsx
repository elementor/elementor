import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { BackgroundLottie } from '../background-lottie';

const LOTTIE_LABEL = 'mock-lottie-player';

jest.mock( 'lottie-react', () => ( {
	__esModule: true,
	default: () => <div aria-label={ LOTTIE_LABEL } />,
} ) );

function mockMatchMedia( reducedMotion: boolean ) {
	Object.defineProperty( window, 'matchMedia', {
		writable: true,
		configurable: true,
		value: jest.fn().mockImplementation( ( query: string ) => ( {
			matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
			media: query,
			addListener: jest.fn(),
			removeListener: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			dispatchEvent: jest.fn(),
			onchange: null,
		} ) ),
	} );
}

describe( 'BackgroundLottie', () => {
	const animationData = {};

	it( 'should render the Lottie player by default', () => {
		mockMatchMedia( false );

		render( <BackgroundLottie animationData={ animationData } /> );

		expect( screen.getByLabelText( LOTTIE_LABEL ) ).toBeInTheDocument();
	} );

	describe( 'when prefers-reduced-motion is reduce', () => {
		beforeEach( () => {
			mockMatchMedia( true );
		} );

		it( 'should not render the Lottie player', () => {
			render( <BackgroundLottie animationData={ animationData } /> );

			expect( screen.queryByLabelText( LOTTIE_LABEL ) ).not.toBeInTheDocument();
		} );

		it( 'should call onComplete from a side-effect, not during render', () => {
			const onComplete = jest.fn();

			render( <BackgroundLottie animationData={ animationData } onComplete={ onComplete } /> );

			expect( onComplete ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
