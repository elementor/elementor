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
		{
			label: __( 'Inline css', 'elementor' ),
			code: '<div style="color: #ff6b6b; font-size: 24px; padding: 20px; background-color: #f8f9fa;"><h1 style="color: #2c3e50; font-weight: bold; text-align: center;">Styled Heading</h1><p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">This paragraph has custom styling.</p></div>',
		},
		{
			label: __( 'CSS ID style', 'elementor' ),
			code: '<style>#container { background: linear-gradient(45deg, #667eea, #764ba2); padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); } #title { background-color: #43b8b8; color: white; font-size: 32px; font-weight: 700; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } #subtitle { color: #e0e6ed; font-size: 18px; margin-top: 10px; }</style><div id="container"><h1 id="title">Premium Design</h1><p id="subtitle">Beautiful gradients and shadows</p></div>',
		},
		{
			label: __( 'Global classes', 'elementor' ),
			code: '<style>.hero-section { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 60px 30px; background: #1a1a2e; } .hero-title { color: #eee; font-size: 48px; font-weight: 800; letter-spacing: -1px; } .hero-subtitle { color: #16213e; font-size: 20px; opacity: 0.8; } .cta-button { background: #0f3460; color: white; padding: 15px 30px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }</style><div class="hero-section"><h1 class="hero-title">Amazing Product</h1><p class="hero-subtitle">Transform your workflow today</p><a href="#" class="cta-button">Get Started</a></div>',
		},
		{
			label: __( 'Nested content with inline styles', 'elementor' ),
			code: '<div style="max-width: 800px; margin: 0 auto; padding: 40px;"><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;"><div style="background: #fff; border: 1px solid #e1e8ed; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><h2 style="color: #1da1f2; font-size: 24px; margin-bottom: 16px;">Feature One</h2><p style="color: #657786; line-height: 1.5;">Detailed description of the first feature.</p></div><div style="background: #fff; border: 1px solid #e1e8ed; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><h2 style="color: #1da1f2; font-size: 24px; margin-bottom: 16px;">Feature Two</h2><p style="color: #657786; line-height: 1.5;">Detailed description of the second feature.</p></div></div></div>',
		},
		{
			label: __( 'Typography', 'elementor' ),
			code: '<div style="font-family: \'Georgia\', serif; max-width: 600px; margin: 0 auto; padding: 40px;"><h1 style="font-size: 42px; font-weight: 300; color: #2c3e50; line-height: 1.2; margin-bottom: 20px; text-align: center;">Typography Test</h1><h2 style="font-size: 28px; font-weight: 600; color: #34495e; margin: 30px 0 15px;">Subheading Style</h2><p style="font-size: 18px; line-height: 1.7; color: #555; margin-bottom: 20px; text-align: justify;">This paragraph tests various typography properties including font size, line height, color, and text alignment. It should render beautifully with proper spacing.</p><blockquote style="border-left: 4px solid #3498db; padding-left: 20px; margin: 30px 0; font-style: italic; color: #7f8c8d;">This is a styled blockquote to test border and italic text styling.</blockquote></div>',
		},
		{
			label: __( 'Spacing and layout', 'elementor' ),
			code: '<div style="padding: 50px 30px; background: #f7f9fc;"><div style="margin: 0 auto 40px; max-width: 500px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"><h2 style="margin: 0 0 20px; padding-bottom: 15px; border-bottom: 2px solid #e9ecef; color: #495057;">Spacing Test</h2><p style="margin: 15px 0; padding: 10px 15px; background: #e7f3ff; border-left: 3px solid #007bff; color: #004085;">This tests margin and padding properties.</p><div style="display: flex; gap: 15px; margin-top: 25px;"><div style="flex: 1; padding: 20px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px;">Flex Item 1</div><div style="flex: 1; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px;">Flex Item 2</div></div></div></div>',
		},
		{
			label: __( 'Borders', 'elementor' ),
			code: '<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="background: white; border: 2px solid #dee2e6; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);"><h2 style="color: #343a40; border-bottom: 3px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;">Border Styles</h2><div style="border: 1px dashed #6c757d; padding: 15px; margin: 15px 0; border-radius: 8px;">Dashed border example</div><div style="border: 3px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">Solid border with inset shadow</div><div style="border: 2px dotted #dc3545; padding: 15px; margin: 15px 0; border-radius: 8px;">Dotted border example</div></div></div>',
		},
		{
			label: __( 'Background styling', 'elementor' ),
			code: '<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="background: white; border: 2px solid #dee2e6; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);"><h2 style="color: #343a40; border-bottom: 3px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;">Border Styles</h2><div style="border: 1px dashed #6c757d; padding: 15px; margin: 15px 0; border-radius: 8px;">Dashed border example</div><div style="border: 3px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">Solid border with inset shadow</div><div style="border: 2px dotted #dc3545; padding: 15px; margin: 15px 0; border-radius: 8px;">Dotted border example</div></div></div>',
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
