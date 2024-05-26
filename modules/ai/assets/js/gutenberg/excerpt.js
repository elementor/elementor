import React, { useRef } from 'react';
import App from '../editor/app';
import PropTypes from 'prop-types';
import useUserInfo from '../editor/hooks/use-user-info';
import useExcerptPrompt from '../editor/hooks/use-excerpt-prompt';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { RequestIdsProvider } from '../editor/context/requests-ids';
import styled from 'styled-components';
import { __ } from '@wordpress/i18n';

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
	const [ postTextualContent, setPostTextualContent ] = useState( '' );

	useEffect( () => {
		// Create a temporary DOM element to parse the content
		const tempDiv = document.createElement( 'div' );
		tempDiv.innerHTML = postContent;
		const extractedText = [ title ];

		// Function to recursively extract text from all text nodes
		function extractTextRecursively( element, extractedTextRec ) {
			element.childNodes.forEach( ( node ) => {
				if ( node.nodeType === Node.TEXT_NODE ) {
					const text = node.textContent.trim();
					if ( text ) {
						extractedTextRec.push( text );
					}
				} else if ( node.nodeType === Node.ELEMENT_NODE ) {
					extractTextRecursively( node, extractedTextRec );
				}
			} );
		}
		extractTextRecursively( tempDiv, extractedText );

		setPostTextualContent( extractedText.join( '\n' ).trim() );
	}, [ postContent, title ] );

	return postTextualContent;
};

const AIExcerpt = ( { onClose } ) => {
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
		if ( send && postTextualContent ) {
			generateExcerptOnce.current = true;
			send( { content: postTextualContent } );
		}
	}, [ postTextualContent, send ] );
	useEffect( () => {
		if ( ! generateExcerptOnce.current && isConnected ) {
			fetchAiExcerpt();
		}
	}, [ fetchAiExcerpt, isConnected ] );
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

AIExcerpt.propTypes = {
	onClose: PropTypes.func.isRequired,
};

const Icon = styled.i`
  padding-right: 0.5em;
  cursor: pointer;
  color: #C00BB9;
`;

const ExcerptLink = styled.a`
  color: #C00BB9;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  &:hover {
    text-decoration: underline;
    color: #C00BB9;
  }
`;

const GenerateExcerptWithAI = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const handleButtonClick = () => {
		setIsOpen( true );
	};

	const handleClose = () => {
		setIsOpen( false );
	};

	return (
		<div style={ { paddingBottom: '0.6em' } }>
			<RequestIdsProvider>
				<Icon className={ 'eicon-ai' } />
				<ExcerptLink onClick={ handleButtonClick }>{ __( 'Generate with Elementor AI', 'elementor' ) }</ExcerptLink>
				{ isOpen && <AIExcerpt onClose={ handleClose } /> }
			</RequestIdsProvider>
		</div> );
};

export default GenerateExcerptWithAI;

