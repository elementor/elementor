import { type CSSProperties } from 'react';
import { type InlineEditorToolbarProps } from '@elementor/editor-controls';
import { type V1Element } from '@elementor/editor-elements';

import { type LegacyWindow } from '../../types';

export type Editor = InlineEditorToolbarProps[ 'editor' ];
export type EditorView = Editor[ 'view' ];

export type Offsets = {
	left: number;
	top: number;
};

export const INLINE_EDITING_PROPERTY_PER_TYPE: Record< string, string > = {
	'e-button': 'text',
	'e-form-label': 'text',
	'e-heading': 'title',
	'e-paragraph': 'paragraph',
};

export const legacyWindow = window as unknown as LegacyWindow;

export const getWidgetType = ( container: V1Element | null ) => {
	return container?.model?.get( 'widgetType' ) ?? container?.model?.get( 'elType' ) ?? null;
};

export const calcSelectionCenterOffsets = ( view: EditorView ): Offsets | null => {
	const frameWindow = ( view.root as Document )?.defaultView;
	const selection = frameWindow?.getSelection();
	const editorContainer = view.dom;

	if ( ! selection || ! editorContainer ) {
		return null;
	}

	const range = selection.getRangeAt( 0 );
	const selectionRect = range.getBoundingClientRect();
	const editorContainerRect = editorContainer.getBoundingClientRect();

	if ( ! selectionRect || ! editorContainerRect ) {
		return null;
	}

	const verticalOffset = selectionRect.top - editorContainerRect.top;

	const selectionCenter = selectionRect?.left + selectionRect?.width / 2;
	const horizontalOffset = selectionCenter - editorContainerRect.left;

	return { left: horizontalOffset, top: verticalOffset };
};

export const getComputedStyle = ( styles: CSSProperties, offsets: Offsets ): CSSProperties => {
	const transform = extractTransformValue( styles );

	return transform
		? {
				...styles,
				marginLeft: `${ offsets.left }px`,
				marginTop: `${ offsets.top }px`,
				pointerEvents: 'none',
		  }
		: {
				display: 'none',
		  };
};

const extractTransformValue = ( styles: CSSProperties ) => {
	const translateRegex = /translate\([^)]*\)\s?/g;
	const numericValuesRegex = /(-?\d+\.?\d*)/g;

	const translateValue = styles?.transform?.match( translateRegex )?.[ 0 ];
	const values = translateValue?.match( numericValuesRegex );

	if ( ! translateValue || ! values ) {
		return null;
	}

	const [ numericX, numericY ] = values.map( Number );

	if ( ! numericX || ! numericY ) {
		return null;
	}

	return styles.transform;
};
