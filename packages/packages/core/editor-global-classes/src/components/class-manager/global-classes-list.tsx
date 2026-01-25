import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';
import { __useDispatch as useDispatch } from '@elementor/store';
import { List, Stack, styled, Typography, type TypographyProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useClassesOrder } from '../../hooks/use-classes-order';
import { useFilters } from '../../hooks/use-filters';
import { useOrderedClasses } from '../../hooks/use-ordered-classes';
import { slice } from '../../store';
import { trackGlobalClasses } from '../../utils/tracking';
import { useSearchAndFilters } from '../search-and-filter/context';
import { ClassItem } from './class-item';
import { DeleteConfirmationProvider } from './delete-confirmation-dialog';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';
import { getNotFoundType, NotFound } from './not-found';
import { SortableItem, SortableProvider } from './sortable';

type GlobalClassesListProps = {
	disabled?: boolean;
};

export const GlobalClassesList = ( { disabled }: GlobalClassesListProps ) => {
	const {
		search: { debouncedValue: searchValue },
	} = useSearchAndFilters();
	const cssClasses = useOrderedClasses();
	const dispatch = useDispatch();
	const filters = useFilters();
	const [ draggedItemId, setDraggedItemId ] = React.useState< StyleDefinitionID | null >( null );
	const draggedItemLabel = cssClasses.find( ( cssClass ) => cssClass.id === draggedItemId )?.label ?? '';
	const [ classesOrder, reorderClasses ] = useReorder( draggedItemId, setDraggedItemId, draggedItemLabel ?? '' );
	const filteredCssClasses = useFilteredCssClasses();

	useEffect( () => {
		const handler = ( event: KeyboardEvent ) => {
			if ( event.key === 'z' && ( event.ctrlKey || event.metaKey ) ) {
				event.stopImmediatePropagation();
				event.preventDefault();
				if ( event.shiftKey ) {
					dispatch( slice.actions.redo() );
					return;
				}
				dispatch( slice.actions.undo() );
			}
		};
		window.addEventListener( 'keydown', handler, {
			capture: true,
		} );
		return () => window.removeEventListener( 'keydown', handler );
	}, [ dispatch ] );

	if ( ! cssClasses?.length ) {
		return <EmptyState />;
	}

	const notFoundType = getNotFoundType( searchValue, filters, filteredCssClasses );

	if ( notFoundType ) {
		return <NotFound notFoundType={ notFoundType } />;
	}

	const isFiltersApplied = filters?.length || searchValue;

	const allowSorting = filteredCssClasses.length > 1 && ! isFiltersApplied;

	return (
		<DeleteConfirmationProvider>
			<List sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
				<SortableProvider
					value={ classesOrder }
					onChange={ reorderClasses }
					disableDragOverlay={ ! allowSorting }
				>
					{ filteredCssClasses?.map( ( { id, label } ) => (
						<SortableItem key={ id } id={ id }>
							{ ( { isDragged, isDragPlaceholder, triggerProps, triggerStyle } ) => {
								if ( isDragged && ! draggedItemId ) {
									setDraggedItemId( id );
								}
								return (
									<ClassItem
										id={ id }
										label={ label }
										renameClass={ ( newLabel: string ) => {
											trackGlobalClasses( {
												event: 'classRenamed',
												classId: id,
												oldValue: label,
												newValue: newLabel,
												source: 'class-manager',
											} );
											dispatch(
												slice.actions.update( {
													style: {
														id,
														label: newLabel,
													},
												} )
											);
										} }
										selected={ isDragged }
										disabled={ disabled || isDragPlaceholder }
										sortableTriggerProps={ {
											...triggerProps,
											style: triggerStyle,
										} }
										showSortIndicator={ allowSorting }
									/>
								);
							} }
						</SortableItem>
					) ) }
				</SortableProvider>
			</List>
		</DeleteConfirmationProvider>
	);
};

const EmptyState = () => (
	<Stack alignItems="center" gap={ 1.5 } pt={ 10 } px={ 0.5 } maxWidth="260px" margin="auto">
		<FlippedColorSwatchIcon fontSize="large" />
		<StyledHeader variant="subtitle2" component="h2" color="text.secondary">
			{ __( 'There are no global classes yet.', 'elementor' ) }
		</StyledHeader>
		<Typography align="center" variant="caption" color="text.secondary">
			{ __(
				'CSS classes created in the editor panel will appear here. Once they are available, you can arrange their hierarchy, rename them, or delete them as needed.',
				'elementor'
			) }
		</Typography>
	</Stack>
);

// Override panel reset styles.
const StyledHeader = styled( Typography )< TypographyProps >( ( { theme, variant } ) => ( {
	'&.MuiTypography-root': {
		...( theme.typography[ variant as keyof typeof theme.typography ] as React.CSSProperties ),
	},
} ) );

const useReorder = (
	draggedItemId: StyleDefinitionID | null,
	setDraggedItemId: React.Dispatch< React.SetStateAction< StyleDefinitionID | null > >,
	draggedItemLabel: string
) => {
	const dispatch = useDispatch();
	const order = useClassesOrder();

	const reorder = ( newIds: StyleDefinitionID[] ) => {
		dispatch( slice.actions.setOrder( newIds ) );

		if ( draggedItemId ) {
			trackGlobalClasses( {
				event: 'classManagerReorder',
				classId: draggedItemId,
				classTitle: draggedItemLabel,
			} );
			setDraggedItemId( null ); // Reset after tracking
		}
	};

	return [ order, reorder ] as const;
};

const useFilteredCssClasses = (): StyleDefinition[] => {
	const cssClasses = useOrderedClasses();
	const {
		search: { debouncedValue: searchValue },
	} = useSearchAndFilters();
	const filters = useFilters();

	const lowercaseLabels = useMemo(
		() =>
			cssClasses.map( ( cssClass ) => ( {
				...cssClass,
				lowerLabel: cssClass.label.toLowerCase(),
			} ) ),
		[ cssClasses ]
	);

	const filteredClasses = useMemo( () => {
		if ( searchValue.length > 1 ) {
			return lowercaseLabels.filter( ( cssClass ) => cssClass.lowerLabel.includes( searchValue.toLowerCase() ) );
		}
		return cssClasses;
	}, [ searchValue, cssClasses, lowercaseLabels ] );

	return useMemo( () => {
		if ( filters && filters.length > 0 ) {
			return filteredClasses.filter( ( cssClass ) => filters.includes( cssClass.id ) );
		}
		return filteredClasses;
	}, [ filteredClasses, filters ] );
};
