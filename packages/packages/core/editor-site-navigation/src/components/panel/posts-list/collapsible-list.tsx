import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import {
	Box,
	Collapse,
	Divider,
	IconButton,
	List,
	ListItem,
	styled,
	type SvgIconProps,
	Typography,
} from '@elementor/ui';

import { contentPanelSectionHeaderPaddingSx, getContentPanelSectionDividerSx } from '../content-panel-chrome';

type Props = {
	isLastSection?: boolean;
	label: string;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
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

export default function CollapsibleList( {
	isLastSection = false,
	label,
	isOpen,
	onOpenChange,
	children,
}: PropsWithChildren< Props > ) {
	const toggle = () => onOpenChange( ! isOpen );

	return (
		<>
			<ListItem dense disablePadding sx={ contentPanelSectionHeaderPaddingSx }>
				<Box
					sx={ {
						alignItems: 'center',
						display: 'flex',
						gap: 0.5,
						width: '100%',
					} }
				>
					<Box
						component="button"
						onClick={ toggle }
						sx={ {
							background: 'none',
							border: 0,
							color: 'text.primary',
							cursor: 'pointer',
							flex: 1,
							minWidth: 0,
							p: 0,
							textAlign: 'start',
						} }
						type="button"
					>
						<Typography component="span" variant="subtitle2">
							{ label }
						</Typography>
					</Box>
					<IconButton
						aria-expanded={ isOpen }
						aria-label={ label }
						onClick={ toggle }
						size="small"
						sx={ { color: 'text.secondary', flexShrink: 0, mr: -0.5 } }
					>
						<RotateIcon fontSize="small" isOpen={ isOpen } />
					</IconButton>
				</Box>
			</ListItem>
			<Collapse in={ isOpen } timeout="auto" unmountOnExit>
				<List dense disablePadding>
					{ children }
				</List>
			</Collapse>
			<Divider sx={ getContentPanelSectionDividerSx( isLastSection ) } />
		</>
	);
}
