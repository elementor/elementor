import * as React from 'react';
import { getContainer, getElementLabel, getElementType } from '@elementor/editor-elements';
import {
	htmlV3PropTypeUtil,
	parseHtmlChildren,
	type PropType,
	type PropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync, getCurrentEditMode, undoable } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { ReplacementBase, TRIGGER_TIMING } from '../base';
import { CanvasInlineEditor } from './canvas-inline-editor';
import { isInlineEditingAllowed } from './inline-editing-eligibility';
import { INLINE_EDITING_PROPERTY_PER_TYPE } from './inline-editing-utils';

type TagPropType = PropType< 'tag' > & {
	settings?: {
		enum?: string[];
	};
};

const HISTORY_DEBOUNCE_WAIT = 800;

export default class InlineEditingReplacement extends ReplacementBase {
	private handlerAttached = false;
	private editing = false;
	private editingSession = 0;

	getReplacementKey() {
		return 'inline-editing';
	}

	static getTypes() {
		return Object.keys( INLINE_EDITING_PROPERTY_PER_TYPE );
	}

	isEditingModeActive() {
		return this.editing;
	}

	shouldRenderReplacement() {
		return this.isInlineEditingEligible() && getCurrentEditMode() === 'edit';
	}

	handleRenderInlineEditor = () => {
		if ( this.isEditingModeActive() || ! this.isInlineEditingEligible() ) {
			return;
		}

		this.renderInlineEditor();
	};

	renderOnChange() {
		if ( this.isEditingModeActive() ) {
			return;
		}

		this.refreshView();
	}

	onDestroy() {
		this.resetInlineEditorRoot();
	}

	_beforeRender() {
		this.resetInlineEditorRoot();
	}

	_afterRender() {
		if ( this.isInlineEditingEligible() && ! this.handlerAttached ) {
			this.element.addEventListener( 'click', this.handleRenderInlineEditor );
			this.handlerAttached = true;
		}
	}

	originalMethodsToTrigger() {
		const before = this.isEditingModeActive() ? TRIGGER_TIMING.never : TRIGGER_TIMING.before;
		const after = this.isEditingModeActive() ? TRIGGER_TIMING.never : TRIGGER_TIMING.after;

		return {
			_beforeRender: before,
			_afterRender: after,
			renderOnChange: after,
			onDestroy: TRIGGER_TIMING.after,
			render: before,
		};
	}

	resetInlineEditorRoot() {
		this.element.removeEventListener( 'click', this.handleRenderInlineEditor );
		this.handlerAttached = false;
		this.reactRoot.render( null );
		this.editing = false;
	}

	unmountInlineEditor() {
		this.resetInlineEditorRoot();
		this.refreshView();
	}

	isInlineEditingEligible() {
		const settingKey = this.getInlineEditablePropertyName();
		const rawValue = this.getSetting( settingKey );

		return isInlineEditingAllowed( { rawValue, propTypeFromSchema: this.getInlineEditablePropType() } );
	}

	getInlineEditablePropertyName(): string {
		return INLINE_EDITING_PROPERTY_PER_TYPE[ this.type ] ?? '';
	}

	getInlineEditablePropType() {
		const propSchema = getElementType( this.type )?.propsSchema;
		const propertyName = this.getInlineEditablePropertyName();

		return propSchema?.[ propertyName ] ?? null;
	}

	getInlineEditablePropValue() {
		const prop = this.getInlineEditablePropType();
		const settingKey = this.getInlineEditablePropertyName();

		return this.getSetting( settingKey ) ?? prop?.default ?? null;
	}

	getExtractedContentValue() {
		const propValue = this.getInlineEditablePropValue();
		const extracted = htmlV3PropTypeUtil.extract( propValue );

		return stringPropTypeUtil.extract( extracted?.content ?? null ) ?? '';
	}

	setContentValue( value: string | null ) {
		const settingKey = this.getInlineEditablePropertyName();
		const html = value || '';
		const parsed = parseHtmlChildren( html );

		const valueToSave = htmlV3PropTypeUtil.create( {
			content: parsed.content ? stringPropTypeUtil.create( parsed.content ) : null,
			children: parsed.children,
		} );

		undoable(
			{
				do: () => {
					const prevValue = this.getInlineEditablePropValue();

					this.runCommand( settingKey, valueToSave );

					return prevValue;
				},
				undo: ( _, prevValue ) => {
					this.runCommand( settingKey, prevValue ?? null );
				},
			},
			{
				title: getElementLabel( this.id ),
				// translators: %s is the name of the property that was edited.
				subtitle: __( '%s edited', 'elementor' ).replace(
					'%s',
					this.getInlineEditablePropTypeKey() ?? 'Inline editing'
				),
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		)();
	}

	getInlineEditablePropTypeKey() {
		const propType = this.getInlineEditablePropType();

		if ( ! propType ) {
			return null;
		}

		if ( propType.kind === 'union' ) {
			const textKeys = [ htmlV3PropTypeUtil.key, stringPropTypeUtil.key ];

			for ( const key of textKeys ) {
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
	}

	runCommand( key: string, value: PropValue | null ) {
		runCommandSync(
			'document/elements/set-settings',
			{
				container: getContainer( this.id ),
				settings: {
					[ key ]: value,
				},
			},
			{ internal: true }
		);
		runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
	}

	getExpectedTag() {
		const tagPropType = this.getTagPropType();
		const tagSettingKey = 'tag';

		return (
			stringPropTypeUtil.extract( this.getSetting( tagSettingKey ) ?? null ) ??
			stringPropTypeUtil.extract( tagPropType?.default ?? null ) ??
			null
		);
	}

	getTagPropType() {
		const propsSchema = getElementType( this.type )?.propsSchema;

		if ( ! propsSchema?.tag ) {
			return null;
		}

		const tagPropType = ( propsSchema.tag as TagPropType ) ?? null;

		if ( tagPropType.kind === 'union' ) {
			return ( tagPropType.prop_types.string as TagPropType ) ?? null;
		}

		return tagPropType;
	}

	renderInlineEditor() {
		if ( this.isEditingModeActive() ) {
			this.resetInlineEditorRoot();
		}

		const contentElement = this.element.children?.[ 0 ] as HTMLElement | undefined;

		if ( ! contentElement ) {
			return;
		}

		const elementClasses = contentElement.classList.toString();
		const propValue = this.getExtractedContentValue();
		const expectedTag = this.getExpectedTag();

		contentElement.innerHTML = '';
		this.editing = true;
		this.editingSession++;

		const session = this.editingSession;

		this.reactRoot.render(
			<CanvasInlineEditor
				elementClasses={ elementClasses }
				initialValue={ propValue }
				expectedTag={ expectedTag }
				rootElement={ this.element }
				contentElement={ contentElement }
				id={ this.id }
				setValue={ this.setContentValue.bind( this ) }
				requestDestroy={ () => {
					if ( this.editingSession === session ) {
						this.unmountInlineEditor();
					}
				} }
			/>
		);
	}
}
