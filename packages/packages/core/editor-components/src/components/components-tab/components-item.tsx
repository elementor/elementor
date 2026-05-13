import * as React from 'react';
import { forwardRef } from 'react';
import { EditableField, EllipsisWithTooltip } from '@elementor/editor-ui';
import { ComponentsIcon } from '@elementor/icons';
import { Box, ListItemButton, ListItemIcon, styled, type Theme, Typography } from '@elementor/ui';

import { type Component } from '../../types';

export type ComponentItemProps = {
	component: Omit< Component, 'id' > & { id?: number };
	disabled?: boolean;
	draggable?: boolean;
	onDragStart?: React.DragEventHandler;
	onDragEnd?: React.DragEventHandler;
	onClick?: () => void;
	isEditing?: boolean;
	error?: string | null;
	nameSlot?: React.ReactNode;
	endSlot?: React.ReactNode;
};

export const ComponentItem = forwardRef< HTMLElement, ComponentItemProps >(
	(
		{
			component,
			disabled = true,
			draggable,
			onDragStart,
			onDragEnd,
			onClick,
			isEditing = false,
			error = null,
			nameSlot,
			endSlot,
			...props
		},
		ref
	) => {
		return (
			<ListItemButton
				disabled={ disabled }
				draggable={ draggable }
				onDragStart={ onDragStart }
				onDragEnd={ onDragEnd }
				shape="rounded"
				ref={ ref }
				sx={ {
					border: 'solid 1px',
					borderColor: 'divider',
					py: 0.5,
					px: 1,
					display: 'flex',
					width: '100%',
					alignItems: 'center',
					gap: 1,
				} }
				{ ...props }
			>
				<Box display="flex" alignItems="center" gap={ 1 } minWidth={ 0 } flexGrow={ 1 } onClick={ onClick }>
					<ListItemIcon size="tiny">
						<ComponentsIcon fontSize="tiny" />
					</ListItemIcon>
					<Indicator isActive={ isEditing } isError={ !! error }>
						<Box display="flex" flex={ 1 } minWidth={ 0 } flexGrow={ 1 }>
							{ nameSlot ?? <ComponentName name={ component.name } /> }
						</Box>
					</Indicator>
				</Box>
				{ endSlot }
			</ListItemButton>
		);
	}
);

const Indicator = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'isActive' && prop !== 'isError',
} )( ( { theme, isActive, isError }: { theme: Theme; isActive: boolean; isError: boolean } ) => ( {
	display: 'flex',
	width: '100%',
	flexGrow: 1,
	borderRadius: theme.spacing( 0.5 ),
	border: getIndicatorBorder( { isActive, isError, theme } ),
	padding: `0 ${ theme.spacing( 1 ) }`,
	marginLeft: isActive ? theme.spacing( 1 ) : 0,
	minWidth: 0,
} ) );

const getIndicatorBorder = ( { isActive, isError, theme }: { isActive: boolean; isError: boolean; theme: Theme } ) => {
	if ( isError ) {
		return `2px solid ${ theme.palette.error.main }`;
	}

	if ( isActive ) {
		return `2px solid ${ theme.palette.secondary.main }`;
	}

	return 'none';
};

type EditableConfig = {
	ref: React.Ref< HTMLElement >;
	isEditing: boolean;
	getProps: () => Record< string, unknown >;
};

export type ComponentNameProps = {
	name: string;
	editable?: EditableConfig;
};

export function ComponentName( { name, editable }: ComponentNameProps ) {
	if ( editable?.isEditing ) {
		return <EditableField ref={ editable.ref } as={ Typography } variant="caption" { ...editable.getProps() } />;
	}

	return <EllipsisWithTooltip title={ name } as={ Typography } variant="caption" color="text.primary" />;
}
