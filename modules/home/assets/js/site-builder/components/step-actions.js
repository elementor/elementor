import { Typography, CircularProgress, Box } from '@elementor/ui';
import PropTypes from 'prop-types';
import ArrowRightIcon from '../../icons/arrow-right-icon';
import {
	PlannerInputRow,
	PlannerInputColumn,
	PlannerTextField,
	CreateSiteButton,
} from './styled-components';

export const StepLoader = () => (
	<Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
		<CircularProgress />
	</Box>
);

export const getStepAction = ( stepConfig, handlers ) => {
	if ( stepConfig.hasInput ) {
		return (
			<StepWithInput
				buttonLabel={ stepConfig.buttonLabel }
				placeholder={ stepConfig.placeholder }
				inputValue={ handlers.inputValue }
				onInputChange={ handlers.onInputChange }
				onKeyDown={ handlers.onKeyDown }
				onSubmit={ () => handlers.onSubmit( handlers.inputValue ) }
			/>
		);
	}

	return (
		<StepWithoutInput
			text={ stepConfig.text }
			buttonLabel={ stepConfig.buttonLabel }
			onSubmit={ () => handlers.onSubmit( '' ) }
		/>
	);
};

export const StepWithInput = ( { buttonLabel, inputValue, onInputChange, onKeyDown, onSubmit, placeholder } ) => {
	const canSubmit = Boolean( inputValue.trim() );

	return (
		<PlannerInputRow>
			<PlannerTextField
				placeholder={ placeholder }
				variant="outlined"
				size="small"
				value={ inputValue }
				onChange={ onInputChange }
				onKeyDown={ onKeyDown }
				autoComplete="off"
			/>
			<CreateSiteButton
				variant="contained"
				size="medium"
				endIcon={ <ArrowRightIcon /> }
				onClick={ onSubmit }
				disabled={ ! canSubmit }
			>
				{ buttonLabel }
			</CreateSiteButton>
		</PlannerInputRow>
	);
};

StepWithInput.propTypes = {
	buttonLabel: PropTypes.string.isRequired,
	inputValue: PropTypes.string.isRequired,
	onInputChange: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	placeholder: PropTypes.string.isRequired,
};

export const StepWithoutInput = ( { buttonLabel, text, onSubmit } ) => (
	<PlannerInputColumn>
		<Typography variant="body2" color="text.secondary">
			{ text }
		</Typography>
		<CreateSiteButton
			variant="contained"
			size="medium"
			endIcon={ <ArrowRightIcon /> }
			onClick={ onSubmit }
		>
			{ buttonLabel }
		</CreateSiteButton>
	</PlannerInputColumn>
);

StepWithoutInput.propTypes = {
	buttonLabel: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	onSubmit: PropTypes.func.isRequired,
};
