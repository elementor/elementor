import { __ } from '@wordpress/i18n';

export const getAgentDiscoveryFeatures = () => [
	{
		id: 'capability-catalog',
		title: __( 'Capability catalog', 'elementor' ),
		description: __( 'Lists everything agents can use on this site, so they find it in one fetch.', 'elementor' ),
		slugs: [ 'agent.json' ],
	},
	{
		id: 'api-catalog',
		title: __( 'API catalog', 'elementor' ),
		description: __( 'Names this site’s REST API and feed for automated discovery', 'elementor' ),
		slugs: [ 'api-catalog' ],
	},
	{
		id: 'sign-in',
		title: __( 'Sign-in guide for agents and OAuth discovery', 'elementor' ),
		description: __( 'Explains how an agent can sign in and shares the standard sign-in details agents need.', 'elementor' ),
		slugs: [ 'auth.md', 'oauth-protected-resource', 'oauth-authorization-server' ],
	},
	{
		id: 'agent-skills',
		title: __( 'Agent skills', 'elementor' ),
		description: __( 'Lists the actions this site lets agents perform.', 'elementor' ),
		slugs: [ 'agent-skills' ],
	},
];

export const getIncludedFeatures = ( files ) => {
	const availableSlugs = new Set( files.map( ( file ) => file.slug ) );

	return getAgentDiscoveryFeatures().filter(
		( feature ) => feature.slugs.some( ( slug ) => availableSlugs.has( slug ) ),
	);
};
