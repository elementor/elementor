import { useRef, useState } from 'react';
import { Box, Button, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { AIIcon, ExpandIcon, MessageIcon, ShrinkIcon } from '@elementor/icons';
import Loader from '../../components/loader';
import PromptSearch from '../../components/prompt-search';
import Textarea from '../../components/textarea';
import PromptSuggestions from '../../components/prompt-suggestions';
import PromptLibraryLink from '../../components/prompt-library-link';
import PromptActionSelection from '../../components/prompt-action-selection';
import GenerateButton from '../../components/generate-button';
import PromptAction from '../../components/prompt-action';
import PromptErrorMessage from '../../components/prompt-error-message';
import useTextPrompt from '../../hooks/use-text-prompt';
import { textareaAutocomplete, textAutocomplete, translateLanguages, vocalTones } from '../../actions-data';
import {
	ACTION_TYPES,
	useSubscribeOnPromptHistoryAction,
} from '../../components/prompt-history/context/prompt-history-action-context';
import { useRequestIds } from '../../context/requests-ids';
import { VoicePromotionAlert } from '../../components/voice-promotion-alert';

const promptActions = [
	{
		label: __( 'Simplify language', 'elementor' ),
		icon: <MessageIcon fontSize="small" />, value: 'Simplify the language of the following message',
	},
	{
		label: __( 'Make it longer', 'elementor' ),
		icon: <ExpandIcon fontSize="small" />, value: 'Make the following message longer',
	},
	{
		label: __( 'Make it shorter', 'elementor' ),
		icon: <ShrinkIcon fontSize="small" />, value: 'Make the following message shorter',
	},
	{
		label: __( 'Fix spelling & grammar', 'elementor' ),
		icon: <AIIcon fontSize="small" />, value: 'Fix the spelling and grammar of the following message',
	},
];

const promptInstructions = [
	{
		label: __( 'Change tone', 'elementor' ),
		options: vocalTones, getInstruction: ( value ) => `Change the tone of the following message to ${ value }`,
	},
	{
		label: __( 'Translate to', 'elementor' ),
		options: translateLanguages, getInstruction: ( value ) => `Translate the following message to ${ value }`,
	},
];

const FormText = (
	{
		type,
		onClose,
		getControlValue,
		setControlValue,
		additionalOptions,
		credits,
		children,
	},
) => {
	const initialValue = getControlValue() === additionalOptions?.defaultValue ? '' : getControlValue();

	const { data, isLoading, error: txtGenErr, setResult, reset, send, sendUsageData } = useTextPrompt( {
		result: initialValue?.result ?? initialValue,
		credits: initialValue?.credits ?? credits,
		responseId: initialValue?.responseId,
	} );
	const error = txtGenErr || additionalOptions?.initError;

	const [ prompt, setPrompt ] = useState( '' );
	const { setGenerate } = useRequestIds();

	useSubscribeOnPromptHistoryAction( [
		{
			type: ACTION_TYPES.REUSE,
			handler( action ) {
				reset();
				setPrompt( action.data );
			},
		},
		{
			type: ACTION_TYPES.EDIT,
			handler( action ) {
				setResult( action.data );
			},
		},
	] );

	const searchField = useRef( null );

	const resultField = useRef( null );

	const lastRun = useRef( additionalOptions.initRetry ?? ( () => {} ) );

	const autocompleteItems = 'textarea' === type ? textareaAutocomplete : textAutocomplete;

	const showSuggestions = ! prompt;

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setGenerate();
		lastRun.current = () => send( { prompt } );

		lastRun.current();
	};

	const handleCustomInstruction = async ( instruction ) => {
		setGenerate();
		lastRun.current = () => send( { input: resultField.current.value, instruction } );

		lastRun.current();
	};

	const handleSuggestion = ( suggestion ) => {
		setPrompt( suggestion + ' ' );
		searchField.current.focus();
	};

	const applyPrompt = () => {
		sendUsageData();

		setControlValue( resultField.current.value );

		onClose();
	};

	if ( isLoading ) {
		return <Loader />;
	}

	return (
		<>
			{ error && <PromptErrorMessage error={ error } onRetry={ lastRun.current } sx={ { mb: 2.5 } } /> }

			{ children }

			{ ! data.result && (
				<Box component="form" onSubmit={ handleSubmit }>
					<Box sx={ { mb: 2.5 } }>
						<PromptSearch
							ref={ searchField }
							placeholder={ __( 'Describe the text and tone you want to use...', 'elementor' ) }
							name="prompt"
							value={ prompt }
							onChange={ ( event ) => setPrompt( event.target.value ) }
						/>
					</Box>

					{ showSuggestions && (
						<PromptSuggestions
							suggestions={ autocompleteItems }
							onSelect={ handleSuggestion }
							suggestionFilter={ ( suggestion ) => suggestion + '...' }
						>
							<PromptLibraryLink libraryLink="https://go.elementor.com/ai-prompt-library-text/" />
						</PromptSuggestions>
					) }

					<Stack direction="row" alignItems="center" sx={ { py: 1.5, mt: 4 } }>
						<Stack direction="row" justifyContent="flex-end" flexGrow={ 1 }>
							<GenerateButton>
								{ __( 'Generate text', 'elementor' ) }
							</GenerateButton>
						</Stack>
					</Stack>
				</Box>
			) }

			{ data.result && (
				<Box sx={ { mt: 1 } }>
					<Textarea
						fullWidth
						ref={ resultField }
						value={ data.result }
						helperText={ __( 'Text generated by AI may be inaccurate or offensive.', 'elementor' ) }
						onChange={ ( event ) => setResult( event.target.value ) }
					/>

					<Grid container spacing={ 1 } sx={ { mt: 2.5 } }>
						{
							promptActions.map( ( { label, icon, value } ) => (
								<Grid item key={ label }>
									<PromptAction label={ label } icon={ icon }
										onClick={ () => handleCustomInstruction( value ) } />
								</Grid>
							) )
						}
					</Grid>

					<Stack direction="row" alignItems="center" spacing={ 1 } sx={ { mt: 2.5 } }>
						{
							promptInstructions.map( ( { label, options, getInstruction } ) => (
								<PromptActionSelection
									key={ label }
									label={ label }
									options={ options }
									onChange={ ( event ) => handleCustomInstruction( getInstruction( event.target.value ) ) }
								/>
							) )
						}
					</Stack>
					<VoicePromotionAlert introductionKey="ai-context-text-promotion" sx={ { mb: 2 } } />

					<Stack direction="row" alignItems="center" sx={ { my: 1 } }>
						<Stack direction="row" gap={ 1 } justifyContent="flex-end" flexGrow={ 1 }>
							<Button size="small" color="secondary" variant="text" onClick={ reset }>
								{ __( 'New prompt', 'elementor' ) }
							</Button>
							<Button size="small" variant="contained" color="primary" onClick={ applyPrompt }>
								{ __( 'Use text', 'elementor' ) }
							</Button>
						</Stack>
					</Stack>
				</Box>
			) }
		</>
	);
};

FormText.propTypes = {
	type: PropTypes.string.isRequired,
	controlType: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	getControlValue: PropTypes.func.isRequired,
	setControlValue: PropTypes.func.isRequired,
	additionalOptions: PropTypes.object,
	credits: PropTypes.number,
	usagePercentage: PropTypes.number,
	children: PropTypes.node,
};

export default FormText;
