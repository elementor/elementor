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
	TableSortLabel,
	TableContainer,
	Paper,
} from '@elementor/ui';
import { HelpIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { UpgradeButton } from '../../upgrade-button';
import { RolePermissions, EditButtonDisabled } from './RolePermissions';
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

	const sortingClasses = getSortingIndicatorClasses( 'widget' );
	const isWidgetSorted = sortingClasses.includes( 'sorted' );
	const widgetSortDirection = sortingClasses.includes( 'asc' ) ? 'asc' : 'desc';

	const usageSortingClasses = getSortingIndicatorClasses( 'usage' );
	const isUsageSorted = usageSortingClasses.includes( 'sorted' );
	const usageSortDirection = usageSortingClasses.includes( 'asc' ) ? 'asc' : 'desc';

	if ( ! widgets.length ) {
		return (
			<Typography color="text.secondary">
				{ __( 'No elements found.', 'elementor' ) }
			</Typography>
		);
	}

	return (
		<TableContainer component={ Paper } variant="outlined">
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell sx={ { width: ( theme ) => theme.spacing( 25 ) } }>
							<TableSortLabel
								active={ isWidgetSorted }
								direction={ isWidgetSorted ? widgetSortDirection : 'asc' }
								onClick={ () => onSortingClicked( 'widget' ) }
								className="e-id-elementor-element-manager-button-sort-by-element"
							>
								{ __( 'Element', 'elementor' ) }
							</TableSortLabel>
						</TableCell>
						<TableCell sx={ { width: ( theme ) => theme.spacing( 10 ) } }>
							{ __( 'Status', 'elementor' ) }
						</TableCell>
						<TableCell>
							<TableSortLabel
								active={ isUsageSorted }
								direction={ isUsageSorted ? usageSortDirection : 'asc' }
								onClick={ () => onSortingClicked( 'usage' ) }
								className="e-id-elementor-element-manager-button-sort-by-usage"
							>
								{ __( 'Usage', 'elementor' ) }
							</TableSortLabel>
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
								<Box>
									{ __( 'Permission', 'elementor' ) }
								</Box>
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
									<Box sx={ { marginInlineStart: 1 } }>
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
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{ widgets.map( ( widget ) => (
						<TableRow key={ widget.name } data-key-id={ widget.name } hover>
							<TableCell>
								<Box sx={ { display: 'flex', alignItems: 'center' } }>
									<i
										style={ {
											marginInlineEnd: 8,
											marginInlineStart: 0,
											display: 'inline-block',
										} }
										className={ widget.icon }
									></i>
									{ widget.title }
								</Box>
							</TableCell>
							<TableCell>
								<Switch
									color="secondary"
									checked={ ! widgetsDisabled.includes( widget.name ) }
									onChange={ ( event, checked ) => onToggleWidget( widget.name, checked ) }
									size="small"
									className={ `e-id-elementor-element-manager-toggle-${ widget.name }` }
								/>
							</TableCell>
							<TableCell>
								<UsageTimesColumn
									widgetName={ widget.name }
									usageData={ usageWidgets.data }
									isLoading={ usageWidgets.isLoading }
									getWidgetUsage={ getWidgetUsage }
									onScanClick={ onScanUsage }
								/>
							</TableCell>
							<TableCell>{ widget.plugin }</TableCell>
							<TableCell>
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
							</TableCell>
						</TableRow>
					) ) }
				</TableBody>
			</Table>
		</TableContainer>
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
	widgetsRoleRestrictions: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array ] ),
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
