import * as React from 'react';
import { GripVerticalIcon } from '@elementor/icons';
import {
	Divider,
	List,
	ListItem,
	styled,
	UnstableSortableItem,
	type UnstableSortableItemProps,
	type UnstableSortableItemRenderProps,
	UnstableSortableProvider,
	type UnstableSortableProviderProps,
} from '@elementor/ui';

export const SortableProvider = < T extends number >( props: UnstableSortableProviderProps< T > ) => {
	return (
		<List sx={ { p: 0, my: -0.5, mx: 0 } }>
			<UnstableSortableProvider restrictAxis disableDragOverlay={ false } variant={ 'static' } { ...props } />
		</List>
	);
};

type SortableItemProps = {
	id: UnstableSortableItemProps[ 'id' ];
	children: React.ReactNode;
	disabled?: boolean;
};

export const SortableItem = ( { id, children, disabled }: SortableItemProps ): React.ReactNode => {
	return (
		<UnstableSortableItem
			id={ id }
			disabled={ disabled }
			render={ ( {
				itemProps,
				triggerProps,
				itemStyle,
				triggerStyle,
				showDropIndication,
				dropIndicationStyle,
			}: UnstableSortableItemRenderProps ) => {
				return (
					<StyledListItem { ...itemProps } style={ itemStyle }>
						{ ! disabled && <SortableTrigger { ...triggerProps } style={ triggerStyle } /> }
						{ children }
						{ showDropIndication && <StyledDivider style={ dropIndicationStyle } /> }
					</StyledListItem>
				);
			} }
		/>
	);
};

const StyledListItem = styled( ListItem )`
	position: relative;
	margin-inline: 0px;
	padding-inline: 0px;
	padding-block: ${ ( { theme } ) => theme.spacing( 0.5 ) };

	& .class-item-sortable-trigger {
		color: ${ ( { theme } ) => theme.palette.action.active };
		height: 100%;
		display: flex;
		align-items: center;
		visibility: hidden;
		position: absolute;
		top: 50%;
		padding-inline-end: ${ ( { theme } ) => theme.spacing( 0.5 ) };
		transform: translate( -75%, -50% );
	}

	&[aria-describedby=''] > .MuiTag-root {
		background-color: ${ ( { theme } ) => theme.palette.background.paper };
		box-shadow: ${ ( { theme } ) => theme.shadows[ 3 ] };
	}

	&:hover {
		& .class-item-sortable-trigger {
			visibility: visible;
		}
	}
`;

const SortableTrigger = ( props: React.HTMLAttributes< HTMLDivElement > ) => (
	<div { ...props } role="button" className="class-item-sortable-trigger">
		<GripVerticalIcon fontSize="tiny" />
	</div>
);

const StyledDivider = styled( Divider )`
	height: 0px;
	border: none;
	overflow: visible;

	&:after {
		--height: 2px;
		content: '';
		display: block;
		width: 100%;
		height: var( --height );
		margin-block: calc( -1 * var( --height ) / 2 );
		border-radius: ${ ( { theme } ) => theme.spacing( 0.5 ) };
		background-color: ${ ( { theme } ) => theme.palette.text.primary };
	}
`;
