import {
	Button,
	Stack,
	TextField,
	Select,
	MenuItem,
	FormControl,
	Divider,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const SearchFilters = ( {
	searchKeyword,
	onSearchChange,
	filterByPlugin,
	onPluginFilterChange,
	filterByStatus,
	onStatusFilterChange,
	plugins,
	usageIsLoading,
	usageData,
	widgetsDisabledCount,
	onScanUsage,
	onDeactivateUnused,
	onEnableAll,
	onSaveChanges,
	isSaving,
	hasUnsavedChanges,
} ) => {
	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="space-between"
			flexWrap="wrap"
			gap={ 2 }
			sx={ ( theme ) => ( {
				position: 'sticky',
				top: theme.spacing( 10 ),
				backgroundColor: 'var(--e-one-palette-background-default)',
				zIndex: 10,
				paddingBlock: 2.5,
				paddingInline: 2,
				boxShadow: 'rgba(0, 0, 0, 0.15) 0 5px 10px 0',
				marginBottom: theme.spacing( 1 ),
			} ) }
		>
			<Stack direction="row" alignItems="center" gap={ 2 } flexWrap="wrap">
				<TextField
					color="secondary"
					value={ searchKeyword }
					size="small"
					placeholder={ __( 'Search', 'elementor' ) }
					onChange={ ( e ) => onSearchChange( e.target.value ) }
					sx={ ( theme ) => ( { minWidth: theme.spacing( 14 ) } ) }
				/>
				<FormControl
					size="small"
					sx={ ( theme ) => ( { width: theme.spacing( 20 ) } ) }
					color="secondary"
				>
					<Select
						placeholder={ __( 'Plugin', 'elementor' ) }
						value={ filterByPlugin }
						onChange={ ( event ) => onPluginFilterChange( event.target.value ) }
						data-id="elementor-element-manager-select-filter-by-plugin"
						displayEmpty
						renderValue={ ( value ) => {
							if ( '' === value ) {
								return __( 'All Plugins', 'elementor' );
							}
							const selectedPlugin = plugins.find( ( p ) => p.value === value );
							return selectedPlugin ? selectedPlugin.label : value;
						} }
					>
						<MenuItem value="">{ __( 'All Plugins', 'elementor' ) }</MenuItem>
						{ plugins.map( ( plugin ) => (
							<MenuItem key={ plugin.value } value={ plugin.value }>
								{ plugin.label }
							</MenuItem>
						) ) }
					</Select>
				</FormControl>
				<FormControl
					size="small"
					sx={ ( theme ) => ( { width: theme.spacing( 20 ) } ) }
					color="secondary"
				>
					<Select
						value={ filterByStatus }
						onChange={ ( event ) => onStatusFilterChange( event.target.value ) }
						data-id="elementor-element-manager-select-filter-by-status"
						placeholder={ __( 'Status', 'elementor' ) }
					>
						<MenuItem value="all">{ __( 'All Statuses', 'elementor' ) }</MenuItem>
						<MenuItem value="active">{ __( 'Active', 'elementor' ) }</MenuItem>
						<MenuItem value="inactive">{ __( 'Inactive', 'elementor' ) }</MenuItem>
					</Select>
				</FormControl>
				<Divider
					orientation="vertical"
					flexItem
					sx={ {
						height: 30,
						marginBlock: 0,
						marginInline: 0.5,
						alignSelf: 'center',
						display: { xs: 'none', md: 'block' },
					} }
				/>
			</Stack>
			<Stack
				direction="row"
				alignItems="center"
				gap={ 1 }
				flexWrap="nowrap"
				justifyContent="space-between"
				sx={ { flex: 1, flexWrap: 'nowrap' } }
			>
				<Stack direction="row" alignItems="center" gap={ 1 } flexWrap="nowrap">
					<Button
						variant="outlined"
						color="secondary"
						disabled={ usageIsLoading }
						onClick={ onScanUsage }
						data-id="e-id-elementor-element-manager-button-scan-element-usage"
						loading={ usageIsLoading }
					>
						{ __( 'Scan Element Usage', 'elementor' ) }
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						onClick={ onDeactivateUnused }
						disabled={ null === usageData }
						data-id="e-id-elementor-element-manager-button-deactivate-unused-elements"
					>
						{ __( 'Deactivate Unused Elements', 'elementor' ) }
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						disabled={ ! widgetsDisabledCount }
						onClick={ onEnableAll }
						data-id="e-id-elementor-element-manager-button-enable-all"
					>
						{ __( 'Enable All', 'elementor' ) }
					</Button>
				</Stack>
				<Button
					variant="contained"
					disabled={ isSaving || ! hasUnsavedChanges }
					onClick={ onSaveChanges }
					data-id="e-id-elementor-element-manager-button-save-changes"
					loading={ isSaving }
				>
					{ __( 'Save Changes', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
};

SearchFilters.propTypes = {
	searchKeyword: PropTypes.string.isRequired,
	onSearchChange: PropTypes.func.isRequired,
	filterByPlugin: PropTypes.string.isRequired,
	onPluginFilterChange: PropTypes.func.isRequired,
	filterByStatus: PropTypes.string.isRequired,
	onStatusFilterChange: PropTypes.func.isRequired,
	plugins: PropTypes.arrayOf( PropTypes.shape( {
		label: PropTypes.string.isRequired,
		value: PropTypes.string.isRequired,
	} ) ).isRequired,
	usageIsLoading: PropTypes.bool,
	usageData: PropTypes.object,
	widgetsDisabledCount: PropTypes.number.isRequired,
	onScanUsage: PropTypes.func.isRequired,
	onDeactivateUnused: PropTypes.func.isRequired,
	onEnableAll: PropTypes.func.isRequired,
	onSaveChanges: PropTypes.func.isRequired,
	isSaving: PropTypes.bool,
	hasUnsavedChanges: PropTypes.bool,
};

