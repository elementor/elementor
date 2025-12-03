import * as React from 'react';
import { ArrowLeftIcon, ComponentsIcon, SettingsIcon } from '@elementor/icons';
import {
	Badge,
	Box,
	Divider,
	IconButton,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const COMPONENT_MOCK_DATA = {
	title: 'Component 1',
	overrides: [ 'prop-uuid-1', 'prop-uuid-2', 'prop-uuid-3' ],
};

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
	return (
		<Box>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={ { height: 40, pl: 1.5, pr: 2, py: 1 } }
			>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<Stack direction="row" alignItems="center" gap={ 0.5 }>
						<Tooltip title={ __( 'Back', 'elementor' ) }>
							<IconButton size="tiny" onClick={ onBack } aria-label={ __( 'Back', 'elementor' ) }>
								<ArrowLeftIcon fontSize="tiny" />
							</IconButton>
						</Tooltip>
						<Stack direction="row" alignItems="center" gap={ 0.5 }>
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
					badgeContent={ overridesCount }
					color="primary"
					sx={ {
						'& .MuiBadge-badge': {
							bgcolor: 'common.black',
							color: 'common.white',
							fontSize: 12,
							fontWeight: 500,
							minWidth: 16,
							height: 16,
							padding: '0 6.5px',
						},
					} }
				>
					<ToggleButtonGroup size="tiny">
						<ToggleButton
							value="overrides"
							size="tiny"
							onClick={ onOverridesClick }
							aria-label={ __( 'View overrides', 'elementor' ) }
						>
							<SettingsIcon fontSize="tiny" />
						</ToggleButton>
					</ToggleButtonGroup>
				</Badge>
			</Stack>
			<Divider />
		</Box>
	);
};
