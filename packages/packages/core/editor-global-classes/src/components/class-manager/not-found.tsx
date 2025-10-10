import * as React from 'react';
import { type FC } from 'react';
import type { StyleDefinition } from '@elementor/editor-styles';
import { ColorSwatchIcon, PhotoIcon } from '@elementor/icons';
import { Box, Link, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSearchAndFilters } from '../search-and-filter/context';

export const getNotFoundType = (
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

export type NotFoundType = 'filter' | 'search' | 'filterAndSearch';

const notFound = {
	filterAndSearch: {
		mainText: __( 'Sorry, nothing matched.', 'elementor' ),
		sceneryText: __( 'Try something else.', 'elementor' ),
		icon: <PhotoIcon color="inherit" fontSize="large" />,
	},
	search: {
		mainText: __( 'Sorry, nothing matched', 'elementor' ),
		sceneryText: __( 'Clear your input and try something else.', 'elementor' ),
		icon: <PhotoIcon color="inherit" fontSize="large" />,
	},
	filter: {
		mainText: __( 'Sorry, nothing matched that search.', 'elementor' ),
		sceneryText: __( 'Clear the filters and try something else.', 'elementor' ),
		icon: <ColorSwatchIcon color="inherit" fontSize="large" />,
	},
};

type GetNotFoundConfigProps = {
	notFoundType: NotFoundType;
};

export const NotFound = ( { notFoundType }: GetNotFoundConfigProps ): React.ReactElement => {
	const {
		search: { onClearSearch, inputValue },
		filters: { onClearFilter },
	} = useSearchAndFilters();

	switch ( notFoundType ) {
		case 'filter':
			return <NotFoundLayout { ...notFound.filter } onClear={ onClearFilter } />;
		case 'search':
			return <NotFoundLayout { ...notFound.search } searchValue={ inputValue } onClear={ onClearSearch } />;
		case 'filterAndSearch':
			return (
				<NotFoundLayout
					{ ...notFound.filterAndSearch }
					onClear={ () => {
						onClearFilter();
						onClearSearch();
					} }
				/>
			);
	}
};

type NotFoundLayoutProps = {
	searchValue?: string;
	onClear: () => void;
	mainText: string;
	sceneryText: string;
	icon: React.ReactElement;
};

export const NotFoundLayout: FC< NotFoundLayoutProps > = ( { onClear, searchValue, mainText, sceneryText, icon } ) => (
	<Stack
		color={ 'text.secondary' }
		pt={ 5 }
		alignItems="center"
		gap={ 1 }
		overflow={ 'hidden' }
		justifySelf={ 'center' }
	>
		{ icon }
		<Box
			sx={ {
				width: '100%',
			} }
		>
			<Typography align="center" variant="subtitle2" color="inherit">
				{ mainText }
			</Typography>
			{ searchValue && (
				<Typography
					variant="subtitle2"
					color="inherit"
					sx={ {
						display: 'flex',
						width: '100%',
						justifyContent: 'center',
					} }
				>
					<span>&ldquo;</span>
					<span
						style={ {
							maxWidth: '80%',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						} }
					>
						{ searchValue }
					</span>
					<span>&rdquo;.</span>
				</Typography>
			) }
		</Box>
		<Typography align="center" variant="caption" color="inherit">
			{ sceneryText }
		</Typography>
		<Typography align="center" variant="caption" color="inherit">
			<Link color="secondary" variant="caption" component="button" onClick={ onClear }>
				{ __( 'Clear & try again', 'elementor' ) }
			</Link>
		</Typography>
	</Stack>
);
