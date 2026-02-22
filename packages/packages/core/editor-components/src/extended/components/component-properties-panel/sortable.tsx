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

export type SortableTriggerProps = React.HTMLAttributes< HTMLDivElement > & {
	triggerClassName?: string;
};

export const SortableTrigger = ( { triggerClassName, ...props }: SortableTriggerProps ) => (
	<StyledSortableTrigger
		{ ...props }
		role="button"
		className={ `sortable-trigger ${ triggerClassName ?? '' }`.trim() }
		aria-label="sort"
	>
		<GripVerticalIcon fontSize="tiny" />
	</StyledSortableTrigger>
);

type SortableItemProps = {
	id: UnstableSortableItemProps[ 'id' ];
	children: ( props: SortableItemRenderData ) => React.ReactNode;
};

export type SortableItemRenderData = {
	isDragged: boolean;
	isDragPlaceholder: boolean;
	triggerProps: React.HTMLAttributes< HTMLElement >;
	triggerStyle: React.CSSProperties;
};

export const SortableItem = ( { children, id }: SortableItemProps ) => (
	<UnstableSortableItem
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
		}: UnstableSortableItemRenderProps ) => (
			<Box
				{ ...itemProps }
				style={ itemStyle }
				component="div"
				role="listitem"
				sx={ {
					backgroundColor: isDragOverlay ? 'background.paper' : undefined,
				} }
			>
				{ children( {
					isDragged,
					isDragPlaceholder,
					triggerProps,
					triggerStyle,
				} ) }
				{ showDropIndication && <SortableItemIndicator style={ dropIndicationStyle } /> }
			</Box>
		) }
	/>
);

const StyledSortableTrigger = styled( 'div' )( ( { theme } ) => ( {
	position: 'absolute',
	left: '-2px',
	top: '50%',
	transform: `translate( -${ theme.spacing( 1.5 ) }, -50% )`,
	color: theme.palette.action.active,
	cursor: 'grab',
} ) );

const SortableItemIndicator = styled( Box )`
	width: 100%;
	height: 1px;
	background-color: ${ ( { theme } ) => theme.palette.text.primary };
`;
