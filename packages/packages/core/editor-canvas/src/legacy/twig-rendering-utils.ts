import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver, type PropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { type ElementView, type RenderContext } from './types';

type TwigElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
>;

type TwigRenderState = {
	templateKey: string;
	resolveProps: PropsResolver;
	renderer: DomRenderer;
	cacheState: RenderCacheState;
};

type CreateTwigRenderStateOptions = {
	renderer: DomRenderer;
	element: TwigElementConfig;
};

export function createTwigRenderState( { renderer, element }: CreateTwigRenderStateOptions ): TwigRenderState {
	const templateKey = element.twig_main_template;

	const cacheState = createRenderCacheState();

	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	const resolveProps = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return { templateKey, resolveProps, renderer, cacheState };
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

type RenderCacheState = {
	lastResolvedSettingsHash: string | null;
	domUpdateWasSkipped: boolean;
	invalidate: () => void;
};

export function createRenderCacheState(): RenderCacheState {
	return {
		lastResolvedSettingsHash: null,
		domUpdateWasSkipped: false,
		invalidate() {
			this.lastResolvedSettingsHash = null;
			this.domUpdateWasSkipped = false;
		},
	};
}

type TwigRenderContext = {
	id: string;
	type: string;
	settings: Record< string, unknown >;
	base_styles: Record< string, unknown >;
	[ key: string ]: unknown;
};

export type RenderTwigTemplateOptions< TView extends TwigViewInterface > = {
	view: TView;
	signal?: AbortSignal;
	renderState: TwigRenderState;
	buildContext: ( resolvedSettings: Record< string, unknown > ) => TwigRenderContext;
	attachContent: ( html: string ) => void;
	afterSettingsResolve?: ( settings: Record< string, unknown > ) => Record< string, unknown >;
};

export async function renderTwigTemplate< TView extends TwigViewInterface >( {
	view,
	signal,
	renderState,
	buildContext,
	attachContent,
	afterSettingsResolve,
}: RenderTwigTemplateOptions< TView > ): Promise< void > {
	view.triggerMethod( 'before:render:template' );
	const { resolveProps, cacheState, renderer, templateKey } = renderState;

	if ( signal?.aborted ) {
		return;
	}

	const settings = view.model.get( 'settings' ).toJSON();
	let resolvedSettings = await resolveProps( {
		props: settings,
		signal,
		renderContext: view.getResolverRenderContext?.(),
	} );

	if ( signal?.aborted ) {
		return;
	}

	if ( afterSettingsResolve ) {
		resolvedSettings = afterSettingsResolve( resolvedSettings );
	}

	const settingsHash = JSON.stringify( resolvedSettings );
	const settingsChanged = settingsHash !== cacheState.lastResolvedSettingsHash;

	if ( ! settingsChanged && view.isRendered ) {
		cacheState.domUpdateWasSkipped = true;
		view.bindUIElements();
		view.triggerMethod( 'render:template' );
		return;
	}

	cacheState.domUpdateWasSkipped = false;
	cacheState.lastResolvedSettingsHash = settingsHash;

	const context = buildContext( resolvedSettings );
	const html = await renderer.render( templateKey, context );

	if ( signal?.aborted ) {
		return;
	}

	attachContent( html );

	view.bindUIElements();
	view.triggerMethod( 'render:template' );
}

export type ChildrenCollection = ElementView[ 'children' ];

export function collectChildrenRenderPromises( children: ChildrenCollection | undefined ): Promise< void >[] {
	const promises: Promise< void >[] = [];

	children?.each( ( childView: ElementView ) => {
		if ( childView._currentRenderPromise ) {
			promises.push( childView._currentRenderPromise );
		}
	} );

	return promises;
}

type RenderChildrenOptions = {
	children: ChildrenCollection | undefined;
	domUpdateWasSkipped: boolean;
	renderChildren: () => void;
};

export async function renderChildrenWithOptimization( {
	children,
	domUpdateWasSkipped,
	renderChildren,
}: RenderChildrenOptions ): Promise< void > {
	// Safe side: when children is empty, fall back to original renderChildren function to handle emptyView.
	const shouldReuseChildren = domUpdateWasSkipped && !! children?.length;

	if ( shouldReuseChildren ) {
		rerenderExistingChildViews( children );
	} else {
		renderChildren();
	}

	const promises = collectChildrenRenderPromises( children );
	await waitForChildrenToComplete( promises );
}

function rerenderExistingChildViews( children: ChildrenCollection | undefined ) {
	children?.each( ( childView ) => childView.render() );
}

async function waitForChildrenToComplete( promises: Promise< void >[] ): Promise< void > {
	if ( promises.length > 0 ) {
		await Promise.all( promises );
	}
}
