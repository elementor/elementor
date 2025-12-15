import {
	Stack,
	Box,
	Tooltip,
	Switch,
	IconButton,
	Typography,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer,
	Paper,
} from '@elementor/ui';
import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { UpgradeButton } from '../../upgrade-button';
import { EditButtonDisabled } from './RolePermissions';

export const PromotionWidgetsTable = ( { widgets, promotionData } ) => {
	const { element_manager: elementManager } = promotionData;

	if ( ! widgets.length ) {
		return null;
	}

	return (
		<>
			<Box sx={ { mt: 5, mb: 2.5 } }>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box>
						<Typography variant="h6" component="h3">
							{ __( 'Elementor Pro Elements', 'elementor' ) }
						</Typography>
						<Typography variant="body2" component="p">
							{ __( 'Unleash the full power of Elementor\'s features and web creation tools.', 'elementor' ) }
						</Typography>
					</Box>
					<Box>
						<UpgradeButton
							href={ elementManager.url }
							text={ elementManager.text }
							className="e-id-elementor-element-manager-button-upgrade-pro-elements"
						/>
					</Box>
				</Stack>
			</Box>
			<TableContainer component={ Paper } variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell sx={ { width: ( theme ) => theme.spacing( 25 ) } }>
								{ __( 'Element', 'elementor' ) }
							</TableCell>
							<TableCell sx={ { width: ( theme ) => theme.spacing( 10 ) } }>
								{ __( 'Status', 'elementor' ) }
							</TableCell>
							<TableCell>
								{ __( 'Usage', 'elementor' ) }
							</TableCell>
							<TableCell>
								{ __( 'Plugin', 'elementor' ) }
							</TableCell>
							<TableCell>
								<Stack
									direction="row"
									justifyContent="flex-start"
									alignItems="center"
									gap={ 1 }
								>
									<Box>{ __( 'Permission', 'elementor' ) }</Box>
									<Box>
										<Tooltip
											placement="top"
											title={ __( 'Choose which role will have access to a specific widget.', 'elementor' ) }
										>
											<IconButton size="small">
												<HelpIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</Box>
								</Stack>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{ widgets.map( ( widget ) => (
							<TableRow key={ widget.name } hover>
								<TableCell>
									<Box sx={ { display: 'flex', alignItems: 'center' } }>
										<i
											style={ { marginInlineEnd: 8 } }
											className={ widget.icon }
										></i>
										{ widget.title }
									</Box>
								</TableCell>
								<TableCell>
									<Switch
										checked={ false }
										disabled={ true }
										size="small"
										className={ `e-id-elementor-element-manager-toggle-${ widget.name }` }
									/>
								</TableCell>
								<TableCell></TableCell>
								<TableCell>{ __( 'Elementor Pro', 'elementor' ) }</TableCell>
								<TableCell>
									<EditButtonDisabled widgetName={ widget.name } />
								</TableCell>
							</TableRow>
						) ) }
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};

PromotionWidgetsTable.propTypes = {
	widgets: PropTypes.arrayOf( PropTypes.shape( {
		name: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		icon: PropTypes.string,
	} ) ).isRequired,
	promotionData: PropTypes.shape( {
		element_manager: PropTypes.shape( {
			url: PropTypes.string,
			text: PropTypes.string,
		} ),
	} ).isRequired,
};
