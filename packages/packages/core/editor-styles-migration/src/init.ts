import { utilitiesMenu } from '@elementor/editor-app-bar';
import { __useActiveDocument } from '@elementor/editor-documents';
import { AIIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

export function init() {
	utilitiesMenu.registerAction( {
		id: 'styles-migration-button',
		priority: 10,
		useProps: useStylesMigration,
	} );
}

function useStylesMigration() {
	const document = __useActiveDocument();

	return {
		icon: AIIcon,
		title: __( 'Styles Migration', 'elementor' ),
		onClick: () => {
			console.log( '** Styles Migration clicked', {
				document,
			} );
		},
	};
}
