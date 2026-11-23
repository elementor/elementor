import * as React from 'react';
import { AtomIcon, WidgetsIcon } from '@elementor/icons';
import { Box, ToggleButton, ToggleButtonGroup } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ElementsPanelSelection, setElementsPanelSelection } from '../elements-panel-selection';
import { useIsDragging } from '../hooks/use-is-dragging';

export type ElementsPanelSwitcherProps = {
	value: ElementsPanelSelection;
	isBlocked: boolean;
	open: () => Promise< void >;
	close: () => Promise< void >;
};

const ICON_SIZE = 16;

export function ElementsPanelSwitcher( { value, isBlocked, open, close }: ElementsPanelSwitcherProps ) {
	const isDragging = useIsDragging();

	const onChange = async ( _: React.MouseEvent, next: ElementsPanelSelection | null ) => {
		if ( ! next || next === value || isDragging || isBlocked ) {
			return;
		}

		setElementsPanelSelection( next );

		await ( next === 'atomic' ? open() : close() );
	};

	return (
		<ToggleButtonGroup
			exclusive
			value={ value }
			onChange={ onChange }
			disabled={ isDragging }
			aria-label={ __( 'Elements panel', 'elementor' ) }
			sx={ {
				p: '3px',
				gap: 0,
				borderRadius: 1,
				backgroundColor: 'action.selected',
				'& .MuiToggleButtonGroup-grouped': {
					m: 0,
					border: 0,
					height: 24,
					px: 1,
					gap: 0.5,
					borderRadius: 1,
					textTransform: 'none',
					color: 'text.primary',
					'&.Mui-selected, &.Mui-selected:hover': {
						backgroundColor: 'common.white',
						boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
					},
					'&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
				},
			} }
		>
			<ToggleButton value="atomic" aria-label={ __( 'Atomic elements panel', 'elementor' ) }>
				<AtomIcon sx={ { fontSize: ICON_SIZE } } />
				{ value === 'atomic' && <Label>{ __( 'Atomic', 'elementor' ) }</Label> }
			</ToggleButton>
			<ToggleButton value="non_atomic" aria-label={ __( 'Legacy elements panel', 'elementor' ) }>
				<WidgetsIcon sx={ { fontSize: ICON_SIZE } } />
				{ value === 'non_atomic' && <Label>{ __( 'Legacy', 'elementor' ) }</Label> }
			</ToggleButton>
		</ToggleButtonGroup>
	);
}

function Label( { children }: React.PropsWithChildren ) {
	return (
		<Box component="span" sx={ { fontSize: 13, fontWeight: 500, lineHeight: '18px' } }>
			{ children }
		</Box>
	);
}
