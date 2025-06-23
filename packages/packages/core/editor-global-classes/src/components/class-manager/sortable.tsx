import * as React from 'react';
import { GripVerticalIcon } from '@elementor/icons';
import {
	Box,
	styled,
	UnstableSortableItem,
	type UnstableSortableItemProps,
	type UnstableSortableItemRenderProps,
	UnstableSortableProvider,
	type UnstableSortableProviderProps,
} from '@elementor/ui';

export const SortableProvider = < T extends string >( props: UnstableSortableProviderProps< T > ) => (
	<UnstableSortableProvider restrictAxis variant="static" dragPlaceholderStyle={ { opacity: '1' } } { ...props } />
);

export type SortableTriggerProps = React.HTMLAttributes< HTMLDivElement >;

export const SortableTrigger = ( props: SortableTriggerProps ) => (
	<StyledSortableTrigger { ...props } role="button" className="class-item-sortable-trigger">
		<GripVerticalIcon fontSize="tiny" />
	</StyledSortableTrigger>
);

type SortableItemProps = {
	id: UnstableSortableItemProps[ 'id' ];
	children: ( props: Partial< UnstableSortableItemRenderProps > ) => React.ReactNode;
};

export const SortableItem = ( { children, id, ...props }: SortableItemProps ) => {
	return (
		<UnstableSortableItem
			{ ...props }
			id={ id }
			render={ ( {
				itemProps,
				isDragged,
				triggerProps,
				itemStyle,
				triggerStyle,
				dropIndicationStyle,
				showDropIndication,
				isDragOverlay,
				isDragPlaceholder,
			}: UnstableSortableItemRenderProps ) => {
				return (
					<Box
						{ ...itemProps }
						style={ itemStyle }
						component={ 'li' }
						role="listitem"
						sx={ {
							backgroundColor: isDragOverlay ? 'background.paper' : undefined,
						} }
					>
						{ children( {
							itemProps,
							isDragged,
							triggerProps,
							itemStyle,
							triggerStyle,
							isDragPlaceholder,
						} ) }
						{ showDropIndication && <SortableItemIndicator style={ dropIndicationStyle } /> }
					</Box>
				);
			} }
		/>
	);
};

const StyledSortableTrigger = styled( 'div' )( ( { theme } ) => ( {
	position: 'absolute',
	left: 0,
	top: '50%',
	transform: `translate( -${ theme.spacing( 1.5 ) }, -50% )`,
	color: theme.palette.action.active,
} ) );

const SortableItemIndicator = styled( Box )`
	width: 100%;
	height: 1px;
	background-color: ${ ( { theme } ) => theme.palette.text.primary };
`;
