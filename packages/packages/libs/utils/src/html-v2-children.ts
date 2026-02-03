export type HtmlV2Child = {
	id: string;
	type: string;
	content?: string;
	children?: HtmlV2Child[];
};

export type HtmlV2Value = {
	content: string | null;
	children?: HtmlV2Child[];
};

type BuildOptions = {
	parseChildren?: boolean;
};

export const buildHtmlV2Value = ( content: string, previous: HtmlV2Value | null, options: BuildOptions = {} ) => {
	const parseChildren = options.parseChildren ?? true;
	const previousChildren = previous?.children ?? [];

	return {
		content,
		children: parseChildren ? parseHtmlChildren( content, previousChildren ) : previousChildren,
	};
};

export const parseHtmlChildren = ( html: string, previousChildren: HtmlV2Child[] = [] ): HtmlV2Child[] => {
	if ( typeof window === 'undefined' ) {
		return previousChildren;
	}

	if ( ! html ) {
		return [];
	}

	const container = window.document.createElement( 'div' );
	container.innerHTML = html;

	const reusedIds = flattenChildIds( previousChildren );
	let generatedIndex = 0;

	const nextId = () => reusedIds.shift() ?? `elem${ ++generatedIndex }`;

	const buildChildren = ( element: Element ): HtmlV2Child[] => {
		const children: HtmlV2Child[] = [];

		Array.from( element.childNodes ).forEach( ( node ) => {
			if ( node.nodeType !== Node.ELEMENT_NODE ) {
				return;
			}

			const childElement = node as Element;
			const nestedChildren = buildChildren( childElement );
			const textContent = childElement.textContent ?? '';

			children.push( {
				id: nextId(),
				type: childElement.tagName.toLowerCase(),
				...( textContent ? { content: textContent } : {} ),
				...( nestedChildren.length ? { children: nestedChildren } : {} ),
			} );
		} );

		return children;
	};

	return buildChildren( container );
};

const flattenChildIds = ( children: HtmlV2Child[] ): string[] => {
	const ids: string[] = [];

	for ( const child of children ) {
		if ( child.id ) {
			ids.push( child.id );
		}

		if ( child.children?.length ) {
			ids.push( ...flattenChildIds( child.children ) );
		}
	}

	return ids;
};
