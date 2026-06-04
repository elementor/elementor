import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { __useSelector as useSelector } from '@elementor/store';
import { Box, IconButton, Stack, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFloatingPanelActions } from '../../hooks/use-floating-panel-actions';
import { type GlobalState, selectPanelState } from '../../store/selectors';
import { type FloatingPanelHeaderAction } from '../../types';
import DragHandle from '../internal/drag-handle';

const PANEL_Z_INDEX_BASE = 1000;

type Props = {
	panelId: string;
	title: string;
	icon?: React.ComponentType;
	actions?: FloatingPanelHeaderAction[];
};

function HeaderAction( {
	panelId,
	icon: Icon,
	label,
	onClick,
	disabled = false,
}: FloatingPanelHeaderAction & { panelId: string } ) {
	const panelZIndex = useSelector( ( state: GlobalState ) => selectPanelState( state, panelId )?.zIndex ?? 0 );
	const tooltipZIndex = PANEL_Z_INDEX_BASE + panelZIndex + 1;

	return (
		<Tooltip
			title={ label }
			placement="top"
			PopperProps={ {
				sx: { zIndex: tooltipZIndex },
			} }
		>
			<Box component="span" aria-label={ undefined }>
				<IconButton
					size="small"
					color="inherit"
					aria-label={ label }
					disabled={ disabled }
					onClick={ disabled ? undefined : onClick }
					sx={ { borderRadius: 0, p: 1 } }
				>
					<Icon fontSize="small" />
				</IconButton>
			</Box>
		</Tooltip>
	);
}

export default function FloatingPanelHeader( { panelId, title, icon: Icon, actions }: Props ) {
	const { close } = useFloatingPanelActions( panelId );
	const hasActions = Boolean( actions?.length );

	return (
		<Box
			sx={ {
				display: 'flex',
				alignItems: 'stretch',
				borderBottom: 1,
				borderColor: 'var(--e-a-border-color)',
				overflow: 'visible',
			} }
		>
			{ hasActions ? (
				<Stack direction="row" alignItems="center" sx={ { flexShrink: 0, overflow: 'visible' } }>
					{ actions?.map( ( action ) => (
						<HeaderAction key={ action.id } panelId={ panelId } { ...action } />
					) ) }
				</Stack>
			) : null }
			<DragHandle panelId={ panelId }>
				<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%' } }>
					{ Icon ? <Icon /> : null }
					<Typography component="h2" sx={ { textAlign: 'center', fontSize: '13px', fontWeight: 400 } }>
						{ title }
					</Typography>
				</Box>
			</DragHandle>
			<IconButton
				size="small"
				color="inherit"
				aria-label={ __( 'Close panel', 'elementor' ) }
				onClick={ close }
				sx={ { borderRadius: 0, p: 1 } }
			>
				<XIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
