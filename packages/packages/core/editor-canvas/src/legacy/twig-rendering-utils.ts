import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver, type PropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { type ElementView, type RenderContext } from './types';

export type TwigElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
> & Pick< V1ElementConfig, 'default_html_tag' | 'html_tag_follows_link' >;

export type SetupTwigRendererOptions = {
	type: string;
	renderer: DomRenderer;
	element: TwigElementConfig;
};

export type SetupTwigRendererResult = {
	templateKey: string;
	baseStylesDictionary: Record< string, unknown >;
	resolveProps: PropsResolver;
	defaultHtmlTag: string;
	htmlTagFollowsLink: boolean;
};

export function setupTwigRenderer( { renderer, element }: SetupTwigRendererOptions ): SetupTwigRendererResult {
	const templateKey = element.twig_main_template;
	const baseStylesDictionary = element.base_styles_dictionary;

	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	const resolveProps = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return {
		templateKey,
		baseStylesDictionary,
		resolveProps,
		defaultHtmlTag: element.default_html_tag ?? 'div',
		htmlTagFollowsLink: element.html_tag_follows_link ?? true,
	};
}

export interface TwigViewInterface extends Omit< ElementView, 'getResolverRenderContext' > {
	_abortController: AbortController | null;
	getResolverRenderContext?: () => RenderContext | undefined;
}

export function createBeforeRender< TView extends TwigViewInterface >( view: TView ): void {
	view._ensureViewIsIntact();
	view._isRendering = true;
	view.resetChildViewContainer();
	view.triggerMethod( 'before:render', view );
}

export function createAfterRender< TView extends TwigViewInterface >( view: TView ): void {
	view._isRendering = false;
	view.isRendered = true;
	view.triggerMethod( 'render', view );
}

export function rerenderExistingChildren( view: Pick< ElementView, 'children' > ): void {
	view.children?.each( ( childView ) => {
		childView.render();
	} );
}

export async function waitForChildrenToComplete( view: Pick< ElementView, 'children' > ): Promise< void > {
	const promises: Promise< void >[] = [];

	view.children?.each( ( childView ) => {
		if ( childView._currentRenderPromise ) {
			promises.push( childView._currentRenderPromise );
		}
	} );

	if ( promises.length > 0 ) {
		await Promise.all( promises );
	}
}
