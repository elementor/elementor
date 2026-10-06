import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { ajax } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import { NoticeControl } from '../notice-control';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	ajax: {
		load: jest.fn(),
	},
} ) );

const propType = createMockPropType( { kind: 'plain' } );

describe( 'NoticeControl', () => {
	beforeEach( () => {
		jest.mocked( ajax.load ).mockResolvedValue( {} );
		( window as unknown as { elementor: unknown } ).elementor = {
			config: { user: { dismissed_editor_notices: [] } },
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not render when there is no content', () => {
		// Act.
		renderControl( <NoticeControl heading="Accessible structure matters" />, { bind: 'notice', propType } );

		// Assert.
		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
	} );

	it( 'should render the heading, content and action button', () => {
		// Act.
		renderControl(
			<NoticeControl
				heading="Accessible structure matters"
				content="Ally helps detect and fix common issues across your site."
				buttonText="Install now"
				buttonUrl="https://go.elementor.com/install-ally"
			/>,
			{ bind: 'notice', propType }
		);

		// Assert.
		expect( screen.getByText( 'Accessible structure matters' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Ally helps detect and fix common issues across your site.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Install now' } ) ).toHaveAttribute(
			'href',
			'https://go.elementor.com/install-ally'
		);
	} );

	it( 'should persist the dismissal and hide the notice when the dismiss button is clicked', () => {
		// Arrange.
		renderControl(
			<NoticeControl
				content="Ally helps detect and fix common issues across your site."
				dismissible="ally-atomic-notice"
			/>,
			{ bind: 'notice', propType }
		);

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		// Assert.
		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		expect( ajax.load ).toHaveBeenCalledWith( {
			action: 'dismissed_editor_notices',
			unique_id: 'dismiss-editor-notice-ally-atomic-notice',
			data: { dismissId: 'ally-atomic-notice' },
		} );

		const extendedWindow = window as unknown as {
			elementor: { config: { user: { dismissed_editor_notices: string[] } } };
		};
		expect( extendedWindow.elementor.config.user.dismissed_editor_notices ).toContain( 'ally-atomic-notice' );
	} );

	it( 'should hide the notice without calling the dismiss ajax when the action button is clicked', () => {
		// Arrange.
		renderControl(
			<NoticeControl
				content="Ally helps detect and fix common issues across your site."
				buttonText="Install now"
				buttonUrl="https://go.elementor.com/install-ally"
				dismissible="ally-atomic-notice"
			/>,
			{ bind: 'notice', propType }
		);

		// Act.
		fireEvent.click( screen.getByRole( 'link', { name: 'Install now' } ) );

		// Assert.
		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		expect( ajax.load ).not.toHaveBeenCalled();

		const extendedWindow = window as unknown as {
			elementor: { config: { user: { dismissed_editor_notices: string[] } } };
		};
		expect( extendedWindow.elementor.config.user.dismissed_editor_notices ).toContain( 'ally-atomic-notice' );
	} );
} );
