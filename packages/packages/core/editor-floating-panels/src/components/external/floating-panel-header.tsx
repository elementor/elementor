import * as React from 'react';
import { type ComponentType } from 'react';
import { XIcon } from '@elementor/icons';
import { __useSelector as useSelector } from '@elementor/store';
import { Box, Chip, IconButton, Stack, Tooltip, Typography, type TypographyProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFloatingPanelActions } from '../../hooks/use-floating-panel-actions';
import { useFloatingPanelZIndex } from '../../hooks/use-floating-panel-z-index';
import { type GlobalState, selectIsDraggable } from '../../store/selectors';
import { type FloatingPanelHeaderAction } from '../../types';
import DragHandle from '../internal/drag-handle';

type Props = {
	panelId: string;
	title: string;
	icon?: ComponentType;
	actions?: FloatingPanelHeaderAction[];
	badge?: string;
	titleVariant?: TypographyProps[ 'variant' ];
};

function HeaderAction( {
	icon: Icon,
	label,
	onClick,
	panelZIndex,
	disabled = false,
}: FloatingPanelHeaderAction & { panelZIndex: number } ) {
	return (
		<Tooltip
			title={ label }
			placement="top"
			PopperProps={ {
				sx: { zIndex: panelZIndex },
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
					<Icon />
				</IconButton>
			</Box>
		</Tooltip>
	);
}

export default function FloatingPanelHeader( { panelId, title, icon: Icon, actions, badge, titleVariant }: Props ) {
	const { close } = useFloatingPanelActions( panelId );
	const isDraggable = useSelector( ( state: GlobalState ) => selectIsDraggable( state, panelId ) );
	const hasActions = Boolean( actions?.length );
	const panelZIndex = useFloatingPanelZIndex( panelId );

	const hasBadge = Boolean( badge );

	const titleContent = (
		<Box
			sx={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: hasBadge ? 'flex-start' : 'center',
				gap: 1,
				height: '100%',
				pl: hasBadge ? 1 : 0,
			} }
		>
			{ Icon ? <Icon /> : null }
			<Typography
				component="h2"
				variant={ titleVariant }
				sx={ {
					textAlign: hasBadge ? 'left' : 'center',
					...( ! titleVariant && { fontSize: '13px', fontWeight: 400 } ),
				} }
			>
				{ title }
			</Typography>
			{ badge ? <Chip label={ badge } size="tiny" variant="standard" /> : null }
		</Box>
	);

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
						<HeaderAction key={ action.id } panelZIndex={ panelZIndex } { ...action } />
					) ) }
				</Stack>
			) : null }
			{ isDraggable ? (
				<DragHandle panelId={ panelId }>{ titleContent }</DragHandle>
			) : (
				<Box sx={ { flex: 1 } }>{ titleContent }</Box>
			) }
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
