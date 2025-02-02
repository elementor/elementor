import { useRef, useEffect, useState } from 'react';
import { Box, Button, Stack, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { codeCssAutocomplete, codeHtmlAutocomplete } from '../../actions-data';
import Loader from '../../components/loader';
import PromptSearch from '../../components/prompt-search';
import PromptSuggestions from '../../components/prompt-suggestions';
import GenerateButton from '../../components/generate-button';
import PromptErrorMessage from '../../components/prompt-error-message';
import CodeBlock from './code-block';
import useCodePrompt from '../../hooks/use-code-prompt';
import {
	ACTION_TYPES,
	useSubscribeOnPromptHistoryAction,
} from '../../components/prompt-history/context/prompt-history-action-context';
import PromptLibraryLink from '../../components/prompt-library-link';
import { useRequestIds } from '../../context/requests-ids';
import { VoicePromotionAlert } from '../../components/voice-promotion-alert';
import { splitText } from './splitTextResult';

const generateUniqueId = () => `custom-css-${ Math.random().toString( 36 ).substr( 2, 9 ) }`;

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

const FormCode = ( { onClose, getControlValue, setControlValue, additionalOptions, credits, children } ) => {
	const { data, isLoading, error, reset, send, sendUsageData } = useCodePrompt( { ...additionalOptions, credits } );
	const { code, details } = splitText( data.result );
	const [ prompt, setPrompt ] = useState( '' );
	const { setGenerate } = useRequestIds();
	const styleTagId = useRef( generateUniqueId() );

	useSubscribeOnPromptHistoryAction( [
		{
			type: ACTION_TYPES.REUSE,
			handler( action ) {
				reset();
				setPrompt( action.data );
			},
		},
	] );

	const lastRun = useRef( () => {} );
	let autocompleteItems = codeHtmlAutocomplete;
	let promptLibraryLink = '';

	if ( 'css' === additionalOptions?.codeLanguage ) {
		autocompleteItems = codeCssAutocomplete;
		promptLibraryLink = 'https://go.elementor.com/ai-prompt-library-css/';
	} else if ( additionalOptions?.htmlMarkup ) {
		promptLibraryLink = 'https://go.elementor.com/ai-prompt-library-html/';
	} else {
		promptLibraryLink = 'https://go.elementor.com/ai-prompt-library-custom-code/';
	}

	const showSuggestions = ! prompt;

	const handleSubmit = async ( event ) => {
		event.preventDefault();
		setGenerate();
		lastRun.current = () => send( { prompt } );
		const response = await lastRun.current();

		if ( 'css' === additionalOptions?.codeLanguage && response.result ) {
			showCssPreview( splitText( response.result ).code );
		}
	};

	useEffect( () => {
		return () => {
			removeStyleTag();
		};
	}, [] );

	const showCssPreview = ( cssCode ) => {
		const parsedCssCode = parseCSS( cssCode );
		insertStyleTag( parsedCssCode );
	};

	const parseCSS = ( cssCode ) => {
		const elementId = additionalOptions?.elementId;
		const selector = 'document' === elementId
			? elementor.config.document.settings.cssWrapperSelector
			: `.elementor-element.elementor-element-${ elementId }`;

		return cssCode && cssCode
			.replace( /`/g, '' ) // Remove backticks if any
			.replace( /^css\s*/i, '' ) // Remove "css" prefix if any, case-insensitive
			.replace( /selector/g, selector ); // Replace `selector` with the actual selector
	};

	const insertStyleTag = ( cssCode ) => {
		const style = document.createElement( 'style' );
		style.id = styleTagId.current;
		style.appendChild( document.createTextNode( cssCode ) );
		elementorFrontend.elements.$body[ 0 ].appendChild( style );
	};

	const removeStyleTag = () => {
		const styleTag = elementorFrontend.elements.$body[ 0 ].querySelector( `#${ styleTagId.current }` );
		if ( styleTag ) {
			styleTag.remove();
		}
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
			{ error && <PromptErrorMessage error={ error } onRetry={ lastRun.current } sx={ { mb: 2.5 } } /> }

			{ children }

			{ ! data.result && (
				<Box component="form" onSubmit={ handleSubmit }>
					<Box sx={ { pb: 1.5 } }>
						<PromptSearch
							placeholder={ __( 'Describe the code you want to use...', 'elementor' ) }
							name="prompt"
							value={ prompt }
							color="secondary"
							onChange={ ( event ) => setPrompt( event.target.value ) }
						/>
					</Box>

					{ showSuggestions && <PromptSuggestions suggestions={ autocompleteItems } onSelect={ setPrompt }>
						<PromptLibraryLink libraryLink={ promptLibraryLink } />
					</PromptSuggestions> }

					<Stack direction="row" alignItems="center" sx={ { py: 1.5, mt: 4 } }>
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
					<ReactMarkdown components={ {
						code: ( props ) => (
							<CodeBlock { ...props } defaultValue={ getControlValue() } onInsert={ applyPrompt } />
						),
					} }>
						{ code }
					</ReactMarkdown>
					{ details }
					<VoicePromotionAlert introductionKey="ai-context-code-promotion" />

					<Stack direction="row" alignItems="center" sx={ { mt: 4 } }>
						<Stack direction="row" gap={ 1 } justifyContent="flex-end" flexGrow={ 1 }>
							<Button size="small" color="secondary" variant="text" onClick={ () => {
								removeStyleTag(); reset();
							} }>
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
	children: PropTypes.node,
};

export default FormCode;
