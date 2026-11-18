import * as React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ElementsPanelSelection, setElementsPanelSelection } from '../elements-panel-selection';
import { useIsDragging } from '../hooks/use-is-dragging';
import { usePanelActions } from '../panel';

type Props = {
	value: ElementsPanelSelection;
};

export function ElementsPanelSwitcher( { value }: Props ) {
	const isDragging = useIsDragging();
	const { open, close } = usePanelActions();

	const onChange = async ( _: React.MouseEvent, next: ElementsPanelSelection | null ) => {
		if ( ! next || next === value || isDragging ) {
			return;
		}

		setElementsPanelSelection( next );

		await ( next === 'atomic' ? open() : close() );
	};

	return (
		<ToggleButtonGroup
			exclusive
			fullWidth
			size="tiny"
			value={ value }
			onChange={ onChange }
			disabled={ isDragging }
			aria-label={ __( 'Elements panel', 'elementor' ) }
			sx={ { px: 2, py: 1 } }
		>
			<ToggleButton value="atomic">{ __( 'Atomic', 'elementor' ) }</ToggleButton>
			<ToggleButton value="non_atomic">{ __( 'Existing', 'elementor' ) }</ToggleButton>
		</ToggleButtonGroup>
	);
}
