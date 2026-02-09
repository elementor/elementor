import DOMPurify from 'dompurify';
import { type ChildElement } from '../prop-types/html-v2';

export interface ParseResult {
	content: string;
	children: ChildElement[];
}

const INLINE_ELEMENTS = new Set( [ 'span', 'b', 'strong', 'i', 'em', 'u', 'a', 'del', 'sup', 'sub', 's' ] );

function generateElementId(): string {
	const timestamp = Date.now().toString( 36 );
	const randomPart = Math.random().toString( 36 ).substring( 2, 9 );

	return `e-${ timestamp }-${ randomPart }`;
}

function traverseChildren( node: Element ): ChildElement[] {
	const result: ChildElement[] = [];

	for ( const child of Array.from( node.children ) ) {
		const tagName = child.tagName.toLowerCase();

		if ( ! INLINE_ELEMENTS.has( tagName ) ) {
			result.push( ...traverseChildren( child ) );

			continue;
		}

		let id = child.getAttribute( 'id' );

		if ( ! id ) {
			id = generateElementId();
			child.setAttribute( 'id', id );
		}

		const childElement: ChildElement = {
			id,
			type: tagName,
		};

		const textContent = child.textContent?.trim();

		if ( textContent ) {
			childElement.content = textContent;
		}

		const nestedChildren = traverseChildren( child );

		if ( nestedChildren.length > 0 ) {
			childElement.children = nestedChildren;
		}

		result.push( childElement );
	}

	return result;
}

export function parseHtmlChildren( html: string ): ParseResult {
	if ( ! html ) {
		return { content: html, children: [] };
	}

	const sanitized = DOMPurify.sanitize( html );
	const parser = new DOMParser();
	const doc = parser.parseFromString( `<body>${ sanitized }</body>`, 'text/html' );

	const parserError = doc.querySelector( 'parsererror' );
	if ( parserError ) {
		// eslint-disable-next-line no-console
		console.warn( 'HTML parsing error, returning original content:', parserError.textContent );
		return { content: html, children: [] };
	}

	const body = doc.body;
	const children = traverseChildren( body );

	return {
		content: body.innerHTML,
		children,
	};
}
