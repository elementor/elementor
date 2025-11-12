import { useState } from 'react';
import {
	Box,
	Button,
	FormControlLabel,
	Radio,
	RadioGroup,
	Select,
	MenuItem,
	TextField,
	Input,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ImportForm = ( {
	importType,
	setImportType,
	urlContent,
	setUrlContent,
	selectorContent,
	setSelectorContent,
	htmlContent,
	setHtmlContent,
	postType,
	setPostType,
	onSubmit,
	isLoading,
} ) => {
	const [ urlError, setUrlError ] = useState( '' );
	const [ selectedExample, setSelectedExample ] = useState( '' );

	const htmlExamples = [
		{
			label: __( 'Widget html', 'elementor' ),
			code: '<div><h1>Updated Content</h1><p>This will update an existing post.</p></div>',
		},
	];

	const handleSubmit = ( e ) => {
		e.preventDefault();

		if ( 'url' === importType && ! urlContent.trim() ) {
			return;
		}

		if ( 'html' === importType && ! htmlContent.trim() ) {
			return;
		}

		if ( 'url' === importType && urlContent && ! validateUrl( urlContent ) ) {
			setUrlError( __( 'Please enter a valid absolute URL', 'elementor' ) );
			return;
		}

		setUrlError( '' );
		onSubmit();
	};

	const validateUrl = ( url ) => {
		if ( ! url ) {
			return true;
		}

		try {
			const urlObj = new URL( url );
			return 'http:' === urlObj.protocol || 'https:' === urlObj.protocol;
		} catch {
			return false;
		}
	};

	const handleUrlChange = ( e ) => {
		setUrlContent( e.target.value );
		if ( urlError && validateUrl( e.target.value ) ) {
			setUrlError( '' );
		}
	};

	const handleExampleSelect = ( e ) => {
		const exampleId = e.target.value;
		setSelectedExample( exampleId );
		if ( exampleId ) {
			const example = htmlExamples.find( ( ex ) => ex.label === exampleId );
			if ( example ) {
				setHtmlContent( example.code );
			}
		}
	};

	const urlPlaceholder = 'https://elementor.com';
	const htmlPlaceholder = `<style>
  .hero-section { 
    background-color: #f0f0f0; 
    padding: 40px; 
  }
  .hero-title { 
    color: #333; 
    font-size: 32px; 
    text-align: center; 
  }
</style>
<div class="hero-section">
  <h1 class="hero-title">Welcome to Our Site</h1>
  <p>This is a hero section with custom styling.</p>
  <button style="background-color: #007cba; color: white; padding: 10px 20px;">Get Started</button>
</div>`;

	const isSubmitDisabled = isLoading ||
		( 'url' === importType && ( ! urlContent.trim() || ! validateUrl( urlContent ) ) ) ||
		( 'html' === importType && ! htmlContent.trim() );

	return (
		<Box sx={ { maxWidth: '800px', mt: 3 } }>
			<form onSubmit={ handleSubmit }>
				<Stack spacing={ 3 }>
					<Box>
						<Typography variant="caption" component="label" color="text.secondary" sx={ { mb: 1, display: 'block' } }>
							{ __( 'Import Type', 'elementor' ) }
						</Typography>
						<RadioGroup
							row
							value={ importType }
							onChange={ ( e ) => setImportType( e.target.value ) }
						>
							<FormControlLabel
								value="url"
								control={
									<Radio
										sx={ {
											'&.Mui-checked': {
												color: 'black',
											},
										} }
									/>
								}
								label={ __( 'URL', 'elementor' ) }
								sx={ {
									'&.Mui-checked .MuiFormControlLabel-label': {
										fontWeight: 'normal',
										color: 'black',
									},
									'& .MuiFormControlLabel-label': {
										color: 'url' === importType ? 'black' : 'inherit',
										fontWeight: 'url' === importType ? 'normal' : 'normal',
									},
								} }
							/>
							<FormControlLabel
								value="html"
								control={
									<Radio
										sx={ {
											'&.Mui-checked': {
												color: 'black',
											},
										} }
									/>
								}
								label={ __( 'HTML/CSS', 'elementor' ) }
								sx={ {
									'&.Mui-checked .MuiFormControlLabel-label': {
										fontWeight: 'normal',
										color: 'black',
									},
									'& .MuiFormControlLabel-label': {
										color: 'html' === importType ? 'black' : 'inherit',
										fontWeight: 'html' === importType ? 'normal' : 'normal',
									},
								} }
							/>
						</RadioGroup>
					</Box>

					{ 'url' === importType && (
						<>
							<Box>
								<Typography variant="caption" component="label" color="text.secondary" sx={ { mb: 0.5, display: 'block' } }>
									{ __( 'URL', 'elementor' ) }
								</Typography>
								<Input
									fullWidth
									size="large"
									value={ urlContent }
									onChange={ handleUrlChange }
									placeholder={ urlPlaceholder }
									error={ !! urlError }
									sx={ {
										mb: urlError ? 0.5 : 0,
										'& input[type="text"]:focus': {
											outline: 'none !important',
											boxShadow: 'none !important',
											border: 'none !important',
										},
										'& .MuiInputBase-input:focus': {
											outline: 'none !important',
											boxShadow: 'none !important',
											border: 'none !important',
										},
										'& input.MuiInputBase-input.MuiInput-input': {
											boxShadow: 'none !important',
											border: 'none !important',
											padding: '5px 10px !important',
										},
									} }
								/>
								{ urlError && (
									<Typography color="error.main" variant="caption" sx={ { display: 'block' } }>
										{ urlError }
									</Typography>
								) }
							</Box>
							<Box>
								<Typography variant="caption" component="label" color="text.secondary" sx={ { mb: 0.5, display: 'block' } }>
									{ __( 'Selector (Optional)', 'elementor' ) }
								</Typography>
								<Input
									fullWidth
									size="large"
									value={ selectorContent }
									onChange={ ( e ) => setSelectorContent( e.target.value ) }
									placeholder={ '.classname, #id' }
									sx={ {
										'& input[type="text"]:focus': {
											outline: 'none !important',
											boxShadow: 'none !important',
											border: 'none !important',
										},
										'& .MuiInputBase-input:focus': {
											outline: 'none !important',
											boxShadow: 'none !important',
											border: 'none !important',
										},
										'& input.MuiInputBase-input.MuiInput-input': {
											boxShadow: 'none !important',
											border: 'none !important',
											padding: '5px 10px !important',
										},
									} }
								/>
								<Typography variant="caption" color="text.secondary" sx={ { mt: 0.5, display: 'block' } }>
									{ __( 'CSS selector to extract specific content from the page', 'elementor' ) }
								</Typography>
							</Box>
						</>
					) }

					{ 'html' === importType && (
						<Box sx={ { position: 'relative' } }>
							<Box
								sx={ {
									position: 'absolute',
									top: -60,
									right: -70,
									zIndex: 1,
									minWidth: '200px',
								} }
							>
								<Select
									value={ selectedExample }
									onChange={ handleExampleSelect }
									displayEmpty
									size="small"
									sx={ {
										backgroundColor: 'background.paper',
										'& .MuiSelect-select': {
											padding: '6px 32px 6px 12px',
										},
									} }
								>
									<MenuItem value="">
										<em>{ __( 'Import Examples', 'elementor' ) }</em>
									</MenuItem>
									{ htmlExamples.map( ( example ) => (
										<MenuItem key={ example.label } value={ example.label }>
											{ example.label }
										</MenuItem>
									) ) }
								</Select>
							</Box>
							<TextField
								value={ htmlContent }
								onChange={ ( e ) => setHtmlContent( e.target.value ) }
								placeholder={ htmlPlaceholder }
								multiline
								minRows={ 20 }
								sx={ {
									minHeight: '500px',
									'& .MuiInputBase-input:focus': {
										outline: 'none !important',
										border: 'none !important',
										boxShadow: 'none !important',
									},
									'& textarea:focus': {
										outline: 'none !important',
										border: 'none !important',
										boxShadow: 'none !important',
									},
								} }
								fullWidth
								size="small"
							/>
						</Box>
					) }

					<Box>
						<Typography variant="body2" sx={ { mb: 1 } }>
							{ __( 'Post Type', 'elementor' ) }
						</Typography>
						<Select
							value={ postType }
							onChange={ ( e ) => setPostType( e.target.value ) }
							fullWidth
							size="small"
						>
							<MenuItem value="page">{ __( 'Page', 'elementor' ) }</MenuItem>
							<MenuItem value="post">{ __( 'Post', 'elementor' ) }</MenuItem>
						</Select>
					</Box>

					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={ isSubmitDisabled }
					>
						{ isLoading ? __( 'Processing...', 'elementor' ) : __( 'Submit', 'elementor' ) }
					</Button>
				</Stack>
			</form>
		</Box>
	);
};
