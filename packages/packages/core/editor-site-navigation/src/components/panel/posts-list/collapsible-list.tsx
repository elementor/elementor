import * as React from 'react';
import { type PropsWithChildren, type ReactNode } from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import {
	Collapse,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	styled,
	type SvgIconProps,
} from '@elementor/ui';

type Props = {
	label: string;
	isOpen: boolean;
	onOpenChange: ( isOpen: boolean ) => void;
	secondaryAction?: ReactNode;
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

const StyledListItemIcon = styled( ListItemIcon )( ( { theme } ) => ( {
	minWidth: theme.spacing( 4 ),
} ) );

export default function CollapsibleList( {
	label,
	isOpen,
	onOpenChange,
	secondaryAction,
	children,
}: PropsWithChildren< Props > ) {
	const toggle = () => onOpenChange( ! isOpen );

	return (
		<>
			<ListItem
				secondaryAction={ secondaryAction }
				sx={ {
					pr: secondaryAction ? 1 : undefined,
				} }
			>
				<StyledListItemIcon
					sx={ {
						color: 'text.secondary',
					} }
				>
					<IconButton
						onClick={ toggle }
						size="small"
						sx={ {
							color: 'inherit',
						} }
						aria-expanded={ isOpen }
					>
						<RotateIcon fontSize="small" isOpen={ isOpen } />
					</IconButton>
				</StyledListItemIcon>
				<ListItemText
					primaryTypographyProps={ { variant: 'subtitle2', component: 'span' } }
					primary={ label }
					onClick={ toggle }
					sx={ { cursor: 'pointer', userSelect: 'none' } }
				/>
			</ListItem>
			<Collapse in={ isOpen } timeout="auto" unmountOnExit>
				<List dense>{ children }</List>
			</Collapse>
			<Divider sx={ { mt: 1 } } />
		</>
	);
}