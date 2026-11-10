import { injectIntoControlHeader } from '@elementor/editor-controls';
import { injectIntoClassSelectorActions, injectIntoStyleTabHeader } from '@elementor/editor-editing-panel';
import { injectIntoClassManagerHeader } from '@elementor/editor-global-classes';
import { injectIntoInteractionsHeader } from '@elementor/editor-interactions';

import { AngieControlHeaderAction } from '../control-header/angie-control-header-action';
import { AngieClassManagerHeaderAction } from '../css-classes/angie-class-manager-header-action';
import { AngieClassSelectorAction } from '../css-classes/angie-class-selector-action';
import { AngieInteractionsHeaderAction } from '../interactions/angie-interactions-header-action';
import { init } from '../init';
import { AngieStyleTabHeaderAction } from '../style-section/angie-style-tab-header-action';

jest.mock( '@elementor/editor-controls', () => ( {
	injectIntoControlHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-editing-panel', () => ( {
	injectIntoClassSelectorActions: jest.fn(),
	injectIntoStyleTabHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-global-classes', () => ( {
	injectIntoClassManagerHeader: jest.fn(),
} ) );

jest.mock( '@elementor/editor-interactions', () => ( {
	injectIntoInteractionsHeader: jest.fn(),
} ) );

describe( 'init', () => {
	it( 'injects Angie actions into every entry point location', () => {
		// Act
		init();

		// Assert
		expect( injectIntoControlHeader ).toHaveBeenCalledWith( {
			id: 'angie-control-header-action',
			component: AngieControlHeaderAction,
		} );
		expect( injectIntoStyleTabHeader ).toHaveBeenCalledWith( {
			id: 'angie-style-tab-header-action',
			component: AngieStyleTabHeaderAction,
		} );
		expect( injectIntoClassSelectorActions ).toHaveBeenCalledWith( {
			id: 'angie-class-selector-action',
			component: AngieClassSelectorAction,
		} );
		expect( injectIntoClassManagerHeader ).toHaveBeenCalledWith( {
			id: 'angie-class-manager-header-action',
			component: AngieClassManagerHeaderAction,
		} );
		expect( injectIntoInteractionsHeader ).toHaveBeenCalledWith( {
			id: 'angie-interactions-header-action',
			component: AngieInteractionsHeaderAction,
		} );
	} );
} );
