import { registerLink } from './locations';
import { __ } from '@wordpress/i18n';
import { WordpressIcon } from '@elementor/icons';
import TopBar from './components/top-bar';
import { injectIntoTop, useSettings } from '@elementor/editor';

export default function init() {
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
				href: urls.admin,
				icon: WordpressIcon,
				target: '_blank',
			};
		},
	} );
}
