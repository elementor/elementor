import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';
import { getElementType } from '@elementor/editor-elements';
import {
	htmlPropTypeUtil,
	type PropType,
	stringPropTypeUtil,
	type StringPropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Box, ThemeProvider } from '@elementor/ui';

import { OutlineOverlay } from '../../../components/outline-overlay';
import ReplacementBase from '../base';
import { getInitialPopoverPosition, INLINE_EDITING_PROPERTY_PER_TYPE } from './inline-editing-utils';

const EXPERIMENT_KEY = 'v4-inline-text-editing';

type TagPropType = PropType< 'tag' > & {
	settings?: {
		enum?: string[];
	};
};

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

	onDestroy() {
		this.resetInlineEditorRoot();
	}

	_beforeRender(): void {
		this.resetInlineEditorRoot();
	}

	_afterRender() {
		if ( ! this.isValueDynamic() && ! this.handlerAttached ) {
			this.element.addEventListener( 'dblclick', this.handleRenderInlineEditor, { once: true } );
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
		const tagPropType = this.getTagPropType();
		const tagSettingKey = 'tag';

		return (
			stringPropTypeUtil.extract( this.getSetting( tagSettingKey ) ?? null ) ??
			stringPropTypeUtil.extract( tagPropType?.default ?? null ) ??
			null
		);
	}

	getTagList(): string[] {
		return this.getTagPropType()?.settings?.enum ?? [];
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
		const InlineEditorApp = this.InlineEditorApp;
		const wrapperClasses = 'elementor';
		const elementClasses = this.element.children?.[ 0 ]?.classList.toString() ?? '';

		this.element.innerHTML = '';

		if ( this.inlineEditorRoot ) {
			this.resetInlineEditorRoot();
		}

		this.inlineEditorRoot = createRoot( this.element );
		this.inlineEditorRoot.render(
			<InlineEditorApp wrapperClasses={ wrapperClasses } elementClasses={ elementClasses } />
		);
	}

	InlineEditorApp = ( { wrapperClasses, elementClasses }: { wrapperClasses: string; elementClasses: string } ) => {
		const propValue = this.getContentValue();
		const expectedTag = this.getExpectedTag();
		const wrapperRef = React.useRef< HTMLDivElement | null >( null );
		const [ isWrapperRendered, setIsWrapperRendered ] = React.useState( false );

		React.useEffect( () => {
			const panel = document?.querySelector( 'main.MuiBox-root' );

			setIsWrapperRendered( !! wrapperRef.current );
			panel?.addEventListener( 'click', unmountEditor );

			return () => panel?.removeEventListener( 'click', unmountEditor );
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		const unmountEditor = React.useCallback( () => queueMicrotask( this.unmountInlineEditor.bind( this ) ), [] );

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
