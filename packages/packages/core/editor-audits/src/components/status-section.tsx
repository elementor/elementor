import * as React from 'react';
import { useState } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { Box, Chip, Collapse, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	label: string;
	count: number;
	defaultExpanded?: boolean;
	children: React.ReactNode;
};

export default function StatusSection( { label, count, defaultExpanded = false, children }: Props ) {
	const [ expanded, setExpanded ] = useState( defaultExpanded );

	if ( count === 0 ) {
		return null;
	}

	return (
		<Box sx={ { paddingBlock: 1 } }>
			<Box
				sx={ { display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' } }
				onClick={ () => setExpanded( ( v ) => ! v ) }
			>
				<IconButton
					size="small"
					aria-label={ expanded ? __( 'Collapse', 'elementor' ) : __( 'Expand', 'elementor' ) }
				>
					<ChevronDownIcon
						fontSize="small"
						sx={ {
							transform: expanded ? 'rotate(180deg)' : undefined,
							transition: 'transform .2s',
						} }
					/>
				</IconButton>
				<Chip label={ `${ label } (${ count })` } size="small" />
			</Box>
			<Collapse in={ expanded }>
				<Box sx={ { paddingInlineStart: 4.25, paddingBlock: 2 } }>{ children }</Box>
			</Collapse>
		</Box>
	);
}
