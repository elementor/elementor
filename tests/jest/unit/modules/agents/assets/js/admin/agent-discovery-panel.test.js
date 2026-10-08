/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react';

import { AgentDiscoveryPanel } from 'elementor/modules/agents/assets/js/admin/components/agent-discovery/agent-discovery-panel';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
} ) );

jest.mock( '@elementor/icons', () => ( {
	CircleCheckIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Chip', () => ( { label, component, href, target, rel } ) => (
	component ? <a href={ href } target={ target } rel={ rel }>{ label }</a> : <span>{ label }</span>
) );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Typography', () => ( { children } ) => <span>{ children }</span> );

const AGENT_JSON_URL = 'https://example.com/.well-known/agent.json';

const defaultFiles = [
	{ slug: 'agent.json', url: AGENT_JSON_URL },
	{ slug: 'api-catalog', url: 'https://example.com/.well-known/api-catalog' },
	{ slug: 'auth.md', url: 'https://example.com/.well-known/auth.md' },
];

const renderPanel = ( settings ) => render(
	<AgentDiscoveryPanel settings={ { files: defaultFiles, isEnabled: true, ...settings } } />,
);

describe( 'AgentDiscoveryPanel', () => {
	it( 'hides included items whose files are not applicable', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getByText( 'Capability catalog' ) ).toBeTruthy();
		expect( screen.getByText( 'API catalog' ) ).toBeTruthy();
		expect( screen.getByText( 'Sign-in guide for agents and OAuth discovery' ) ).toBeTruthy();
		expect( screen.queryByText( 'Agent skills' ) ).toBeNull();
		expect( screen.queryByText( 'agent-skills' ) ).toBeNull();
	} );

	it( 'links each file chip to its live URL in a new tab when enabled', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		const link = screen.getByRole( 'link', { name: 'agent.json' } );
		expect( link.getAttribute( 'href' ) ).toBe( AGENT_JSON_URL );
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
		expect( link.getAttribute( 'rel' ) ).toBe( 'noopener noreferrer' );
	} );

	it( 'renders file chips without links when disabled', () => {
		// Arrange & Act
		renderPanel( { isEnabled: false } );

		// Assert
		expect( screen.getByText( 'agent.json' ) ).toBeTruthy();
		expect( screen.queryAllByRole( 'link' ) ).toHaveLength( 0 );
	} );
} );
