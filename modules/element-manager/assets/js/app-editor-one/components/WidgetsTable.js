import {
	Button,
	Stack,
	Box,
	Tooltip,
	Switch,
	IconButton,
} from '@elementor/ui';
import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { UpgradeButton } from '../../upgrade-button';
import { RolePermissions, EditButtonDisabled } from '../../role-permissions';
import { UsageTimesColumn } from './UsageTimesColumn';

export const WidgetsTable = ( {
	widgets,
	widgetsDisabled,
	widgetsRoleRestrictions,
	setWidgetsRoleRestrictions,
	roles,
	promotionWidgets,
	promotionData,
	usageWidgets,
	getWidgetUsage,
	onScanUsage,
	onToggleWidget,
	getSortingIndicatorClasses,
	onSortingClicked,
} ) => {
	const { manager_permissions: managerPermissions } = promotionData;

	if ( ! widgets.length ) {
		return <>{ __( 'No elements found.', 'elementor' ) }</>;
	}

	return (
		<table className="wp-list-table widefat fixed striped table-view-list">
			<thead>
				<tr>
					<th className={ `manage-column sortable ${ getSortingIndicatorClasses( 'widget' ) }` }>
						<Button
							component="a"
							href="#"
							onClick={ ( event ) => {
								event.preventDefault();
								onSortingClicked( 'widget' );
							} }
							className="e-id-elementor-element-manager-button-sort-by-element"
							variant="text"
						>
							<span>{ __( 'Element', 'elementor' ) }</span>
							<span className="sorting-indicators">
								<span className="sorting-indicator asc" aria-hidden="true"></span>
								<span className="sorting-indicator desc" aria-hidden="true"></span>
							</span>
						</Button>
					</th>
					<th>{ __( 'Status', 'elementor' ) }</th>
					<th className={ `manage-column sortable ${ getSortingIndicatorClasses( 'usage' ) }` }>
						<Button
							component="a"
							href="#"
							onClick={ ( event ) => {
								event.preventDefault();
								onSortingClicked( 'usage' );
							} }
							className="e-id-elementor-element-manager-button-sort-by-usage"
							variant="text"
						>
							<span>{ __( 'Usage', 'elementor' ) }</span>
							<span className="sorting-indicators">
								<span className="sorting-indicator asc" aria-hidden="true"></span>
								<span className="sorting-indicator desc" aria-hidden="true"></span>
							</span>
						</Button>
					</th>
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
									title={ __( 'Choose which users will have access to each widget.', 'elementor' ) }
								>
									<IconButton size="small">
										<HelpIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
							{ null === widgetsRoleRestrictions && (
								<Box sx={ { marginInlineStart: '10px' } }>
									<UpgradeButton
										href={
											promotionWidgets.length
												? managerPermissions.pro.url
												: managerPermissions.advanced.url
										}
										size="small"
										text={
											promotionWidgets.length
												? managerPermissions.pro.text
												: managerPermissions.advanced.text
										}
										className={ [ 'e-id-elementor-element-manager-button-upgrade-permissions', 'go-pro' ].join( ' ' ) }
									/>
								</Box>
							) }
						</Stack>
					</th>
				</tr>
			</thead>
			<tbody>
				{ widgets.map( ( widget ) => (
					<tr key={ widget.name } data-key-id={ widget.name }>
						<td>
							<i
								style={ {
									marginInlineEnd: '5px',
									marginInlineStart: '0',
									display: 'inline-block',
								} }
								className={ widget.icon }
							></i>
							{ ' ' }
							{ widget.title }
						</td>
						<td>
							<Switch
								color="secondary"
								checked={ ! widgetsDisabled.includes( widget.name ) }
								onChange={ ( event, checked ) => onToggleWidget( widget.name, checked ) }
								size="small"
								className={ `e-id-elementor-element-manager-toggle-${ widget.name }` }
							/>
						</td>
						<td>
							<UsageTimesColumn
								widgetName={ widget.name }
								usageData={ usageWidgets.data }
								isLoading={ usageWidgets.isLoading }
								getWidgetUsage={ getWidgetUsage }
								onScanClick={ onScanUsage }
							/>
						</td>
						<td>{ widget.plugin }</td>
						<td>
							{ null !== widgetsRoleRestrictions && ! widgetsDisabled.includes( widget.name ) ? (
								<RolePermissions
									widgetName={ widget.name }
									roles={ roles }
									widgetsRoleRestrictions={ widgetsRoleRestrictions }
									setWidgetsRoleRestrictions={ setWidgetsRoleRestrictions }
								/>
							) : (
								<EditButtonDisabled />
							) }
						</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
};

const widgetShape = PropTypes.shape( {
	name: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	icon: PropTypes.string,
	plugin: PropTypes.string,
} );

WidgetsTable.propTypes = {
	widgets: PropTypes.arrayOf( widgetShape ).isRequired,
	widgetsDisabled: PropTypes.arrayOf( PropTypes.string ).isRequired,
	widgetsRoleRestrictions: PropTypes.object,
	setWidgetsRoleRestrictions: PropTypes.func.isRequired,
	roles: PropTypes.array.isRequired,
	promotionWidgets: PropTypes.arrayOf( widgetShape ).isRequired,
	promotionData: PropTypes.shape( {
		manager_permissions: PropTypes.shape( {
			pro: PropTypes.shape( {
				url: PropTypes.string,
				text: PropTypes.string,
			} ),
			advanced: PropTypes.shape( {
				url: PropTypes.string,
				text: PropTypes.string,
			} ),
		} ),
	} ).isRequired,
	usageWidgets: PropTypes.shape( {
		isLoading: PropTypes.bool,
		data: PropTypes.object,
	} ).isRequired,
	getWidgetUsage: PropTypes.func.isRequired,
	onScanUsage: PropTypes.func.isRequired,
	onToggleWidget: PropTypes.func.isRequired,
	getSortingIndicatorClasses: PropTypes.func.isRequired,
	onSortingClicked: PropTypes.func.isRequired,
};

