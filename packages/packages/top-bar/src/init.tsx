import { injectIntoTop, useEnvOptions } from '@elementor/editor';
import TopBar from './components/top-bar';
import { registerLink } from './';
import { __ } from '@wordpress/i18n';
import { WordpressIcon } from './icons';

injectIntoTop( {
	name: 'top-bar',
	filler: TopBar,
} );

registerLink( 'main', {
	name: 'manage-website',
	group: 'exits',
	useProps: () => {
		const { urls } = useEnvOptions();

		return {
			title: __( 'Manage Website', 'elementor' ),
			href: urls.exit,
			icon: WordpressIcon,
			target: '_blank',
		};
	},
} );
