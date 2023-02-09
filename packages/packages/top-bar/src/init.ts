import { registerLink } from './';
import { __ } from '@wordpress/i18n';
import { WordpressIcon } from './icons';
import TopBar from './components/top-bar';
import { injectIntoTop, useSettings } from '@elementor/editor';

injectIntoTop( {
	name: 'top-bar',
	filler: TopBar,
} );

registerLink( 'main', {
	name: 'manage-website',
	group: 'exits',
	useProps: () => {
		const { urls } = useSettings();

		return {
			title: __( 'Manage Website', 'elementor' ),
			href: urls.dashboard,
			icon: WordpressIcon,
			target: '_blank',
		};
	},
} );
