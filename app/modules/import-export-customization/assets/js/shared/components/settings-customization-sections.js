import { Alert, Box, Stack, Typography } from '@elementor/ui';
import { AlertTriangleFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { SubSettingRow } from './classes-variables-section';
import { SettingSection } from './customization-setting-section';
import {
	isClassesExported,
	isDefaultStylesExported,
	isThemeExported,
	isVariablesExported,
} from '../utils';

export function SettingsGroupSection( { children, title } ) {
	return (
		<Box sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus', p: 2.5 } }>
			<Stack spacing={ 1.5 }>
				<Typography variant="h6">
					{ title }
				</Typography>
				{ children }
			</Stack>
		</Box>
	);
}

SettingsGroupSection.propTypes = {
	children: PropTypes.node,
	title: PropTypes.string.isRequired,
};

export function DesignSystemLimitAlert() {
	return (
		<Alert
			severity="warning"
			icon={ <AlertTriangleFilledIcon sx={ { color: 'warning.main' } } /> }
			sx={ {
				alignItems: 'center',
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
	);
}

export function DesignSystemSettingsSection( {
	children,
	isImport,
	classesLimitExceeded,
	notExported,
	variablesLimitExceeded,
} ) {
	return (
		<SettingsGroupSection title={ __( 'Classes, variables & default styles', 'elementor' ) }>
			{ isImport && ( classesLimitExceeded || variablesLimitExceeded ) && ! notExported && (
				<DesignSystemLimitAlert />
			) }
			{ children }
		</SettingsGroupSection>
	);
}

DesignSystemSettingsSection.propTypes = {
	children: PropTypes.node,
	isImport: PropTypes.bool,
	classesLimitExceeded: PropTypes.bool,
	notExported: PropTypes.bool,
	variablesLimitExceeded: PropTypes.bool,
};

export function ThemeSettingsRow( { contextData, isImport, onSettingChange, settings } ) {
	const themeExported = isThemeExported( contextData );

	return isImport && ! themeExported ? (
		<SettingSection
			title={ __( 'Theme', 'elementor' ) }
			settingKey="theme"
			notExported
		/>
	) : (
		<SettingSection
			checked={ settings.theme }
			title={ __( 'Theme', 'elementor' ) }
			description={ __( 'Only public WordPress themes are supported', 'elementor' ) }
			settingKey="theme"
			onSettingChange={ onSettingChange }
			disabled={ isImport && ! themeExported }
		/>
	);
}

ThemeSettingsRow.propTypes = {
	contextData: PropTypes.object,
	isImport: PropTypes.bool,
	onSettingChange: PropTypes.func.isRequired,
	settings: PropTypes.object.isRequired,
};

export function GlobalClassesSettingsRow( {
	classesLimitExceeded,
	classesOverLimitCount,
	classesReviewClick,
	contextData,
	isImport,
	onSettingChange,
	settings,
} ) {
	const classesExported = isClassesExported( contextData );
	const classesNotExported = isImport && ! classesExported;

	return (
		<SubSettingRow
			label={ __( 'Classes', 'elementor' ) }
			checked={ settings.classes ?? false }
			onChange={ ( isChecked ) => onSettingChange( 'classes', isChecked ) }
			limitExceeded={ isImport && classesLimitExceeded && ! classesNotExported }
			overLimitCount={ classesOverLimitCount }
			onReviewClick={ classesReviewClick }
			overrideAll={ settings.classesOverrideAll ?? false }
			onOverrideAllChange={ ( checked ) => onSettingChange( 'classesOverrideAll', checked ) }
			showOverrideOption={ isImport && ! classesNotExported }
			notExported={ classesNotExported }
		/>
	);
}

GlobalClassesSettingsRow.propTypes = {
	classesLimitExceeded: PropTypes.bool,
	classesOverLimitCount: PropTypes.number,
	classesReviewClick: PropTypes.func,
	contextData: PropTypes.object,
	isImport: PropTypes.bool,
	onSettingChange: PropTypes.func.isRequired,
	settings: PropTypes.object.isRequired,
};

export function GlobalVariablesSettingsRow( {
	contextData,
	isImport,
	onSettingChange,
	settings,
	variablesLimitExceeded,
	variablesOverLimitCount,
	variablesReviewClick,
} ) {
	const variablesExported = isVariablesExported( contextData );
	const variablesNotExported = isImport && ! variablesExported;

	return (
		<SubSettingRow
			label={ __( 'Variables', 'elementor' ) }
			checked={ settings.variables ?? false }
			onChange={ ( isChecked ) => onSettingChange( 'variables', isChecked ) }
			limitExceeded={ isImport && variablesLimitExceeded && ! variablesNotExported }
			overLimitCount={ variablesOverLimitCount }
			onReviewClick={ variablesReviewClick }
			overrideAll={ settings.variablesOverrideAll ?? false }
			onOverrideAllChange={ ( checked ) => onSettingChange( 'variablesOverrideAll', checked ) }
			showOverrideOption={ isImport && ! variablesNotExported }
			notExported={ variablesNotExported }
		/>
	);
}

GlobalVariablesSettingsRow.propTypes = {
	contextData: PropTypes.object,
	isImport: PropTypes.bool,
	onSettingChange: PropTypes.func.isRequired,
	settings: PropTypes.object.isRequired,
	variablesLimitExceeded: PropTypes.bool,
	variablesOverLimitCount: PropTypes.number,
	variablesReviewClick: PropTypes.func,
};

export function DefaultStylesSettingsRow( { contextData, isImport, onSettingChange, settings } ) {
	const defaultStylesExported = isDefaultStylesExported( contextData );

	return (
		<SubSettingRow
			label={ __( 'Default Styles', 'elementor' ) }
			checked={ settings.defaultStyles ?? false }
			onChange={ ( isChecked ) => onSettingChange( 'defaultStyles', isChecked ) }
			notExported={ isImport && ! defaultStylesExported }
		/>
	);
}

DefaultStylesSettingsRow.propTypes = {
	contextData: PropTypes.object,
	isImport: PropTypes.bool,
	onSettingChange: PropTypes.func.isRequired,
	settings: PropTypes.object.isRequired,
};
