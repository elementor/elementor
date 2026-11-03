import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import TextField from '@elementor/ui/TextField';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminInputResetSx } from '../../components/wp-admin-sx';
import { FIX_WITH_PREFERENCE, REDUCED_MOTION_SX, SCANNER_COLORS, SCANNER_LAYOUT, SCANNER_MOTION } from '../scanner-constants';

const DRAWER_RISE = '6px';

const drawerSx = {
	animation: `scannerDrawerIn ${ SCANNER_MOTION.drawerMs }ms ${ SCANNER_MOTION.easeOutExpo }`,
	'@keyframes scannerDrawerIn': {
		from: { opacity: 0, transform: `translateY(${ DRAWER_RISE })` },
		to: { opacity: 1, transform: 'translateY(0)' },
	},
	...REDUCED_MOTION_SX,
};

const ExplanationContent = ( { check } ) => (
	<Stack spacing={ 2 }>
		{ check.evidence && (
			<Stack spacing={ 0.5 }>
				<Typography variant="caption" color="text.primary">{ __( 'What we found', 'elementor' ) }</Typography>
				<Typography variant="caption" color="text.secondary">{ check.evidence }</Typography>
			</Stack>
		) }
		<Stack spacing={ 0.5 }>
			<Typography variant="caption" color="text.primary">{ __( 'What it means', 'elementor' ) }</Typography>
			<Typography variant="caption" color="text.secondary">{ check.explanation.whatItMeans }</Typography>
		</Stack>
		<Stack spacing={ 0.5 }>
			<Typography variant="caption" color="text.primary">{ __( 'How to fix it manually', 'elementor' ) }</Typography>
			<Typography variant="caption" color="text.secondary">{ check.explanation.howToFix }</Typography>
		</Stack>
	</Stack>
);

ExplanationContent.propTypes = {
	check: PropTypes.object.isRequired,
};

const PreferenceContent = ( { check, value, onChange, onSave } ) => {
	const handleKeyDown = ( event ) => {
		if ( 'Enter' !== event.key || event.shiftKey ) {
			return;
		}

		event.preventDefault();
		onSave( check );
	};

	return (
		<Stack spacing={ 2 }>
			{ check.technicalName && (
				<Typography variant="caption" color="text.secondary">{ check.technicalName }</Typography>
			) }
			<Typography variant="caption" color="text.secondary">{ check.explanation.whatItMeans }</Typography>
			<TextField
				size="small"
				fullWidth
				multiline
				rows={ SCANNER_LAYOUT.preferenceRows }
				value={ value }
				placeholder={ check.preferencePlaceholder }
				onChange={ ( event ) => onChange( check.id, event.target.value ) }
				onKeyDown={ handleKeyDown }
				inputProps={ { 'aria-label': check.title } }
				sx={ { ...wpAdminInputResetSx, bgcolor: SCANNER_COLORS.paper } }
			/>
		</Stack>
	);
};

PreferenceContent.propTypes = {
	check: PropTypes.object.isRequired,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
};

export const FixRowDrawer = ( { check, preferenceValue, onPreferenceChange, onSavePreference } ) => (
	<Box mt={ 2 } mx={ 2 } mb={ 1.5 } p={ 2 } bgcolor={ SCANNER_COLORS.promptBackground } borderRadius={ SCANNER_LAYOUT.drawerRadius } sx={ drawerSx }>
		{ FIX_WITH_PREFERENCE === check.fixWith ? (
			<PreferenceContent check={ check } value={ preferenceValue } onChange={ onPreferenceChange } onSave={ onSavePreference } />
		) : (
			<ExplanationContent check={ check } />
		) }
	</Box>
);

FixRowDrawer.propTypes = {
	check: PropTypes.object.isRequired,
	preferenceValue: PropTypes.string.isRequired,
	onPreferenceChange: PropTypes.func.isRequired,
	onSavePreference: PropTypes.func.isRequired,
};
