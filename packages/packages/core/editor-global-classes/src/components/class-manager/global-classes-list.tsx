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
import { useFilterAndSortContext } from '../filter-and-sort/context';
import { useSearchContext } from '../search-css-class/context';
import { getNotFoundConfig, type NotFoundType } from '../shared/not-found/config';
import { ClassItem } from './class-item';
import { DeleteConfirmationProvider } from './delete-confirmation-dialog';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';
import { SortableItem, SortableProvider } from './sortable';

const getNotFoundType = (
	searchValue: string,
	filters: string[] | null | undefined,
	filteredClasses: StyleDefinition[]
): NotFoundType | undefined => {
	const searchNotFound = filteredClasses.length <= 0 && searchValue.length > 1;
	const filterNotFound = filters && filters.length === 0;
	const filterAndSearchNotFound = searchNotFound && filterNotFound;

	if ( filterAndSearchNotFound ) {
		return 'filterAndSearch';
	}
	if ( searchNotFound ) {
		return 'search';
	}
	if ( filterNotFound ) {
		return 'filter';
	}
	return undefined;
};

type GlobalClassesListProps = {
	disabled?: boolean;
};

export const GlobalClassesList = ( { disabled }: GlobalClassesListProps ) => {
	const { debouncedValue: searchValue, onClearSearch } = useSearchContext();
	const cssClasses = useOrderedClasses();
	const dispatch = useDispatch();
	const filters = useFilters();
	const { onReset } = useFilterAndSortContext();
	const [ classesOrder, reorderClasses ] = useReorder();

	const lowercaseLabels = useMemo(
		() =>
			cssClasses.map( ( cssClass ) => ( {
				...cssClass,
				lowerLabel: cssClass.label.toLowerCase(),
			} ) ),
		[ cssClasses ]
	);

	const filteredClasses = useMemo( () => {
		return searchValue.length > 1
			? lowercaseLabels.filter( ( cssClass ) =>
					cssClass.lowerLabel.toLowerCase().includes( searchValue.toLowerCase() )
			  )
			: cssClasses;
	}, [ searchValue, cssClasses, lowercaseLabels ] );

	const filteredByCategory = useMemo( () => {
		return filters ? filteredClasses.filter( ( cssClass ) => filters.includes( cssClass.id ) ) : filteredClasses;
	}, [ filteredClasses, filters ] );

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

	const shouldShowNotFound = getNotFoundConfig( {
		onClearFilter: onReset,
		onClearSearch,
		searchValue,
		notFoundType: getNotFoundType( searchValue, filters, filteredClasses ),
	} );

	if ( shouldShowNotFound !== null ) {
		return shouldShowNotFound;
	}
	return (
		<DeleteConfirmationProvider>
			<List sx={ { display: 'flex', flexDirection: 'column', gap: 0.5 } }>
				{ filters && (
					<Typography variant="subtitle2" color="text.primary">
						{ __( 'We found ${number} classes:', 'elementor' ).replace(
							'${number}',
							filters.length.toString()
						) }
					</Typography>
				) }
				<SortableProvider value={ classesOrder } onChange={ reorderClasses }>
					{ filteredByCategory?.map( ( { id, label } ) => {
						return (
							<SortableItem key={ id } id={ id }>
								{ ( { isDragged, isDragPlaceholder, triggerProps, triggerStyle } ) => (
									<ClassItem
										id={ id }
										label={ label }
										renameClass={ ( newLabel: string ) => {
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
										sortableTriggerProps={ { ...triggerProps, style: triggerStyle } }
									/>
								) }
							</SortableItem>
						);
					} ) }
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

const useReorder = () => {
	const dispatch = useDispatch();
	const order = useClassesOrder();

	const reorder = ( newIds: StyleDefinitionID[] ) => {
		dispatch( slice.actions.setOrder( newIds ) );
	};

	return [ order, reorder ] as const;
};
