import * as React from 'react';
import { ColorSwatchIcon, PhotoIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { NotFound } from './not-found';

export type NotFoundType = 'filter' | 'search' | 'filterAndSearch';

const config = {
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
	onClearSearch: () => void;
	onClearFilter: () => void;
	searchValue: string;
	notFoundType: NotFoundType | undefined;
};

export const getNotFoundConfig = ( {
	onClearSearch,
	onClearFilter,
	searchValue,
	notFoundType,
}: GetNotFoundConfigProps ): React.ReactElement | null => {
	switch ( notFoundType ) {
		case 'filter':
			return <NotFound { ...config.filter } onClear={ onClearFilter } />;
		case 'search':
			return <NotFound { ...config.search } searchValue={ searchValue } onClear={ onClearSearch } />;
		case 'filterAndSearch':
			return (
				<NotFound
					{ ...config.filterAndSearch }
					onClear={ () => {
						onClearFilter();
						onClearSearch();
					} }
				/>
			);
		default:
			return null;
	}
};
