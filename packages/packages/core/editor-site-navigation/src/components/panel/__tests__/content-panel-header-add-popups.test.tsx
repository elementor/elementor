import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { screen } from '@testing-library/react';

import { ContentPanelCoordinatorProvider } from '../../../contexts/content-panel-coordinator';
import ContentPanelHeaderAdd from '../content-panel-header-add';

jest.mock( '../../../env', () => ( {
	env: {
		popups: {
			can_use: false,
			upgrade_url: 'https://example.com/upgrade',
		},
	},
} ) );

jest.mock( '../../../hooks/use-accessible-panel-post-types', () => ( {
	__esModule: true,
	default: jest.fn( () => ( {
		accessiblePostTypes: [ 'page' ],
		isUserPending: false,
		showUserLoadError: false,
	} ) ),
} ) );

jest.mock( '../../../hooks/use-can-create', () => ( {
	__esModule: true,
	default: jest.fn( () => true ),
} ) );

describe( 'ContentPanelHeaderAdd popups item', () => {
	it( 'shows Popup when popups env is set', () => {
		renderWithQuery(
			<ContentPanelCoordinatorProvider>
				<ContentPanelHeaderAdd />
			</ContentPanelCoordinatorProvider>
		);

		screen.getByRole( 'button', { name: 'Add new' } ).click();

		expect( screen.getByRole( 'menuitem', { name: 'Popup' } ) ).toBeInTheDocument();
	} );
} );