import { useState, useRef, useEffect } from 'react';
import { Box, Stack, CircularProgress, Divider, Button, styled } from '@elementor/ui';
import PromptSearch from '../../components/prompt-search';
import GenerateSubmit from '../form-media/components/generate-submit';
import EnhanceButton from '../form-media/components/enhance-button';
import PromptErrorMessage from '../../components/prompt-error-message';
import useLayoutPrompt from './hooks/use-layout-prompt';
import usePromptEnhancer from '../form-media/hooks/use-image-prompt-enhancer';
import SkeletonPlaceholders from './components/skeleton-placeholders';
import ScreenshotContainer from './components/screenshot-container';

const SCREENSHOT_HEIGHT = '138px';

const ScreenshotImage = styled( 'img' )( ( { theme } ) => ( {
	width: '100%',
	borderRadius: theme.border.size.md,
} ) );

const FormLayout = ( { onClose, onInsert, onGenerationStart, onGenerationEnd, onSelect } ) => {
	const { data: templatesData, isLoading: isGeneratingTemplates, error, send, sendUsageData } = useLayoutPrompt();

	const [ prompt, setPrompt ] = useState( '' );

	const { isEnhancing, enhance } = usePromptEnhancer();

	const [ screenshotsData, setScreenshotsData ] = useState( [] );

	const [ selectedScreenshotIndex, setSelectedScreenshotIndex ] = useState( -1 );

	const [ isTakingScreenshots, setIsTakingScreenshots ] = useState( false );

	const lastRun = useRef( () => {} );

	const isLoading = isGeneratingTemplates || isTakingScreenshots;

	const selectedTemplate = screenshotsData[ selectedScreenshotIndex ]?.template;

	const handleSubmit = ( event ) => {
		event.preventDefault();

		onGenerationStart();

		lastRun.current = () => send( prompt );

		lastRun.current();
	};

	const handleEnhance = () => {
		enhance( prompt ).then( ( { result } ) => setPrompt( result ) );
	};

	const applyTemplate = () => {
		sendUsageData();

		onInsert( selectedTemplate );

		onClose();
	};

	useEffect( () => {
		if ( templatesData?.result ) {
			setIsTakingScreenshots( true );
			setSelectedScreenshotIndex( -1 );

			const templates = Array( 3 ).fill( templatesData?.result.elements[ 0 ] );

			onGenerationEnd( templates ).then( ( generatedData ) => {
				setScreenshotsData( generatedData );
				setIsTakingScreenshots( false );
				setSelectedScreenshotIndex( 0 );
			} );
		}
	}, [ templatesData ] );

	useEffect( () => {
		if ( -1 === selectedScreenshotIndex ) {
			return;
		}

		onSelect( selectedTemplate );
	}, [ selectedScreenshotIndex ] );

	return (
		<>
			{ error && (
				<Box sx={ { pt: 5, px: 5, pb: 0 } }>
					<PromptErrorMessage error={ error } onRetry={ lastRun.current } />
				</Box>
			) }

			<Box component="form" onSubmit={ handleSubmit } sx={ { p: 5 } }>
				<Stack direction="row" alignItems="flex-start" gap={ 3 }>
					<PromptSearch
						name="prompt"
						value={ prompt }
						disabled={ isLoading }
						InputProps={ { autoComplete: 'off' } }
						onChange={ ( event ) => setPrompt( event.target.value ) }
						sx={ {
							'& .MuiOutlinedInput-notchedOutline': { borderRadius: '4px' },
							'& .MuiInputBase-root.MuiOutlinedInput-root, & .MuiInputBase-root.MuiOutlinedInput-root:focus': {
								px: 4,
								py: 0,
							},
						} }
						placeholder={ __( 'Describe the desired layout you want to generate...', 'elementor' ) }
						multiline
						maxRows={ 3 }
					/>

					<EnhanceButton
						size="medium"
						disabled={ isLoading || '' === prompt }
						isLoading={ isEnhancing }
						onClick={ enhance }
					/>

					<GenerateSubmit
						fullWidth={ false }
						disabled={ isLoading || '' === prompt }
						sx={ {
							minWidth: '100px',
							// TODO: remove once exist in the UI library.
							borderRadius: ( { border } ) => border.size.md,
						} }
					>
						{
							isLoading && ! isEnhancing
								? <CircularProgress color="secondary" size={ 16 } />
								: __( 'Generate', 'elementor' ) }
					</GenerateSubmit>
				</Stack>
			</Box>

			{
				( screenshotsData.length > 0 || isLoading ) && (
					<>
						<Divider />

						<Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, p: 5 } }>
							{
								isLoading ? (
									<SkeletonPlaceholders height={ SCREENSHOT_HEIGHT } />
								) : (
									screenshotsData.map( ( { screenshot }, index ) => (
										<ScreenshotContainer
											key={ screenshot }
											height={ SCREENSHOT_HEIGHT }
											selected={ selectedScreenshotIndex === index }
											onClick={ () => setSelectedScreenshotIndex( index ) }
										>
											<ScreenshotImage src={ screenshot } decoding="async" />
										</ScreenshotContainer>
									) )
								)
							}
						</Box>

						{
							( screenshotsData.length > 0 && ! isLoading ) && (
								<Box sx={ { pt: 0, px: 5, pb: 5 } } display="flex" justifyContent="flex-end">
									<Button
										size="small"
										variant="contained"
										onClick={ applyTemplate }
										sx={ {
											// TODO: remove once exist in the UI library.
											borderRadius: ( { border } ) => border.size.md,
										} }
									>
										{ __( 'Use Layout', 'elementor' ) }
									</Button>
								</Box>
							)
						}
					</>
				)
			}
		</>
	);
};

FormLayout.propTypes = {
	onClose: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onGenerationStart: PropTypes.func.isRequired,
	onGenerationEnd: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default FormLayout;
