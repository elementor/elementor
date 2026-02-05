import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver, type PropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { type ElementView, type RenderContext } from './types';

export type TwigElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
>;

export type TwigRenderContext = {
	id: string;
	type: string;
	settings: Record< string, unknown >;
	base_styles: Record< string, unknown >;
	[ key: string ]: unknown;
};

export type SetupTwigRendererOptions = {
	type: string;
	renderer: DomRenderer;
	element: TwigElementConfig;
};

export type SetupTwigRendererResult = {
	templateKey: string;
	baseStylesDictionary: Record< string, unknown >;
	resolveProps: PropsResolver;
};

export function canBeTwigTemplated( element: Partial< TwigElementConfig > ): element is TwigElementConfig {
	return !! (
		element.atomic_props_schema &&
		element.twig_templates &&
		element.twig_main_template &&
		element.base_styles_dictionary
	);
}

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

	return { templateKey, baseStylesDictionary, resolveProps };
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

export type RenderTwigTemplateOptions< TView extends TwigViewInterface > = {
	view: TView;
	signal: AbortSignal;
	resolveProps: PropsResolver;
	templateKey: string;
	baseStylesDictionary: Record< string, unknown >;
	type: string;
	renderer: DomRenderer;
	buildContext?: ( context: TwigRenderContext ) => TwigRenderContext;
	attachContent: ( html: string ) => void;
};

export async function renderTwigTemplate< TView extends TwigViewInterface >( {
	view,
	signal,
	resolveProps,
	templateKey,
	baseStylesDictionary,
	type,
	renderer,
	buildContext,
	attachContent,
}: RenderTwigTemplateOptions< TView > ): Promise< void > {
	view.triggerMethod( 'before:render:template' );

	if ( signal.aborted ) {
		return;
	}

	const settings = view.model.get( 'settings' ).toJSON();
	const resolvedSettings = await resolveProps( {
		props: settings,
		signal,
		renderContext: view.getResolverRenderContext?.(),
	} );

	if ( signal.aborted ) {
		return;
	}

	let context: TwigRenderContext = {
		id: view.model.get( 'id' ),
		type,
		settings: resolvedSettings,
		base_styles: baseStylesDictionary,
	};

	if ( buildContext ) {
		context = buildContext( context );
	}

	const html = await renderer.render( templateKey, context );

	if ( signal.aborted ) {
		return;
	}

	attachContent( html );

	view.bindUIElements();
	view.triggerMethod( 'render:template' );
}
