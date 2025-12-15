import {
	Button,
	Stack,
	Box,
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
			sx={ {
				position: 'sticky',
				top: 4,
				backgroundColor: 'var(--e-one-palette-background-default)',
				zIndex: 10,
				paddingBlock: 2.5,
				paddingInline: 2,
				boxShadow: 'rgba(0, 0, 0, 0.15) 0 5px 10px 0',
			} }
		>
			<Box>
				<Stack direction="row" alignItems="center" gap={ 2 }>
					<TextField
						color="secondary"
						value={ searchKeyword }
						size="small"
						placeholder={ __( 'Search', 'elementor' ) }
						onChange={ ( e ) => onSearchChange( e.target.value ) }
						sx={ { minWidth: ( theme ) => theme.spacing( 14 ) } }
					/>
					<FormControl
						fullWidth
						size="small"
						sx={ { width: ( theme ) => theme.spacing( 16 ) } }
						color="secondary"
					>
						<Select
							placeholder={ __( 'Plugin', 'elementor' ) }
							value={ filterByPlugin }
							onChange={ ( event ) => onPluginFilterChange( event.target.value ) }
							name="elementor-element-manager-select-filter-by-plugin"
						>
							{ plugins.map( ( plugin ) => (
								<MenuItem key={ plugin.value } value={ plugin.value }>
									{ plugin.label }
								</MenuItem>
							) ) }
						</Select>
					</FormControl>
					<FormControl
						fullWidth
						size="small"
						sx={ { width: ( theme ) => theme.spacing( 16 ) } }
						color="secondary"
					>
						<Select
							value={ filterByStatus }
							onChange={ ( event ) => onStatusFilterChange( event.target.value ) }
							name="elementor-element-manager-select-filter-by-status"
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
						sx={ { height: 30, marginBlock: 0, marginInline: 0.5 } }
					/>
					<Stack direction="row" gap={ 1 }>
						<Button
							variant="outlined"
							color="secondary"
							disabled={ usageIsLoading }
							onClick={ onScanUsage }
							className="e-id-elementor-element-manager-button-scan-element-usage"
							loading={ usageIsLoading }
						>
							{ __( 'Scan Element Usage', 'elementor' ) }
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							onClick={ onDeactivateUnused }
							disabled={ null === usageData }
							className="e-id-elementor-element-manager-button-deactivate-unused-elements"
						>
							{ __( 'Deactivate Unused Elements', 'elementor' ) }
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							disabled={ ! widgetsDisabledCount }
							onClick={ onEnableAll }
							className="e-id-elementor-element-manager-button-enable-all"
						>
							{ __( 'Enable All', 'elementor' ) }
						</Button>
					</Stack>
				</Stack>
			</Box>
			<Box>
				<Button
					variant="contained"
					disabled={ isSaving || ! hasUnsavedChanges }
					onClick={ onSaveChanges }
					className="e-id-elementor-element-manager-button-save-changes"
					loading={ isSaving }
				>
					{ __( 'Save Changes', 'elementor' ) }
				</Button>
			</Box>
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

