import * as React from 'react';
import { Box } from '@elementor/ui';
import { __, _n, sprintf } from '@wordpress/i18n';

import { type ElementGroup } from '../utils/group-widgets';

type Props = {
	value: string;
	isSearching: boolean;
	onChange: ( value: string ) => void;
	groups: ElementGroup[];
};

const INPUT_ID = 'elementor-panel-elements-search-input';

const VISUALLY_HIDDEN_SX = {
	position: 'absolute',
	width: 1,
	height: 1,
	overflow: 'hidden',
	clip: 'rect(0 0 0 0)',
};

export function ElementsSearch( { value, isSearching, onChange, groups }: Props ) {
	const resultsCount = groups.reduce( ( total, { tiles } ) => total + tiles.length, 0 );

	return (
		<div id="elementor-panel-elements-search-area">
			<div id="elementor-panel-elements-search-wrapper">
				<label htmlFor={ INPUT_ID } className="screen-reader-text">
					{ __( 'Search Widget:', 'elementor' ) }
				</label>
				<input
					type="search"
					id={ INPUT_ID }
					value={ value }
					placeholder={ __( 'Search Widget…', 'elementor' ) }
					autoComplete="off"
					onChange={ ( event ) => onChange( event.target.value ) }
					onKeyDown={ ( event ) => event.key === 'Escape' && onChange( '' ) }
				/>
				<i className="eicon-search-bold" aria-hidden="true" />
			</div>
			<Box role="status" sx={ VISUALLY_HIDDEN_SX }>
				{ isSearching &&
					( resultsCount === 0
						? __( 'No elements found.', 'elementor' )
						: sprintf(
								/* translators: %d: number of matching elements */
								_n( '%d element found.', '%d elements found.', resultsCount, 'elementor' ),
								resultsCount
						  ) ) }
			</Box>
		</div>
	);
}
