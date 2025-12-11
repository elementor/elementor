import {
	Button,
	Stack,
	Box,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
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
				top: '32px',
				backgroundColor: 'var(--e-one-palette-background-default)',
				zIndex: 10,
				padding: '20px 16px',
				boxShadow: 'rgba(0, 0, 0, 0.15) 0 5px 10px 0',
				margin: '-16px -16px 24px',
			} }
		>
			<Box>
				<Stack direction="row" alignItems="center" gap={ 2 }>
					<TextField
						label={ __( 'Search', 'elementor' ) }
						color="secondary"
						value={ searchKeyword }
						size="small"
						placeholder={ __( 'Search', 'elementor' ) }
						onChange={ ( e ) => onSearchChange( e.target.value ) }
						sx={ { minWidth: '113px' } }
					/>
					<FormControl
						fullWidth
						size="small"
						sx={ { maxWidth: '130px', minWidth: '130px' } }
						color="secondary"
					>
						<InputLabel size="small">
							{ __( 'Plugin', 'elementor' ) }
						</InputLabel>
						<Select
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
						sx={ { maxWidth: '130px', minWidth: '130px' } }
						color="secondary"
					>
						<InputLabel>{ __( 'Status', 'elementor' ) }</InputLabel>
						<Select
							value={ filterByStatus }
							onChange={ ( event ) => onStatusFilterChange( event.target.value ) }
							name="elementor-element-manager-select-filter-by-status"
						>
							<MenuItem value="all">{ __( 'All Statuses', 'elementor' ) }</MenuItem>
							<MenuItem value="active">{ __( 'Active', 'elementor' ) }</MenuItem>
							<MenuItem value="inactive">{ __( 'Inactive', 'elementor' ) }</MenuItem>
						</Select>
					</FormControl>
					<Divider
						orientation="vertical"
						flexItem
						sx={ { height: '30px', margin: '0 5px' } }
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

