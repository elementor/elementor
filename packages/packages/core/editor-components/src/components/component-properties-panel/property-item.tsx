import * as React from 'react';
import { useState } from 'react';
import { getWidgetsCache } from '@elementor/editor-elements';
import { XIcon } from '@elementor/icons';
import { Box, IconButton, Popover, Typography } from '@elementor/ui';

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
	const [ anchorEl, setAnchorEl ] = useState< HTMLElement | null >( null );
	const [ popoverWidth, setPopoverWidth ] = useState< number | undefined >();
	const elementType = prop.elType === 'widget' ? prop.widgetType : prop.elType;
	const icon = getElementIcon( elementType );

	const handleClick = ( event: React.MouseEvent< HTMLElement > ) => {
		const target = event.currentTarget;
		setAnchorEl( target );
		setPopoverWidth( target.offsetWidth );
	};

	const handleClose = () => {
		setAnchorEl( null );
	};

	const handleSubmit = ( data: { label: string; group: string | null } ) => {
		onUpdate( data );
		handleClose();
	};

	const handleDelete = ( event: React.MouseEvent ) => {
		event.stopPropagation();
		onDelete( prop.overrideKey );
	};

	const isOpen = Boolean( anchorEl );

	return (
		<>
			<Box
				onClick={ handleClick }
				sx={ {
					position: 'relative',
					pl: 0.5,
					pr: 1,
					py: 0.25,
					minHeight: 28,
					borderRadius: 2,
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
				<Box sx={ { display: 'flex', alignItems: 'center', color: 'text.primary', fontSize: 16 } }>
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
				open={ isOpen }
				anchorEl={ anchorEl }
				onClose={ handleClose }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
				transformOrigin={ { vertical: 'top', horizontal: 'left' } }
				PaperProps={ { sx: { width: popoverWidth } } }
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

function getElementIcon( elType: string ): string {
	const widgetsCache = getWidgetsCache();

	if ( ! widgetsCache ) {
		return 'eicon-apps';
	}

	const widgetConfig = widgetsCache[ elType ];

	return widgetConfig?.icon || 'eicon-apps';
}
