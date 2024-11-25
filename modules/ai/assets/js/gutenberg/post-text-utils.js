import { useEffect, useState } from '@wordpress/element';

const { useSelect } = wp.data;
export const useGutenbergPostText = ( ) => {
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
		const tempDiv = document.createElement( 'div' );
		tempDiv.innerHTML = postContent;
		const extractedText = [ title ];

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
