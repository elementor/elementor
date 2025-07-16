import { injectIntoTop } from '@elementor/editor';
import { utilitiesMenu } from '@elementor/editor-app-bar';
import { Icon } from './ui/icon';
import { __registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { slice, StepsDialog, useDialog } from './components/steps-dialog';
import { apiClient } from './api';

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
	const { setOpen, open } = useDialog();

	return {
		icon: Icon,
		title: __( 'Styles Migration', 'elementor' ),
		onClick: () => {
			setOpen( true );

			console.log( '** Styles Migration clicked', {
				document,
			} );

			apiClient.all().then( ( response ) => {
				console.log( '** Styles Migration response', response );
			} );
		},
	};
}
