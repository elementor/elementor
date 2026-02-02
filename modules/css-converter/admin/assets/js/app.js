import { useState } from 'react';
import { Stack } from '@elementor/ui';
import { ImportForm } from './components/import-form';
import { FeedbackPanel } from './components/feedback-panel';

export const App = () => {
	const [ importType, setImportType ] = useState( 'url' );
	const [ urlContent, setUrlContent ] = useState( '' );
	const [ selectorContent, setSelectorContent ] = useState( '' );
	const [ htmlContent, setHtmlContent ] = useState( '' );
	const [ postType, setPostType ] = useState( 'page' );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ loadingText, setLoadingText ] = useState( '' );
	const [ result, setResult ] = useState( null );
	const [ error, setError ] = useState( null );

	const convertContent = async () => {
		setIsLoading( true );
		setLoadingText( 'url' === importType ? 'Fetching URL...' : 'Converting...' );
		setError( null );

		const requestData = {
			type: importType,
			content: 'url' === importType ? urlContent : htmlContent,
			followImports: true,
			options: {
				postType,
			},
		};

		if ( 'url' === importType && selectorContent ) {
			requestData.selector = selectorContent;
		}

		try {
			const response = await fetch( cssConverterConfig.apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': cssConverterConfig.nonce,
				},
				body: JSON.stringify( requestData ),
			} );

			const data = await response.json();

			if ( ! response.ok || ! data.success ) {
				throw new Error( data.message || data.error || 'Conversion failed' );
			}

			setResult( data );
		} catch ( err ) {
			setError( {
				message: err.message || 'An error occurred during conversion',
				code: err.code || 'conversion_error',
			} );
		} finally {
			setIsLoading( false );
		}
	};

	const resetForm = () => {
		setImportType( 'url' );
		setUrlContent( '' );
		setSelectorContent( '' );
		setHtmlContent( '' );
		setPostType( 'page' );
		setResult( null );
		setError( null );
	};

	return (
		<Stack spacing={ 0 }>
			<ImportForm
				importType={ importType }
				setImportType={ setImportType }
				urlContent={ urlContent }
				setUrlContent={ setUrlContent }
				selectorContent={ selectorContent }
				setSelectorContent={ setSelectorContent }
				htmlContent={ htmlContent }
				setHtmlContent={ setHtmlContent }
				postType={ postType }
				setPostType={ setPostType }
				onSubmit={ convertContent }
				isLoading={ isLoading }
			/>
			<FeedbackPanel
				isLoading={ isLoading }
				loadingText={ loadingText }
				result={ result }
				error={ error }
				importType={ importType }
				htmlContent={ htmlContent }
				urlContent={ urlContent }
				onConvertAnother={ resetForm }
			/>
		</Stack>
	);
};

