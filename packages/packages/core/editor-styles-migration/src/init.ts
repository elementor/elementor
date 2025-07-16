import { injectIntoTop } from '@elementor/editor';
import { utilitiesMenu } from '@elementor/editor-app-bar';
import { __registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { apiClient } from './api';
import { slice, StepsDialog, useDialog } from './components/steps-dialog';
import { Icon } from './ui/icon';

export function init() {
	__registerSlice( slice );

	injectIntoTop( {
		id: 'styles-migration',
		component: StepsDialog,
	} );

	utilitiesMenu.registerAction( {
		id: 'styles-migration-button',
		priority: 10,
		useProps: useStylesMigration,
	} );
}

function useStylesMigration() {
	const { setOpen } = useDialog();

	return {
		icon: Icon,
		title: __( 'Styles Migration', 'elementor' ),
		onClick: () => {
			setOpen( true );

			apiClient.colors().then( ( response ) => {
				console.log( '** Styles Migration colors response', response );
			} );

			apiClient.posts().then( ( response ) => {
				console.log( '** Styles Migration posts response', response );
			} );
		},
	};
}
