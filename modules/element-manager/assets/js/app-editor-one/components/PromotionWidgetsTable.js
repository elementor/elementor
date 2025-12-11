import {
	Stack,
	Box,
	Tooltip,
	Switch,
	IconButton,
	Typography,
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
			<Box>
				<table className="wp-list-table widefat fixed striped table-view-list">
					<thead>
						<tr>
							<th className="manage-column">
								<span>{ __( 'Element', 'elementor' ) }</span>
							</th>
							<th>{ __( 'Status', 'elementor' ) }</th>
							<th>{ __( 'Usage', 'elementor' ) }</th>
							<th>{ __( 'Plugin', 'elementor' ) }</th>
							<th>
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
							</th>
						</tr>
					</thead>
					<tbody>
						{ widgets.map( ( widget ) => (
							<tr key={ widget.name }>
								<td>
									<i
										style={ { marginInlineEnd: '5px' } }
										className={ widget.icon }
									></i>
									{ ' ' }
									{ widget.title }
								</td>
								<td>
									<Switch
										checked={ false }
										disabled={ true }
										size="small"
										className={ `e-id-elementor-element-manager-toggle-${ widget.name }` }
									/>
								</td>
								<td></td>
								<td>{ __( 'Elementor Pro', 'elementor' ) }</td>
								<td>
									<EditButtonDisabled widgetName={ widget.name } />
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</Box>
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

