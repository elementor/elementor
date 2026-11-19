import * as React from 'react';
import { useId, useState } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { Box, ButtonBase, Collapse, Divider, Typography } from '@elementor/ui';

import { TILES_PER_ROW } from '../consts';
import { type ElementGroup as ElementGroupData } from '../utils/group-widgets';
import { ElementTile } from './element-tile';

export function ElementGroup( { group }: { group: ElementGroupData } ) {
	const [ isOpen, setIsOpen ] = useState( true );
	const contentId = useId();

	return (
		<Box>
			<ButtonBase
				aria-expanded={ isOpen }
				data-nav-item="header"
				data-group-id={ group.id }
				aria-controls={ contentId }
				onClick={ () => setIsOpen( ( open ) => ! open ) }
				sx={ {
					width: '100%',
					justifyContent: 'space-between',
					py: 1,
					'&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
				} }
			>
				<Typography variant="caption" fontWeight={ 500 }>
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
						gap: 1,
						pb: 2,
					} }
				>
					{ group.tiles.map( ( tile ) => (
						<ElementTile key={ tile.widgetType } tile={ tile } groupId={ group.id } />
					) ) }
				</Box>
			</Collapse>
			<Divider />
		</Box>
	);
}
