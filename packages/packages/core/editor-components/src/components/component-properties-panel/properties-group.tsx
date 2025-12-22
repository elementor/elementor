import * as React from 'react';
import { DotsVerticalIcon } from '@elementor/icons';
import { Box, IconButton, List, Stack, Typography } from '@elementor/ui';

import { type OverridableProp, type OverridablePropsGroup } from '../../types';
import { PropertyItem } from './property-item';
import { SortableItem, SortableProvider, SortableTrigger, type SortableTriggerProps } from './sortable';

type Props = {
	group: OverridablePropsGroup;
	props: Record< string, OverridableProp >;
	allGroups: { value: string; label: string }[];
	sortableTriggerProps: SortableTriggerProps;
	isDragPlaceholder?: boolean;
	onPropsReorder: ( newOrder: string[] ) => void;
	onPropertyDelete: ( propKey: string ) => void;
	onPropertyUpdate: ( propKey: string, data: { label: string; group: string | null } ) => void;
};

export function PropertiesGroup( {
	group,
	props,
	allGroups,
	sortableTriggerProps,
	isDragPlaceholder,
	onPropsReorder,
	onPropertyDelete,
	onPropertyUpdate,
}: Props ) {
	const groupProps = group.props
		.map( ( propId ) => props[ propId ] )
		.filter( ( prop ): prop is OverridableProp => Boolean( prop ) );

	return (
		<Box
			sx={ {
				position: 'relative',
				opacity: isDragPlaceholder ? 0.5 : 1,
				'&:hover .sortable-trigger': {
					visibility: 'visible',
				},
				'& .sortable-trigger': {
					visibility: 'hidden',
				},
				'&:hover .group-menu': {
					visibility: 'visible',
				},
				'& .group-menu': {
					visibility: 'hidden',
				},
			} }
		>
			<SortableTrigger { ...sortableTriggerProps } />
			<Stack gap={ 1 }>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Typography variant="caption" sx={ { color: 'text.primary', fontWeight: 400, lineHeight: 1.66 } }>
						{ group.label }
					</Typography>
					<IconButton className="group-menu" size="tiny" sx={ { p: 0.25 } }>
						<DotsVerticalIcon fontSize="tiny" />
					</IconButton>
				</Stack>
				<List sx={ { p: 0, display: 'flex', flexDirection: 'column', gap: 1 } }>
					<SortableProvider value={ group.props } onChange={ onPropsReorder }>
						{ groupProps.map( ( prop ) => (
							<SortableItem key={ prop.overrideKey } id={ prop.overrideKey }>
								{ ( { triggerProps, triggerStyle, isDragPlaceholder: isItemDragPlaceholder } ) => (
									<PropertyItem
										prop={ prop }
										sortableTriggerProps={ { ...triggerProps, style: triggerStyle } }
										isDragPlaceholder={ isItemDragPlaceholder }
										groups={ allGroups }
										onDelete={ onPropertyDelete }
										onUpdate={ ( data ) => onPropertyUpdate( prop.overrideKey, data ) }
									/>
								) }
							</SortableItem>
						) ) }
					</SortableProvider>
				</List>
			</Stack>
		</Box>
	);
}
