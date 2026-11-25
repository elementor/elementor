import * as React from 'react';
import { renderWithQuery } from 'test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { ContentPanelCoordinatorProvider } from '../../../contexts/content-panel-coordinator';
import ContentPanelHeaderAdd from '../content-panel-header-add';

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
	it( 'shows Popup in the add menu by default', async () => {
		renderWithQuery(
			<ContentPanelCoordinatorProvider>
				<ContentPanelHeaderAdd />
			</ContentPanelCoordinatorProvider>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Add new' } ) );

		await waitFor( () => {
			expect( screen.getByText( 'Popup' ) ).toBeInTheDocument();
		} );
	} );
} );
