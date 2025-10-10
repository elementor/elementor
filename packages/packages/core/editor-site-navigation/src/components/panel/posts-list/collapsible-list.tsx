import * as React from 'react';
import { type PropsWithChildren, useState } from 'react';
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
	Icon: React.ForwardRefExoticComponent< Omit< SvgIconProps, 'ref' > >;
	isOpenByDefault?: boolean;
};

interface RotateIconProps extends SvgIconProps {
	isOpen: boolean;
}

// TODO 21/06/2023 : Should replace this with future Rotate component that will be implemented in elementor-ui
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
	Icon,
	isOpenByDefault = false,
	children,
}: PropsWithChildren< Props > ) {
	const [ isOpen, setIsOpen ] = useState( isOpenByDefault );

	return (
		<>
			<ListItem>
				<StyledListItemIcon
					sx={ {
						color: 'text.secondary',
					} }
				>
					<IconButton
						onClick={ () => setIsOpen( ( prev ) => ! prev ) }
						size="small"
						sx={ {
							color: 'inherit',
						} }
					>
						<RotateIcon fontSize="small" isOpen={ isOpen } />
					</IconButton>
				</StyledListItemIcon>
				<StyledListItemIcon
					size="small"
					sx={ {
						color: 'inherit',
					} }
				>
					<Icon fontSize="small" />
				</StyledListItemIcon>
				<ListItemText
					primaryTypographyProps={ { variant: 'subtitle2', component: 'span' } }
					primary={ label }
				/>
			</ListItem>
			<Collapse in={ isOpen } timeout="auto" unmountOnExit>
				<List dense>{ children }</List>
			</Collapse>
			<Divider sx={ { mt: 1 } } />
		</>
	);
}
