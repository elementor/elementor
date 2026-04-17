import { Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import ArrowRightIcon from '../../icons/arrow-right-icon';
import {
	PlannerInputRow,
	PlannerTextField,
	CreateSiteButton,
} from './styled-components';

export const STEP_TYPES = Object.freeze( {
	WITH_INPUT: 'withInput',
	WITHOUT_INPUT: 'withoutInput',
} );

export const getStepAction = ( stepConfig, handlers ) => {
	if ( STEP_TYPES.WITH_INPUT === stepConfig.type ) {
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

export const StepWithInput = ( { buttonLabel, inputValue, onInputChange, onKeyDown, onSubmit, placeholder } ) => (
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
		>
			{ buttonLabel }
		</CreateSiteButton>
	</PlannerInputRow>
);

StepWithInput.propTypes = {
	buttonLabel: PropTypes.string.isRequired,
	inputValue: PropTypes.string.isRequired,
	onInputChange: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	placeholder: PropTypes.string.isRequired,
};

export const StepWithoutInput = ( { buttonLabel, text, onSubmit } ) => (
	<PlannerInputRow>
		<Typography variant="body1" color="text.secondary">
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
	</PlannerInputRow>
);

StepWithoutInput.propTypes = {
	buttonLabel: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	onSubmit: PropTypes.func.isRequired,
};
