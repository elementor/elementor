import { createEditorPreviewRenderer } from 'elementor/modules/data-flow/assets/js/data-flow-editor-preview-renderer';

const PAGE_STATE = { count: 1 };
const SCOPE_ID = 'scope-1';
const HEADING_ID = 'heading-1';

const createPreview = () => {
	document.body.innerHTML = `
		<p data-id="page-heading">Count: {{state.count}}</p>
		<div data-id="${ SCOPE_ID }">
			<h2 data-id="${ HEADING_ID }">Scoped: {{state.count}}</h2>
		</div>
	`;

	const entries = {
		[ SCOPE_ID ]: { stateParams: [ { key: 'count', type: 'number', default: 7 } ] },
	};

	return {
		entries,
		renderer: createEditorPreviewRenderer( {
			root: document.body,
			getElementEntry: ( id ) => entries[ id ] ?? {},
			getPageState: () => PAGE_STATE,
		} ),
	};
};

const getText = ( selector ) => document.querySelector( selector ).textContent;

describe( 'createEditorPreviewRenderer', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should render initial values from page state and the enclosing scope', () => {
		// Arrange
		const { renderer } = createPreview();

		// Act
		renderer.render();

		// Assert
		expect( getText( '[data-id="page-heading"]' ) ).toBe( 'Count: 1' );
		expect( getText( `[data-id="${ HEADING_ID }"]` ) ).toBe( 'Scoped: 7' );

		renderer.destroy();
	} );

	it( 'should re-render from the original template when the scope changes', () => {
		// Arrange
		const { renderer, entries } = createPreview();
		renderer.render();

		// Act
		entries[ SCOPE_ID ] = { stateParams: [ { key: 'count', type: 'number', default: 42 } ] };
		renderer.render();

		// Assert
		expect( getText( `[data-id="${ HEADING_ID }"]` ) ).toBe( 'Scoped: 42' );

		renderer.destroy();
	} );

	it( 'should pick up a re-rendered element template', () => {
		// Arrange
		const { renderer } = createPreview();
		renderer.render();

		// Act
		document.querySelector( `[data-id="${ HEADING_ID }"]` ).textContent = 'Now: {{state.count}}!';
		renderer.render();

		// Assert
		expect( getText( `[data-id="${ HEADING_ID }"]` ) ).toBe( 'Now: 7!' );

		renderer.destroy();
	} );
} );
