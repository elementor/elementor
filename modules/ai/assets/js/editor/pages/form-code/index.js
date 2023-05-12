import { useRef, useState } from 'react';
import { Box, Button, Stack, styled } from '@elementor/ui';
import ReactMarkdown from 'react-markdown';
import { codeCssAutocomplete, codeHtmlAutocomplete } from '../../actions-data';
import Loader from '../../components/loader';
import PromptSearch from '../../components/prompt-search';
import PromptSuggestions from '../../components/prompt-suggestions';
import GenerateButton from '../../components/generate-button';
import PromptErrorMessage from '../../components/prompt-error-message';
import CodeBlock from './code-block';
import useCodePrompt from '../../hooks/use-code-prompt';
import PromptCredits from '../../components/prompt-credits';

const CodeDisplayWrapper = styled( Box )( () => ( {
	'& p': {
		mb: '10px',
		fontSize: '13px',
		lineHeight: '1.5',
	},
	'& pre': {
		position: 'relative',
	},
	'& textarea': {
		fontSize: '13px',
		lineHeight: '1.7',
	},
} ) );

const FormCode = ( { onClose, getControlValue, setControlValue, additionalOptions, credits, usagePercentage } ) => {
	const { data, isLoading, error, reset, send, sendUsageData } = useCodePrompt( { ...additionalOptions, credits } );

	const [ prompt, setPrompt ] = useState( '' );

	const lastRun = useRef( () => {} );

	const autocompleteItems = 'css' === additionalOptions?.codeLanguage ? codeCssAutocomplete : codeHtmlAutocomplete;

	const showSuggestions = ! prompt;

	const handleSubmit = async ( event ) => {
		event.preventDefault();

		lastRun.current = () => send( prompt );

		lastRun.current();
	};

	const applyPrompt = ( inputText ) => {
		sendUsageData();

		setControlValue( inputText );

		onClose();
	};

	if ( isLoading ) {
		return <Loader />;
	}

	return (
		<>
			{ error && <PromptErrorMessage error={ error } onRetry={ lastRun.current } sx={ { mb: 6 } } /> }

			{ ! data.result && (
				<Box component="form" onSubmit={ handleSubmit }>
					<Box sx={ { pb: 4 } }>
						<PromptSearch
							placeholder={ __( 'Describe the code you want to use...', 'elementor' ) }
							name="prompt"
							value={ prompt }
							color="secondary"
							onChange={ ( event ) => setPrompt( event.target.value ) }
						/>
					</Box>

					{ showSuggestions && <PromptSuggestions suggestions={ autocompleteItems } onSelect={ setPrompt } /> }

					<Stack direction="row" alignItems="center" sx={ { py: 4, mt: 8 } }>
						<PromptCredits usagePercentage={ usagePercentage } />

						<Stack direction="row" justifyContent="flex-end" flexGrow={ 1 }>
							<GenerateButton>
								{ __( 'Generate code', 'elementor' ) }
							</GenerateButton>
						</Stack>
					</Stack>
				</Box>
			) }

			{ data.result && (
				<CodeDisplayWrapper>
					<ReactMarkdown components={ { code: ( props ) => (
						<CodeBlock { ...props } defaultValue={ getControlValue() } onInsert={ applyPrompt } />
					) } }>
						{ data.result }
					</ReactMarkdown>

					<Stack direction="row" alignItems="center" sx={ { mt: 8 } }>
						<PromptCredits usagePercentage={ usagePercentage } />

						<Stack direction="row" gap={ 3 } justifyContent="flex-end" flexGrow={ 1 }>
							<Button size="small" color="secondary" variant="text" onClick={ reset }>
								{ __( 'New prompt', 'elementor' ) }
							</Button>
						</Stack>
					</Stack>
				</CodeDisplayWrapper>
			) }
		</>
	);
};

FormCode.propTypes = {
	onClose: PropTypes.func.isRequired,
	getControlValue: PropTypes.func.isRequired,
	setControlValue: PropTypes.func.isRequired,
	additionalOptions: PropTypes.shape( {
		codeLanguage: PropTypes.string,
		htmlMarkup: PropTypes.string,
		elementId: PropTypes.string,
		initialCredits: PropTypes.number,
	} ),
	credits: PropTypes.number,
	usagePercentage: PropTypes.number,
};

export default FormCode;
