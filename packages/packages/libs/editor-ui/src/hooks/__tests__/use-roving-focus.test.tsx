import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { useRovingFocus } from '../use-roving-focus';

type HarnessProps = {
	tabbableKey?: string;
	mountedSignature?: string;
	mountedKeys: string[];
	onReady: ( api: ReturnType< typeof useRovingFocus< HTMLButtonElement > > ) => void;
};

const Harness = ( { tabbableKey, mountedSignature = '', mountedKeys, onReady }: HarnessProps ) => {
	const api = useRovingFocus< HTMLButtonElement >( { tabbableKey, mountedSignature } );

	onReady( api );

	return (
		<>
			{ mountedKeys.map( ( key ) => (
				<button key={ key } ref={ api.registerRef( key ) }>
					{ key }
				</button>
			) ) }
		</>
	);
};

describe( 'useRovingFocus', () => {
	it( 'should not move focus until a focus is requested', () => {
		// Arrange.
		render( <Harness tabbableKey="a" mountedKeys={ [ 'a', 'b' ] } onReady={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'a' ) ).not.toHaveFocus();
	} );

	it( 'should focus the tabbable element after a request', () => {
		// Arrange.
		let api: ReturnType< typeof useRovingFocus< HTMLButtonElement > > | undefined;
		const { rerender } = render(
			<Harness tabbableKey="a" mountedKeys={ [ 'a', 'b' ] } onReady={ ( value ) => ( api = value ) } />
		);

		// Act.
		api?.requestFocus();
		rerender( <Harness tabbableKey="b" mountedKeys={ [ 'a', 'b' ] } onReady={ ( value ) => ( api = value ) } /> );

		// Assert.
		expect( screen.getByText( 'b' ) ).toHaveFocus();
	} );

	it( 'should wait for the tabbable element to mount before focusing it', () => {
		// Arrange.
		let api: ReturnType< typeof useRovingFocus< HTMLButtonElement > > | undefined;
		const { rerender } = render(
			<Harness tabbableKey="a" mountedKeys={ [ 'a' ] } onReady={ ( value ) => ( api = value ) } />
		);

		// Act.
		api?.requestFocus();
		rerender(
			<Harness
				tabbableKey="c"
				mountedSignature="0"
				mountedKeys={ [ 'a' ] }
				onReady={ ( value ) => ( api = value ) }
			/>
		);

		// Assert.
		expect( document.body ).toHaveFocus();

		// Act.
		rerender(
			<Harness
				tabbableKey="c"
				mountedSignature="0,2"
				mountedKeys={ [ 'a', 'c' ] }
				onReady={ ( value ) => ( api = value ) }
			/>
		);

		// Assert.
		expect( screen.getByText( 'c' ) ).toHaveFocus();
	} );
} );
