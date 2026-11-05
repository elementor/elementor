import { render, screen } from '@testing-library/react';

import { FixRowDrawer } from 'elementor/modules/agents/assets/js/admin/scanner/components/fix-row-drawer';
import {
	FIX_WITH_ANGIE,
	FIX_WITH_MANUAL,
	FIX_WITH_TOGGLE,
} from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';

const buildCheck = ( overrides = {} ) => ( {
	id: 'check',
	title: 'Check',
	evidence: 'Evidence text',
	explanation: { whatItMeans: 'Meaning text', howToFix: 'Manual steps text' },
	...overrides,
} );

const renderDrawer = ( check ) => render(
	<FixRowDrawer check={ check } preferenceValue="" onPreferenceChange={ jest.fn() } onSavePreference={ jest.fn() } />,
);

describe( 'FixRowDrawer', () => {
	it( 'hides the manual fix section when the fix is a prompt', () => {
		// Arrange & Act
		renderDrawer( buildCheck( { fixWith: FIX_WITH_ANGIE, fixPrompt: 'Do the thing' } ) );

		// Assert
		expect( screen.getByText( 'What we found' ) ).toBeTruthy();
		expect( screen.getByText( 'Meaning text' ) ).toBeTruthy();
		expect( screen.queryByText( 'How to fix it manually' ) ).toBeNull();
		expect( screen.queryByText( 'Manual steps text' ) ).toBeNull();
	} );

	it( 'keeps the manual fix section for an Angie fix without a prompt', () => {
		renderDrawer( buildCheck( { fixWith: FIX_WITH_ANGIE, fixPrompt: '' } ) );

		expect( screen.getByText( 'How to fix it manually' ) ).toBeTruthy();
	} );

	it.each( [ FIX_WITH_MANUAL, FIX_WITH_TOGGLE ] )( 'keeps the manual fix section for %s fixes', ( fixWith ) => {
		renderDrawer( buildCheck( { fixWith, fixPrompt: 'Unused prompt' } ) );

		expect( screen.getByText( 'How to fix it manually' ) ).toBeTruthy();
		expect( screen.getByText( 'Manual steps text' ) ).toBeTruthy();
	} );
} );
