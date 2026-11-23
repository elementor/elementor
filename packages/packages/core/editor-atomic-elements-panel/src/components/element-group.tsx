import * as React from 'react';
import { useId, useState } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { Box, ButtonBase, Collapse, Typography } from '@elementor/ui';

import { TILES_PER_ROW } from '../consts';
import { type ElementGroup as ElementGroupData } from '../utils/group-widgets';
import { ElementTile } from './element-tile';

export function ElementGroup( { group, forceOpen = false }: { group: ElementGroupData; forceOpen?: boolean } ) {
	const [ isExpanded, setIsExpanded ] = useState( true );
	const isOpen = isExpanded || forceOpen;
	const contentId = useId();

	return (
		<Box>
			<ButtonBase
				aria-expanded={ isOpen }
				data-nav-item="header"
				data-group-id={ group.id }
				aria-controls={ contentId }
				onClick={ () => setIsExpanded( ( expanded ) => ! expanded ) }
				sx={ {
					width: '100%',
					justifyContent: 'space-between',
					py: 1,
					'&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
				} }
			>
				<Typography variant="subtitle2" fontWeight={ 700 }>
					{ group.title }
				</Typography>
				<ChevronDownIcon
					fontSize="tiny"
					sx={ {
						transform: isOpen ? 'none' : 'rotate(-90deg)',
						'.rtl &': { transform: isOpen ? 'none' : 'rotate(90deg)' },
					} }
				/>
			</ButtonBase>
			<Collapse in={ isOpen } id={ contentId } unmountOnExit>
				<Box
					sx={ {
						display: 'grid',
						gridTemplateColumns: `repeat(${ TILES_PER_ROW }, minmax(0, 1fr))`,
						gap: 0.5,
						pb: 2,
					} }
				>
					{ group.tiles.map( ( tile ) => (
						<ElementTile key={ tile.widgetType } tile={ tile } groupId={ group.id } />
					) ) }
				</Box>
			</Collapse>
		</Box>
	);
}
