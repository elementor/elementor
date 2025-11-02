import * as React from 'react';
import { useRef } from 'react';
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuControlsContainer,
	MenuDivider,
	MenuSelectHeading,
	RichTextEditor,
	type RichTextEditorRef,
} from 'mui-tiptap';
import { richTextPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { Button, type SxProps, TextField } from '@elementor/ui';
import StarterKit from '@tiptap/starter-kit';

import { useBoundProp } from '../bound-prop-context';
import { InlineEditor } from '../components/inline-editor';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type ParsedNode = {
	tag: string | null;
	content: string | ParsedNode[];
};

const parseHtmlToStructure = ( htmlString: string ): ParsedNode[] => {
	const parser = new DOMParser();
	const doc = parser.parseFromString( htmlString, 'text/html' );
	const bodyContent = doc.body;

	const parseNode = ( node: ChildNode ): ParsedNode | null => {
		if ( node.nodeType === Node.TEXT_NODE ) {
			const textContent = node.textContent || '';
			if ( textContent === '' ) {
				return null;
			}
			return {
				tag: null,
				content: textContent,
			};
		}

		if ( node.nodeType === Node.ELEMENT_NODE ) {
			const element = node as Element;
			const tagName = element.tagName.toLowerCase();
			const childNodes = Array.from( element.childNodes );

			if ( childNodes.length === 0 ) {
				return {
					tag: tagName,
					content: '',
				};
			}

			const hasOnlyTextContent = childNodes.every( ( child ) => child.nodeType === Node.TEXT_NODE );

			if ( hasOnlyTextContent ) {
				return {
					tag: tagName,
					content: element.textContent || '',
				};
			}

			const parsedChildren = childNodes
				.map( parseNode )
				.filter( ( child ): child is ParsedNode => child !== null );

			return {
				tag: tagName,
				content: parsedChildren,
			};
		}

		return null;
	};

	const result = Array.from( bodyContent.childNodes )
		.map( parseNode )
		.filter( ( node ): node is ParsedNode => node !== null );

	return result;
};

const structureToHtml = ( nodes: ParsedNode[] ): string => {
	const convertNode = ( node: ParsedNode ): string => {
		if ( node.tag === null ) {
			return typeof node.content === 'string' ? node.content : '';
		}

		const tag = node.tag;
		let contentHtml = '';

		if ( typeof node.content === 'string' ) {
			contentHtml = node.content;
		} else if ( Array.isArray( node.content ) ) {
			contentHtml = node.content.map( convertNode ).join( '' );
		}

		return `<${ tag }>${ contentHtml }</${ tag }>`;
	};

	return nodes.map( convertNode ).join( '' );
};

export const WysiwygControl = createControl(
	( {
		placeholder,
		error,
		inputValue,
		inputDisabled,
		helperText,
		sx,
		ariaLabel,
	}: {
		placeholder?: string;
		error?: boolean;
		inputValue?: string;
		inputDisabled?: boolean;
		helperText?: string;
		sx?: SxProps;
		ariaLabel?: string;
	} ) => {
		const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );
		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => setValue( event.target.value );
		const rteRef = useRef< RichTextEditorRef >( null );

		return (
			<ControlActions>
				<div>
					<InlineEditor value={ value } setValue={ setValue } />
				</div>
			</ControlActions>
		);
	}
);
