import React, { useRef } from 'react';
import App from '../editor/app';
import PropTypes from 'prop-types';
import useUserInfo from '../editor/hooks/use-user-info';
import useExcerptPrompt from '../editor/hooks/use-excerpt-prompt';
import { useCallback, useEffect } from '@wordpress/element';

const { useSelect, useDispatch } = wp.data;

// Function to extract all textual content from a Gutenberg post
const useGutenbergPostText = ( ) => {
	const postContent = useSelect(
		( select ) => select( 'core/editor' )?.getEditedPostContent(),
		[],
	);
	const title = useSelect(
		( select ) => select( 'core/editor' )?.getEditedPostAttribute( 'title' ),
		[],
	);

	function extractTextFromGutenberg( content, extractedText ) {
		// Create a temporary DOM element to parse the content
		const tempDiv = document.createElement( 'div' );
		tempDiv.innerHTML = content;

		// Function to recursively extract text from all text nodes
		function extractTextRecursively( element, extractedTextRec ) {
			element.childNodes.forEach( ( node ) => {
				if ( node.nodeType === Node.TEXT_NODE ) {
					const text = node.textContent.trim();
					if ( text ) {
						extractedTextRec.push( text );
					}
				} else if ( node.nodeType === Node.ELEMENT_NODE ) {
					extractTextRecursively( node, extractedTextRec, true );
				}
			} );
		}
		// Start the recursive extraction from the root element
		extractTextRecursively( tempDiv, extractedText );

		// Return the extracted text as an array
		return extractedText;
	}
	const textContent = extractTextFromGutenberg( postContent, [ title ] );
	return textContent.join( '\n' ).trim();
};

const GenerateExcerptWithAI = ( { onClose } ) => {
	const { editPost } = useDispatch( 'core/editor' );
	const currExcerpt = useSelect(
		( select ) => select( 'core/editor' )?.getEditedPostAttribute( 'excerpt' ),
		[],
	);

	const postTextualContent = useGutenbergPostText();
	const {
		isLoading: isLoadingUserInfo,
		isConnected,
		isGetStarted,
		connectUrl,
		fetchData,
		hasSubscription,
		credits,
		usagePercentage,
	} = useUserInfo( true );
	const { data: newExcerpt, isLoading: isLoadingExcerpt, error, send } = useExcerptPrompt( {
		result: currExcerpt,
		credits,
	} );
	const isLoading = isLoadingExcerpt || isLoadingUserInfo;
	const initHook = () => ( {
		isLoading,
		isConnected,
		isGetStarted,
		connectUrl,
		fetchData,
		hasSubscription,
		credits,
		usagePercentage,
	} );
	const generateExcerptOnce = useRef( false );
	const fetchAiExcerpt = useCallback( async () => {
		send( { content: postTextualContent } );
	}, [ postTextualContent, send ] );
	useEffect( () => {
		if ( ! generateExcerptOnce.current && send ) {
			generateExcerptOnce.current = true;
			fetchAiExcerpt();
		}
	}, [ send, fetchAiExcerpt ] );
	const isRTL = elementorCommon.config.isRTL;

	return (
		<>
			<App
				type={ 'text' }
				getControlValue={ () => newExcerpt.result ? newExcerpt : currExcerpt }
				setControlValue={ ( value ) => {
					editPost( { excerpt: value } );
				} }
				onClose={ onClose }
				isRTL={ isRTL }
				additionalOptions={ {
					loadingTitle: __( 'Analyzing your post to craft an excerpt...', 'elementor' ),
					useCustomInit: initHook,
					initError: error,
					initRetry: fetchAiExcerpt,
				} }
			/>
		</>
	);
};

GenerateExcerptWithAI.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default GenerateExcerptWithAI;
