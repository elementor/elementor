import { useEffect, useState } from 'react';
import { Box, Button, Stack, styled, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { hoverEffectAutocomplete, motionEffectAutocomplete } from '../../actions-data';
import Loader from '../../components/loader';
import PromptSearch from '../../components/prompt-search';
import PromptSuggestions from '../../components/prompt-suggestions';
import GenerateButton from '../../components/generate-button';
import PromptErrorMessage from '../../components/prompt-error-message';
import { useRequestIds } from '../../context/requests-ids';
import { VoicePromotionAlert } from '../../components/voice-promotion-alert';
import useAnimationPrompt from '../../hooks/use-animation-prompt';

const CodeDisplayWrapper = styled( Box )( () => ( {
	'& p': {
		mb: '10px',
		fontSize: '14px',
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

const FormAnimation = ( { onClose, getControlValue, setControlValue, additionalOptions, credits, children } ) => {
	const { data, isLoading, error, reset, send, sendUsageData } = useAnimationPrompt( additionalOptions.animationType, additionalOptions.widgetType, credits );
	const [ prompt, setPrompt ] = useState( '' );
	const { setGenerate } = useRequestIds();
	const [ animationSummary, setAnimationSummary ] = useState( '' );
	const [ prevControlValue, setPrevControlValue ] = useState();

	const autocompleteItems = 'hover' === additionalOptions.animationType ? hoverEffectAutocomplete : motionEffectAutocomplete;

	const showSuggestions = ! prompt;

	const handleSubmit = async ( event ) => {
		event.preventDefault();
		setGenerate();
		send( { prompt } );
	};

	useEffect( () => {
		if ( data.result ) {
			showPreview( data.result );
		}
	}, [ data ] );

	useEffect( () => {
		return () => {
			restorePrevSettings();
		};
	}, [] );

	const showPreview = ( result ) => {
		const summary = Object.keys( result )
			.filter( ( key ) => result[ key ].label )
			.map( ( key ) => {
				const item = result[ key ];
				const tabs = '&nbsp;'.repeat( item.tabs );
				const bulletIcon = item.tabs > 0 ? '&#8226; ' : '';
				const label = item.isParent ? `<br/><b>${ item.label }:</b>` : `${ bulletIcon } ${ item.label }`;
				return `${ tabs }${ label }`;
			} )
			.join( '<br/>' );

		const title = `${ __( 'Here’s a breakdown of what was done for creating the animation', 'elementor' ) }`;
		setAnimationSummary( `<b>${ title }:</b><br/>${ summary }` );

		const controlValue = getControlValue();
		setPrevControlValue( controlValue );
		elementor.documents.getCurrent().history.setActive( false );
		setControlValue( getValidElementor( result ) );
	};

	const restorePrevSettings = () => {
		setControlValue( prevControlValue );
		elementor.documents.getCurrent().history.setActive( true );
	};

	const getValidElementor = ( result ) => {
		return Object.entries( result )
			.filter( ( [ , valueObj ] ) => valueObj.hasOwnProperty( 'value' ) )
			.reduce( ( previousValue, [ key, valueObj ] ) => {
				previousValue[ key ] = valueObj.value;
				return previousValue;
			}, {} );
	};

	const applyPrompt = ( result ) => {
		sendUsageData();
		restorePrevSettings();

		const validElementorSettings = getValidElementor( result );

		setControlValue( validElementorSettings );
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
							placeholder={ __( 'Describe the animation you want to create...', 'elementor' ) }
							name="prompt"
							value={ prompt }
							color="secondary"
							onChange={ ( event ) => setPrompt( event.target.value ) }
						/>
					</Box>

					{ showSuggestions && <PromptSuggestions suggestions={ autocompleteItems } onSelect={ setPrompt }>
					</PromptSuggestions> }

					<Stack direction="row" alignItems="center" sx={ { py: 1.5, mt: 4 } }>
						<Stack direction="row" justifyContent="flex-end" flexGrow={ 1 }>
							<GenerateButton>
								{ __( 'Generate Animation', 'elementor' ) }
							</GenerateButton>
						</Stack>
					</Stack>
				</Box>
			) }

			{ data.result && animationSummary && (
				<CodeDisplayWrapper>
					<Box
						sx={ {
							backgroundColor: 'rgba(0, 0, 0, 0.06); ',
							padding: '1em',
							borderRadius: '4px',
							width: '100%',
							height: '260px',
							overflowX: 'auto',
						} }
					>
						<Typography
							variant="body1"
							dangerouslySetInnerHTML={ { __html: animationSummary } } />
					</Box>
					<VoicePromotionAlert introductionKey="ai-context-animation-promotion" />

					<Stack direction="row" alignItems="center" sx={ { mt: 4 } }>
						<Stack direction="row" gap={ 1 } justifyContent="flex-end" flexGrow={ 1 }>
							<Button size="small" color="secondary" variant="text" onClick={ () => {
								restorePrevSettings();
								reset();
							} }>
								{ __( 'New prompt', 'elementor' ) }
							</Button>
							<Button size="small" variant="contained" color="primary"
								onClick={ () => applyPrompt( data.result ) }>
								{ __( 'Use animation', 'elementor' ) }
							</Button>
						</Stack>
					</Stack>
				</CodeDisplayWrapper>
			) }
		</>
	);
};

FormAnimation.propTypes = {
	onClose: PropTypes.func.isRequired,
	getControlValue: PropTypes.func.isRequired,
	setControlValue: PropTypes.func.isRequired,
	additionalOptions: PropTypes.shape( {
		animationType: PropTypes.string,
		widgetType: PropTypes.string,
	} ),
	credits: PropTypes.number,
	children: PropTypes.node,
};

export default FormAnimation;
