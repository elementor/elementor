import * as React from 'react';
import { type PropsWithChildren, type ReactNode } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import {
	Box,
	Chip,
	Collapse,
	Divider,
	IconButton,
	List,
	ListItem,
	Stack,
	styled,
	type SvgIconProps,
	Typography,
} from '@elementor/ui';

import { contentPanelSectionHeaderPaddingSx, getContentPanelSectionDividerSx } from '../content-panel-chrome';

type Props = {
	count: number;
	isLastSection?: boolean;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
	title: string;
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

function getSectionHeaderAriaLabel( title: string, count: number ) {
	return `${ title } (${ count.toString() })`;
}

export default function CollapsibleList( {
	count,
	isLastSection = false,
	isOpen,
	onOpenChange,
	title,
	trailingActions,
	children,
}: PropsWithChildren< Props > ) {
	const toggle = () => onOpenChange( ! isOpen );
	const sectionHeaderAriaLabel = getSectionHeaderAriaLabel( title, count );

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
						aria-expanded={ isOpen }
						aria-label={ sectionHeaderAriaLabel }
						component="button"
						onClick={ toggle }
						sx={ {
							alignItems: 'center',
							background: 'none',
							border: 0,
							color: 'text.primary',
							cursor: 'pointer',
							display: 'flex',
							flex: 1,
							minWidth: 0,
							p: 0,
							textAlign: 'start',
						} }
						type="button"
					>
						<Stack alignItems="center" direction="row" gap={ 0.5 }>
							<Typography component="span" variant="subtitle2">
								{ title }
							</Typography>
							<Chip label={ count } size="tiny" />
						</Stack>
					</Box>
					<Stack alignItems="center" direction="row" flexShrink={ 0 } gap={ 0.25 }>
						<IconButton
							aria-expanded={ isOpen }
							aria-label={ sectionHeaderAriaLabel }
							onClick={ toggle }
							size="small"
							sx={ { color: 'text.secondary', mr: trailingActions ? 0 : -0.5 } }
						>
							<RotateIcon fontSize="small" isOpen={ isOpen } />
						</IconButton>
						{ trailingActions }
					</Stack>
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
