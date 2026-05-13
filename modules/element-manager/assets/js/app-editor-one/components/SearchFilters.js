import {
	Button,
	Stack,
	TextField,
	Select,
	MenuItem,
	FormControl,
	Divider,
	styled,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const FIELD_HEIGHT = 28;
const FONT_SIZE = 12;
const ICON_SIZE = 16;

const StyledTextField = styled( TextField )( {
	'& .MuiInputBase-root': {
		height: FIELD_HEIGHT,
		fontSize: FONT_SIZE,
	},
} );

const StyledFormControl = styled( FormControl )( {
	'& .MuiInputBase-root': {
		height: FIELD_HEIGHT,
		fontSize: FONT_SIZE,
	},
	'& .MuiSelect-icon': {
		width: ICON_SIZE,
		height: ICON_SIZE,
		top: 'calc(50% - 8px)',
	},
} );

const StyledButton = styled( Button )( {
	height: FIELD_HEIGHT,
	fontSize: FONT_SIZE,
	minWidth: 'auto',
	whiteSpace: 'nowrap',
} );

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
			direction={ { xs: 'column', sm: 'row' } }
			alignItems={ { xs: 'stretch', sm: 'flex-start' } }
			gap={ 1.5 }
			sx={ ( theme ) => ( {
				position: 'sticky',
				top: theme.spacing( 10 ),
				backgroundColor: 'var(--e-one-palette-background-default)',
				zIndex: 10,
				paddingBlock: 2,
				paddingInline: 2,
				boxShadow: 'rgba(0, 0, 0, 0.15) 0 5px 10px 0',
				marginBottom: theme.spacing( 1 ),
			} ) }
		>
			<Stack
				direction="row"
				alignItems="center"
				flexWrap="wrap"
				gap={ 1.5 }
				sx={ { flex: 1 } }
			>
				<StyledTextField
					color="secondary"
					value={ searchKeyword }
					size="small"
					placeholder={ __( 'Search', 'elementor' ) }
					onChange={ ( e ) => onSearchChange( e.target.value ) }
					sx={ ( theme ) => ( { minWidth: theme.spacing( 14 ) } ) }
				/>
				<StyledFormControl
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
				</StyledFormControl>
				<StyledFormControl
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
				</StyledFormControl>
				<Divider
					orientation="vertical"
					flexItem
					sx={ {
						height: FIELD_HEIGHT,
						marginBlock: 0,
						marginInline: 0.5,
						alignSelf: 'center',
						display: { xs: 'none', md: 'block' },
					} }
				/>
				<StyledButton
					variant="outlined"
					color="secondary"
					size="small"
					disabled={ usageIsLoading }
					onClick={ onScanUsage }
					data-id="e-id-elementor-element-manager-button-scan-element-usage"
					loading={ usageIsLoading }
				>
					{ __( 'Scan Element Usage', 'elementor' ) }
				</StyledButton>
				<StyledButton
					variant="outlined"
					color="secondary"
					size="small"
					onClick={ onDeactivateUnused }
					disabled={ null === usageData }
					data-id="e-id-elementor-element-manager-button-deactivate-unused-elements"
				>
					{ __( 'Deactivate Unused Elements', 'elementor' ) }
				</StyledButton>
				<StyledButton
					variant="outlined"
					color="secondary"
					size="small"
					disabled={ ! widgetsDisabledCount }
					onClick={ onEnableAll }
					data-id="e-id-elementor-element-manager-button-enable-all"
				>
					{ __( 'Enable All', 'elementor' ) }
				</StyledButton>
			</Stack>
			<StyledButton
				variant="contained"
				size="small"
				disabled={ isSaving || ! hasUnsavedChanges }
				onClick={ onSaveChanges }
				data-id="e-id-elementor-element-manager-button-save-changes"
				loading={ isSaving }
				sx={ { alignSelf: 'flex-start' } }
			>
				{ __( 'Save Changes', 'elementor' ) }
			</StyledButton>
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
