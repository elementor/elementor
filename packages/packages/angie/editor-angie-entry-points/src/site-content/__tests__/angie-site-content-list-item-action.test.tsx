import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';
import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieSiteContentListItemAction } from '../angie-site-content-list-item-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const post = {
	id: 10,
	link: 'https://example.local/menu',
	status: 'publish',
	type: 'page',
	title: { rendered: 'Menu' },
	user_can: { edit: true, delete: true },
};

describe( 'AngieSiteContentListItemAction', () => {
	beforeEach( () => {
		mockAngieEntryPointsEnabled();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the site content prompt when clicked', () => {
		render( <AngieSiteContentListItemAction post={ post } title="Renamed in editor" /> );

		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		expect( openAngieInAgentMode ).toHaveBeenCalledWith(
			ANGIE_PROMPTS.siteContentActiveDocument( {
				postId: post.id,
				postType: post.type,
				title: 'Renamed in editor',
			} )
		);
	} );
} );