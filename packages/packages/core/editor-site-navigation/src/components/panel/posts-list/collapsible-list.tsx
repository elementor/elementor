import * as React from 'react';
import { type PropsWithChildren, type ReactNode } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { Box, Collapse, Divider, List, ListItem, styled, type SvgIconProps, Typography } from '@elementor/ui';

import {
	contentPanelFullBleedDividerSx,
	contentPanelInsetDividerSx,
	contentPanelInsetPaddingSx,
} from '../content-panel-chrome';

type Props = {
	isLastSection?: boolean;
	label: string;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
	trailingActions?: ReactNode;
};

interface RotateIconProps extends SvgIconProps {
	isOpen: boolean;
}

const RotateIcon = styled( ChevronDownIcon, {
	shouldForwardProp: ( prop ) => prop !== 'isOpen',
} )< RotateIconProps >( ( { theme, isOpen } ) => ( {
	transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
	transition: theme.transitions.create( 'transform', {
		duration: theme.transitions.duration.standard,
	} ),
} ) );

const SECTION_HEADER_BLOCK_PADDING = 0.75;

export default function CollapsibleList( {
	isLastSection = false,
	label,
	isOpen,
	onOpenChange,
	trailingActions,
	children,
}: PropsWithChildren< Props > ) {
	const toggle = () => onOpenChange( ! isOpen );
	const sectionDividerSx = isLastSection ? contentPanelFullBleedDividerSx : contentPanelInsetDividerSx;

	return (
		<>
			<ListItem
				disablePadding
				sx={ {
					...contentPanelInsetPaddingSx,
					py: SECTION_HEADER_BLOCK_PADDING,
				} }
			>
				<Box
					sx={ {
						alignItems: 'center',
						display: 'flex',
						gap: 0.5,
						width: '100%',
					} }
				>
					<Box
						aria-expanded={ isOpen }
						component="button"
						onClick={ toggle }
						sx={ {
							alignItems: 'center',
							background: 'none',
							border: 0,
							color: 'text.primary',
							cursor: 'pointer',
							display: 'inline-flex',
							flex: 1,
							gap: 0.25,
							minWidth: 0,
							p: 0,
							textAlign: 'start',
						} }
						type="button"
					>
						<Typography component="span" variant="subtitle2">
							{ label }
						</Typography>
						<RotateIcon
							fontSize="small"
							isOpen={ isOpen }
							sx={ { color: 'text.secondary', flexShrink: 0 } }
						/>
					</Box>
					{ trailingActions }
				</Box>
			</ListItem>
			<Collapse in={ isOpen } timeout="auto" unmountOnExit>
				<List dense disablePadding>
					{ children }
				</List>
			</Collapse>
			<Divider sx={ { ...sectionDividerSx, flexShrink: 0, my: 0 } } />
		</>
	);
}
