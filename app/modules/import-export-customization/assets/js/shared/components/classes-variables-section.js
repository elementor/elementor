import { useState } from 'react';
import {
	Alert,
	Box,
	Checkbox,
	Chip,
	FormControlLabel,
	Link,
	Stack,
	Switch,
	Typography,
} from '@elementor/ui';
import { AlertTriangleFilledIcon, ExternalLinkIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

/**
 * SubSetting row component for individual Class/Variable toggle
 */
const SubSettingRow = ( {
	label,
	checked,
	onChange,
	disabled = false,
	limitExceeded = false,
	overLimitCount = 0,
	onReviewClick,
	overrideAll = false,
	onOverrideAllChange,
	showOverrideOption = false,
} ) => {
	return (
		<Box
			sx={ {
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				px: 1.25,
			} }
		>
			<Stack direction="row" alignItems="center" spacing={ 1 } sx={ { flex: 1 } }>
				<Typography variant="body1" color="text.primary">
					{ label }
				</Typography>

				{ limitExceeded && overLimitCount > 0 && (
					<Chip
						label={ `+${ overLimitCount } ${ __( 'over limit', 'elementor' ) }` }
						size="small"
						sx={ {
							borderColor: 'warning.main',
							color: 'warning.main',
							backgroundColor: 'transparent',
							'& .MuiChip-label': {
								px: 0.75,
								fontSize: 12,
							},
						} }
						variant="outlined"
					/>
				) }

				{ limitExceeded && onReviewClick && (
					<Link
						component="button"
						variant="body1"
						color="info.main"
						onClick={ onReviewClick }
						sx={ {
							display: 'flex',
							alignItems: 'center',
							gap: 0.5,
							textDecoration: 'none',
							'&:hover': {
								textDecoration: 'underline',
							},
						} }
					>
						{ __( 'Review', 'elementor' ) }
						<ExternalLinkIcon />
					</Link>
				) }
			</Stack>

			<Stack direction="row" alignItems="center" spacing={ 1 }>
				{ showOverrideOption && limitExceeded && (
					<Stack direction="row" alignItems="center" spacing={ 0.5 }>
						<FormControlLabel
							control={
								<Checkbox
									checked={ overrideAll }
									onChange={ ( e ) => onOverrideAllChange?.( e.target.checked ) }
									color="info"
									size="small"
									sx={ { p: 0 } }
								/>
							}
							label={ __( 'Override all', 'elementor' ) }
							sx={ {
								gap: 1,
								mr: 0,
								'& .MuiFormControlLabel-label': {
									fontSize: 14,
								},
							} }
						/>
						<AlertTriangleFilledIcon
							sx={ {
								fontSize: 16,
								color: 'warning.main',
							} }
						/>
					</Stack>
				) }

				<Switch
					checked={ checked }
					onChange={ ( e, isChecked ) => onChange?.( isChecked ) }
					color="info"
					size="medium"
					disabled={ disabled || ( limitExceeded && ! overrideAll ) }
				/>
			</Stack>
		</Box>
	);
};

SubSettingRow.propTypes = {
	label: PropTypes.string.isRequired,
	checked: PropTypes.bool,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
	limitExceeded: PropTypes.bool,
	overLimitCount: PropTypes.number,
	onReviewClick: PropTypes.func,
	overrideAll: PropTypes.bool,
	onOverrideAllChange: PropTypes.func,
	showOverrideOption: PropTypes.bool,
};

/**
 * Classes & Variables section component for the Settings customization dialog
 *
 * This section appears after the Theme section and allows users to customize
 * the import/export of Global Classes and Global Variables.
 */
export function ClassesVariablesSection( {
	settings,
	onSettingChange,
	isImport = false,
	classesExported = true,
	variablesExported = true,
	classesLimitExceeded = false,
	variablesLimitExceeded = false,
	classesOverLimitCount = 0,
	variablesOverLimitCount = 0,
	onClassesReviewClick,
	onVariablesReviewClick,
	disabled = false,
	notExported = false,
} ) {
	const [ classesOverrideAll, setClassesOverrideAll ] = useState( false );
	const [ variablesOverrideAll, setVariablesOverrideAll ] = useState( false );

	const hasLimitWarning = isImport && ( classesLimitExceeded || variablesLimitExceeded );

	if ( notExported ) {
		return (
			<Box sx={ { border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
				<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.25 } }>
					<Typography variant="h6">
						{ __( 'Classes & variables', 'elementor' ) }
					</Typography>
					<Typography variant="body1" color="text.secondary">
						{ __( 'Not exported', 'elementor' ) }
					</Typography>
				</Box>
			</Box>
		);
	}

	return (
		<Box sx={ { border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Stack spacing={ 2.5 }>
				{/* Section Header */}
				<Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.25 } }>
					<Typography variant="h6">
						{ __( 'Classes & variables', 'elementor' ) }
					</Typography>
				</Box>

				{/* Limit Warning Alert - Only shown during import when limits are exceeded */}
				{ hasLimitWarning && (
				<Alert
					severity="warning"
					icon={ <AlertTriangleFilledIcon sx={ { color: 'warning.main' } } /> }
					sx={ {
							backgroundColor: 'warning.background',
							'& .MuiAlert-message': {
								display: 'flex',
								alignItems: 'center',
								gap: 0.75,
							},
						} }
					>
						<Typography
							variant="body2"
							component="span"
							sx={ { fontWeight: 500 } }
							color="text.secondary"
						>
							{ __( 'Import limit reached.', 'elementor' ) }
						</Typography>
						<Typography variant="body2" component="span" color="text.secondary">
							{ __( 'To resolve this, review existing items or choose to override', 'elementor' ) }
						</Typography>
					</Alert>
				) }

				{/* Sub-settings */}
				<Stack spacing={ 1.5 }>
					{/* Classes Row */}
					<SubSettingRow
						label={ __( 'Classes', 'elementor' ) }
						checked={ settings.classes ?? true }
						onChange={ ( isChecked ) => onSettingChange( 'classes', isChecked ) }
						disabled={ disabled || ( isImport && ! classesExported ) }
						limitExceeded={ isImport && classesLimitExceeded }
						overLimitCount={ classesOverLimitCount }
						onReviewClick={ onClassesReviewClick }
						overrideAll={ classesOverrideAll }
						onOverrideAllChange={ ( checked ) => {
							setClassesOverrideAll( checked );
							if ( checked ) {
								onSettingChange( 'classesOverrideAll', true );
							} else {
								onSettingChange( 'classesOverrideAll', false );
							}
						} }
						showOverrideOption={ isImport }
					/>

					{/* Variables Row */}
					<SubSettingRow
						label={ __( 'Variables', 'elementor' ) }
						checked={ settings.variables ?? true }
						onChange={ ( isChecked ) => onSettingChange( 'variables', isChecked ) }
						disabled={ disabled || ( isImport && ! variablesExported ) }
						limitExceeded={ isImport && variablesLimitExceeded }
						overLimitCount={ variablesOverLimitCount }
						onReviewClick={ onVariablesReviewClick }
						overrideAll={ variablesOverrideAll }
						onOverrideAllChange={ ( checked ) => {
							setVariablesOverrideAll( checked );
							if ( checked ) {
								onSettingChange( 'variablesOverrideAll', true );
							} else {
								onSettingChange( 'variablesOverrideAll', false );
							}
						} }
						showOverrideOption={ isImport }
					/>
				</Stack>
			</Stack>
		</Box>
	);
}

ClassesVariablesSection.propTypes = {
	settings: PropTypes.shape( {
		classes: PropTypes.bool,
		variables: PropTypes.bool,
		classesOverrideAll: PropTypes.bool,
		variablesOverrideAll: PropTypes.bool,
	} ).isRequired,
	onSettingChange: PropTypes.func.isRequired,
	isImport: PropTypes.bool,
	classesExported: PropTypes.bool,
	variablesExported: PropTypes.bool,
	classesLimitExceeded: PropTypes.bool,
	variablesLimitExceeded: PropTypes.bool,
	classesOverLimitCount: PropTypes.number,
	variablesOverLimitCount: PropTypes.number,
	onClassesReviewClick: PropTypes.func,
	onVariablesReviewClick: PropTypes.func,
	disabled: PropTypes.bool,
	notExported: PropTypes.bool,
};
