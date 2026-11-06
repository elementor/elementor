import {
	FIX_WITH_ANGIE,
	FIX_WITH_MANUAL,
	FIX_WITH_TOGGLE,
	isPromptBasedFix,
} from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';

describe( 'isPromptBasedFix', () => {
	it( 'returns true for an Angie fix with a prompt', () => {
		expect( isPromptBasedFix( { fixWith: FIX_WITH_ANGIE, fixPrompt: 'Add opening hours' } ) ).toBe( true );
	} );

	it.each( [ '', null, undefined ] )( 'returns false for an Angie fix without a prompt (%p)', ( fixPrompt ) => {
		expect( isPromptBasedFix( { fixWith: FIX_WITH_ANGIE, fixPrompt } ) ).toBe( false );
	} );

	it.each( [ FIX_WITH_TOGGLE, FIX_WITH_MANUAL ] )( 'returns false for %s fixes even with a prompt', ( fixWith ) => {
		expect( isPromptBasedFix( { fixWith, fixPrompt: 'Unused prompt' } ) ).toBe( false );
	} );

	it.each( [ null, undefined ] )( 'returns false for a missing check (%p)', ( check ) => {
		expect( isPromptBasedFix( check ) ).toBe( false );
	} );
} );
