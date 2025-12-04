import * as React from 'react';
import { useState } from 'react';
import { ArrowLeftIcon, ComponentsIcon, SettingsIcon } from '@elementor/icons';
import {
	Badge,
	Box,
	ButtonBase,
	Divider,
	IconButton,
	keyframes,
	Stack,
	styled,
	ToggleButton,
	Tooltip,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const COMPONENT_MOCK_DATA = {
	title: 'Component 1',
	overrides: [ 'prop-uuid-1', 'prop-uuid-2', 'prop-uuid-3' ],
};

const bounceIn = keyframes`
	0% { transform: scale(0); }
	70% { transform: scale(1.1); }
	100% { transform: scale(1); }
`;

const slideUp = keyframes`
	from { transform: translateY(100%); opacity: 0; }
	to { transform: translateY(0); opacity: 1; }
`;

type ComponentPanelHeaderProps = {
	componentName?: string;
	overridesCount?: number;
	onBack?: () => void;
	onOverridesClick?: () => void;
};

export const ComponentPanelHeader = ( {
	componentName = COMPONENT_MOCK_DATA.title,
	overridesCount = COMPONENT_MOCK_DATA.overrides.length,
	onBack,
	onOverridesClick,
}: ComponentPanelHeaderProps ) => {
	const [ count, setCount ] = useState( overridesCount );
	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={ { height: 44, pl: 1.5, pr: 2, py: 1 } }
			>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<Tooltip title={ __( 'Back', 'elementor' ) }>
							<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
								<ArrowLeftIcon fontSize="tiny" />
							</IconButton>
						</Tooltip>
						<Stack direction="row" alignItems="center" gap={ 0.5 }>
							<ButtonBase onClick={ () => setCount( count + 1 ) }>Increment</ButtonBase>
							<ButtonBase onClick={ () => setCount( count - 1 ) }>Decrement</ButtonBase>
							<ComponentsIcon sx={ { fontSize: 12, color: 'text.primary' } } />
							<Typography
								variant="caption"
								fontWeight={ 500 }
								sx={ {
									maxWidth: 100,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									color: 'text.primary',
									letterSpacing: '0.1px',
								} }
							>
								{ componentName }
							</Typography>
						</Stack>
					</Stack>
				</Stack>
				<Badge
					key={ count }
					invisible={ count === 0 }
					badgeContent={ <StyledBadgeContent>{ count }</StyledBadgeContent> }
					color="primary"
					anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
					sx={ {
						'& .MuiBadge-badge': {
							minWidth: 16,
							height: 16,
							minHeight: 16,
						},
					} }
				>
					<ToggleButton
						value="overrides"
						size="tiny"
						onClick={ onOverridesClick }
						aria-label={ __( 'View overrides', 'elementor' ) }
					>
						<SettingsIcon fontSize="tiny" />
					</ToggleButton>
				</Badge>
			</Stack>
			<Divider />
		</Box>
	);
};

const StyledBadgeContent = styled( 'span' )( {
	animation: `${ bounceIn } 300ms ease-out, ${ slideUp } 300ms ease-out`,
} );
