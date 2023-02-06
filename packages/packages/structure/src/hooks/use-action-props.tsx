import * as React from 'react';
import StructureIcon from '../icons/structure-icon';
import { __ } from '@wordpress/i18n';
import { runCommand, useIsRouteActive } from '@elementor/v1-adapters';

export default function useActionProps() {
	const selected = useIsRouteActive( 'navigator' );

	return {
		title: __( 'Add element', 'elementor' ),
		icon: () => <StructureIcon />,
		onClick: () => runCommand( 'navigator/toggle' ),
		selected,
	};
}
