import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';
import { getContainer, getElementLabel, getElementType } from '@elementor/editor-elements';
import {
	htmlPropTypeUtil,
	type HtmlPropValue,
	type PropType,
	stringPropTypeUtil,
	type StringPropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync, isExperimentActive, undoable } from '@elementor/editor-v1-adapters';
import { Box, ThemeProvider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { OutlineOverlay } from '../../../components/outline-overlay';
import ReplacementBase from '../base';
import { getInitialPopoverPosition, INLINE_EDITING_PROPERTY_PER_TYPE } from './inline-editing-utils';

const EXPERIMENT_KEY = 'v4-inline-text-editing';

type TagPropType = PropType< 'tag' > & {
	settings?: {
		enum?: string[];
	};
};

const HISTORY_DEBOUNCE_WAIT = 800;

const BLUR_TRIGGERING_SELECTORS = [
	'#elementor-editor-wrapper-v2',
	'#elementor-navigator',
	'main.MuiBox-root',
	'#elementor-panel-content-wrapper',
];

export default class InlineEditingReplacement extends ReplacementBase {
	private inlineEditorRoot: Root | null = null;
	private handlerAttached = false;

	getReplacementKey() {
		return 'inline-editing';
	}

	static getTypes() {
		return Object.keys( INLINE_EDITING_PROPERTY_PER_TYPE );
	}

	isEditingModeActive() {
		return !! this.inlineEditorRoot;
	}

	shouldRenderReplacement() {
		return isExperimentActive( EXPERIMENT_KEY ) && ! this.isValueDynamic();
	}

	handleRenderInlineEditor = () => {
		if ( this.isEditingModeActive() || this.isValueDynamic() ) {
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

	_beforeRender(): void {
		this.resetInlineEditorRoot();
	}

	_afterRender() {
		this.enforceDraggable();

		if ( ! this.isValueDynamic() && ! this.handlerAttached ) {
			this.element.addEventListener( 'click', this.handleRenderInlineEditor );
			this.handlerAttached = true;
		}
	}

	enforceDraggable() {
		this.element?.children?.[ 0 ]?.setAttribute( 'draggable', 'true' );
	}

	resetInlineEditorRoot() {
		this.element.removeEventListener( 'click', this.handleRenderInlineEditor );
		this.handlerAttached = false;
		this.inlineEditorRoot?.unmount?.();
		this.inlineEditorRoot = null;
	}

	unmountInlineEditor() {
		this.resetInlineEditorRoot();
		this.refreshView();
	}

	isValueDynamic() {
		const settingKey = this.getInlineEditablePropertyName();
		const propValue = this.getSetting( settingKey ) as TransformablePropValue< string >;

		return propValue?.$$type === 'dynamic';
	}

	getInlineEditablePropertyName(): string {
		return INLINE_EDITING_PROPERTY_PER_TYPE[ this.type ] ?? '';
	}

	getHtmlPropType() {
		const propSchema = getElementType( this.type )?.propsSchema;
		const propertyName = this.getInlineEditablePropertyName();

		return propSchema?.[ propertyName ] ?? null;
	}

	getContentValue() {
		const prop = this.getHtmlPropType();
		const defaultValue = ( prop?.default as StringPropValue | null )?.value ?? '';
		const settingKey = this.getInlineEditablePropertyName();

		return (
			htmlPropTypeUtil.extract( this.getSetting( settingKey ) ?? null ) ??
			stringPropTypeUtil.extract( this.getSetting( settingKey ) ?? null ) ??
			htmlPropTypeUtil.extract( prop?.default ?? null ) ??
			defaultValue ??
			''
		);
	}

	setContentValue( value: string | null ) {
		const settingKey = this.getInlineEditablePropertyName();
		const valueToSave = value ? htmlPropTypeUtil.create( value ) : null;

		undoable(
			{
				do: () => {
					const prevValue = this.getContentValue();

					this.runCommand( settingKey, valueToSave );

					return prevValue;
				},
				undo: ( prevValue ) => {
					this.runCommand( settingKey, prevValue ?? null );
				},
			},
			{
				title: getElementLabel( this.id ),
				// translators: %s is the name of the property that was edited.
				subtitle: __( '%s edited', 'elementor' ).replace(
					'%s',
					this.getHtmlPropType()?.key ?? 'Inline editing'
				),
				debounce: { wait: HISTORY_DEBOUNCE_WAIT },
			}
		)();
	}

	runCommand( key: string, value: HtmlPropValue | null ) {
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

		const InlineEditorApp = this.InlineEditorApp;
		const wrapperClasses = 'elementor';
		const elementClasses = this.element.children?.[ 0 ]?.classList.toString() ?? '';

		this.element.innerHTML = '';

		this.inlineEditorRoot = createRoot( this.element );
		this.inlineEditorRoot.render(
			<InlineEditorApp wrapperClasses={ wrapperClasses } elementClasses={ elementClasses } />
		);
	}

	InlineEditorApp = ( { wrapperClasses, elementClasses }: { wrapperClasses: string; elementClasses: string } ) => {
		const propValue = this.getContentValue();
		const expectedTag = this.getExpectedTag();
		const wrapperRef = useRef< HTMLDivElement | null >( null );
		const [ isWrapperRendered, setIsWrapperRendered ] = useState( false );

		useEffect( () => {
			setIsWrapperRendered( !! wrapperRef.current );
			BLUR_TRIGGERING_SELECTORS.forEach(
				( selector ) =>
					document?.querySelector( selector )?.addEventListener( 'mousedown', asyncUnmountInlineEditor )
			);

			return () =>
				BLUR_TRIGGERING_SELECTORS.forEach(
					( selector ) =>
						document
							?.querySelector( selector )
							?.removeEventListener( 'mousedown', asyncUnmountInlineEditor )
				);
		}, [] );

		const asyncUnmountInlineEditor = () => queueMicrotask( this.unmountInlineEditor.bind( this ) );

		return (
			<ThemeProvider>
				<Box ref={ wrapperRef }>
					{ isWrapperRendered && (
						<OutlineOverlay element={ wrapperRef.current as HTMLDivElement } id={ this.id } isSelected />
					) }
					<InlineEditor
						attributes={ {
							class: wrapperClasses,
							style: 'outline: none;',
						} }
						elementClasses={ elementClasses }
						value={ propValue }
						setValue={ this.setContentValue.bind( this ) }
						onBlur={ this.unmountInlineEditor.bind( this ) }
						autofocus
						showToolbar
						getInitialPopoverPosition={ getInitialPopoverPosition }
						expectedTag={ expectedTag }
					/>
				</Box>
			</ThemeProvider>
		);
	};
}
