import { type ElementID } from '../types';
import { getElementEditorSettings } from './get-element-editor-settings';
import { getElementLabel } from './get-element-label';
import { getElementSetting } from './get-element-setting';

function extractString( value: unknown ): string | null {
	if ( typeof value === 'string' ) {
		return value || null;
	}

	if (
		value &&
		typeof value === 'object' &&
		'value' in value &&
		typeof ( value as { value: unknown } ).value === 'string'
	) {
		return ( value as { value: string } ).value || null;
	}

	return null;
}

export function getElementTitle( elementId: ElementID ): string | null {
	const editorSettings = getElementEditorSettings( elementId );
	const editorTitle = extractString( editorSettings?.title );

	if ( editorTitle ) {
		return editorTitle;
	}

	const legacyTitle = extractString( getElementSetting( elementId, '_title' ) );

	if ( legacyTitle ) {
		return legacyTitle;
	}

	const presetTitle = extractString( getElementSetting( elementId, 'presetTitle' ) );

	if ( presetTitle ) {
		return presetTitle;
	}

	try {
		return getElementLabel( elementId );
	} catch {
		return null;
	}
}
