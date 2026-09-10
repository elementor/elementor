import { getContainer, getElementLabel, getElementType } from '@elementor/editor-elements';
import {
	escapedHtmlPropTypeUtil,
	htmlV3PropTypeUtil,
	type PropType,
	type PropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync, undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { sanitizeEscapedHtml } from '../utils/sanitize-escaped-html';

const HISTORY_DEBOUNCE_WAIT = 800;

const htmlToPlainText = ( html: string ): string => {
	if ( ! html ) {
		return '';
	}

	const normalizedHtml = html.replace( /<br\s*\/?>/gi, '\n' ).replace( /<\/p>\s*<p[^>]*>/gi, '\n' );
	const doc = new DOMParser().parseFromString( normalizedHtml, 'text/html' );

	doc.querySelectorAll( 'script, style' ).forEach( ( element ) => element.remove() );

	return doc.body.textContent ?? '';
};

const TEXT_PROP_TYPE_KEYS = [ escapedHtmlPropTypeUtil.key, htmlV3PropTypeUtil.key, stringPropTypeUtil.key ] as const;

const getElementWidgetType = ( elementId: string ): string | null => {
	const container = getContainer( elementId );

	return container?.model.get( 'widgetType' ) ?? container?.model.get( 'elType' ) ?? null;
};

const getInlinePropType = ( elementId: string, bind: string ): PropType | null => {
	const widgetType = getElementWidgetType( elementId );

	if ( ! widgetType ) {
		return null;
	}

	const propSchema = getElementType( widgetType )?.propsSchema;

	return propSchema?.[ bind ] ?? null;
};

const getInlineEditablePropTypeKey = ( propType: PropType | null ): string | null => {
	if ( ! propType ) {
		return null;
	}

	if ( propType.kind === 'union' ) {
		for ( const key of TEXT_PROP_TYPE_KEYS ) {
			if ( propType.prop_types[ key ] ) {
				return key;
			}
		}

		return null;
	}

	if ( 'key' in propType && typeof propType.key === 'string' ) {
		return propType.key;
	}

	return null;
};

const sanitizeInlineHtml = ( html: string, propTypeKey: string ): string => {
	if ( propTypeKey === stringPropTypeUtil.key ) {
		return htmlToPlainText( html );
	}

	return sanitizeEscapedHtml( html );
};

const createInlineContentPropValue = ( value: string, propTypeKey: string ): PropValue => {
	const content = value || '';

	if ( propTypeKey === htmlV3PropTypeUtil.key ) {
		return htmlV3PropTypeUtil.create( {
			content: stringPropTypeUtil.create( content ),
			children: [],
		} );
	}

	if ( propTypeKey === stringPropTypeUtil.key ) {
		return stringPropTypeUtil.create( content );
	}

	return escapedHtmlPropTypeUtil.create( content );
};

const runInlineSettingsCommand = ( elementId: string, bind: string, value: PropValue | null ) => {
	runCommandSync(
		'document/elements/set-settings',
		{
			container: getContainer( elementId ),
			settings: {
				[ bind ]: value,
			},
		},
		{ internal: true }
	);
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
};

export const applyInlineTextValue = ( elementId: string, bind: string, html: string ) => {
	const propType = getInlinePropType( elementId, bind );
	const propTypeKey = getInlineEditablePropTypeKey( propType );

	if ( ! propTypeKey ) {
		throw new Error( `Inline text property "${ bind }" is not supported for element "${ elementId }".` );
	}

	const sanitizedHtml = sanitizeInlineHtml( html, propTypeKey );
	const valueToSave = createInlineContentPropValue( sanitizedHtml, propTypeKey );

	if (
		! escapedHtmlPropTypeUtil.isValid( valueToSave ) &&
		! htmlV3PropTypeUtil.isValid( valueToSave ) &&
		! stringPropTypeUtil.isValid( valueToSave )
	) {
		throw new Error( 'Generated inline text failed validation.' );
	}

	undoable(
		{
			do: () => {
				const container = getContainer( elementId );
				const prevValue = container?.settings.get( bind ) ?? null;

				runInlineSettingsCommand( elementId, bind, valueToSave );

				return prevValue;
			},
			undo: ( _, prevValue ) => {
				runInlineSettingsCommand( elementId, bind, prevValue ?? null );
			},
		},
		{
			title: getElementLabel( elementId ),
			subtitle: __( 'Inline text edited', 'elementor' ),
			debounce: { wait: HISTORY_DEBOUNCE_WAIT },
		}
	)();
};
