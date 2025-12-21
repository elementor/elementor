import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';
import { getElementType } from '@elementor/editor-elements';
import {
	htmlPropTypeUtil,
	stringPropTypeUtil,
	type StringPropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { ThemeProvider } from '@elementor/ui';

import ReplacementBase from '../base';
import { getBlockedValue, getInitialPopoverPosition, INLINE_EDITING_PROPERTY_PER_TYPE } from './inline-editing-utils';

const EXPERIMENT_KEY = 'v4-inline-text-editing';

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
		return isExperimentActive( EXPERIMENT_KEY ) && this.isEditingModeActive() && ! this.isValueDynamic();
	}

	handleRenderInlineEditor = ( event: Event ) => {
		event.stopPropagation();

		if ( ! this.isValueDynamic() ) {
			this.renderInlineEditor();
		}
	};

	handleUnmountInlineEditor = ( event: Event ) => {
		event.stopPropagation();
		this.unmountInlineEditor();
	};

	onDestroy() {
		this.resetInlineEditorRoot();
	}

	_beforeRender(): void {
		this.resetInlineEditorRoot();
	}

	_afterRender() {
		if ( ! this.isValueDynamic() && ! this.handlerAttached ) {
			this.element.addEventListener( 'dblclick', this.handleRenderInlineEditor );
			this.handlerAttached = true;
		}
	}

	resetInlineEditorRoot() {
		this.element.removeEventListener( 'dblclick', this.handleRenderInlineEditor );
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
			htmlPropTypeUtil.extract( prop?.default ?? null ) ??
			defaultValue ??
			''
		);
	}

	setContentValue( value: string | null ) {
		const settingKey = this.getInlineEditablePropertyName();
		const valueToSave = value ? htmlPropTypeUtil.create( value ) : null;

		this.setSetting( settingKey, valueToSave );
	}

	getExpectedTag() {
		const propsSchema = getElementType( this.type )?.propsSchema;

		if ( ! propsSchema?.tag ) {
			return null;
		}

		const tagSettingKey = 'tag';

		return (
			stringPropTypeUtil.extract( this.getSetting( tagSettingKey ) ?? null ) ??
			stringPropTypeUtil.extract( propsSchema.tag.default ?? null ) ??
			null
		);
	}

	ensureProperValue() {
		const actualValue = this.getContentValue();
		const tagSettings = this.getExpectedTag();
		const wrappedValue = getBlockedValue( actualValue, tagSettings );

		if ( actualValue !== wrappedValue ) {
			this.setContentValue( wrappedValue );
		}
	}

	renderInlineEditor() {
		this.ensureProperValue();

		const propValue = this.getContentValue();
		const classes = ( this.element.children?.[ 0 ]?.classList.toString() ?? '' ) + ' strip-styles';
		const expectedTag = this.getExpectedTag();

		this.element.innerHTML = '';

		if ( this.inlineEditorRoot ) {
			this.resetInlineEditorRoot();
		}

		this.inlineEditorRoot = createRoot( this.element );

		this.inlineEditorRoot.render(
			<ThemeProvider>
				<InlineEditor
					attributes={ { class: classes } }
					value={ propValue }
					setValue={ this.setContentValue.bind( this ) }
					onBlur={ this.handleUnmountInlineEditor.bind( this ) }
					autofocus
					showToolbar
					getInitialPopoverPosition={ getInitialPopoverPosition }
					expectedTag={ expectedTag }
				/>
			</ThemeProvider>
		);
	}
}
