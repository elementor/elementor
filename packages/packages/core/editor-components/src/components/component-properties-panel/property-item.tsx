import * as React from 'react';
import { getWidgetsCache } from '@elementor/editor-elements';
import { XIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, IconButton, Popover, Typography, usePopupState } from '@elementor/ui';

import { type OverridableProp } from '../../types';
import { OverridablePropForm } from '../overridable-props/overridable-prop-form';
import { SortableTrigger, type SortableTriggerProps } from './sortable';

type PropertyItemProps = {
	prop: OverridableProp;
	sortableTriggerProps: SortableTriggerProps;
	isDragPlaceholder?: boolean;
	groups: { value: string; label: string }[];
	onDelete: ( propKey: string ) => void;
	onUpdate: ( data: { label: string; group: string | null } ) => void;
};

export function PropertyItem( {
	prop,
	sortableTriggerProps,
	isDragPlaceholder,
	groups,
	onDelete,
	onUpdate,
}: PropertyItemProps ) {
	const popoverState = usePopupState( {
		variant: 'popover',
	} );
	const icon = getElementIcon( prop );
	const popoverProps = bindPopover( popoverState );

	const handleSubmit = ( data: { label: string; group: string | null } ) => {
		onUpdate( data );
		popoverState.close();
	};

	const handleDelete = ( event: React.MouseEvent ) => {
		event.stopPropagation();
		onDelete( prop.overrideKey );
	};

	return (
		<>
			<Box
				{ ...bindTrigger( popoverState ) }
				sx={ {
					position: 'relative',
					pl: 0.5,
					pr: 1,
					py: 0.25,
					minHeight: 28,
					borderRadius: 1,
					border: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					opacity: isDragPlaceholder ? 0.5 : 1,
					cursor: 'pointer',
					'&:hover': {
						backgroundColor: 'action.hover',
					},
					'&:hover .sortable-trigger': {
						visibility: 'visible',
					},
					'& .sortable-trigger': {
						visibility: 'hidden',
					},
					'&:hover .delete-button': {
						visibility: 'visible',
					},
					'& .delete-button': {
						visibility: 'hidden',
					},
				} }
			>
				<SortableTrigger { ...sortableTriggerProps } />
				<Box
					sx={ { display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: 12, padding: 0.25 } }
				>
					<i className={ icon } />
				</Box>
				<Typography variant="caption" sx={ { color: 'text.primary', flexGrow: 1, fontSize: 10 } }>
					{ prop.label }
				</Typography>
				<IconButton size="tiny" onClick={ handleDelete } aria-label="Delete property" sx={ { p: 0.25 } }>
					<XIcon fontSize="tiny" />
				</IconButton>
			</Box>

			<Popover
				{ ...popoverProps }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
				transformOrigin={ { vertical: 'top', horizontal: 'left' } }
				PaperProps={ { sx: { width: popoverState.anchorEl?.getBoundingClientRect().width } } }
			>
				<OverridablePropForm
					onSubmit={ handleSubmit }
					currentValue={ prop }
					groups={ groups }
					sx={ { width: '100%' } }
				/>
			</Popover>
		</>
	);
}

function getElementIcon( prop: OverridableProp ): string {
	const elType = prop.elType === 'widget' ? prop.widgetType : prop.elType;

	const widgetsCache = getWidgetsCache();

	if ( ! widgetsCache ) {
		return 'eicon-apps';
	}

	const widgetConfig = widgetsCache[ elType ];

	return widgetConfig?.icon || 'eicon-apps';
}
