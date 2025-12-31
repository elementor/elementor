import { buildUniqueSelector } from '../switch-to-component';

const COMPONENT_A_INSTANCE_1_ID = 'component-a-instance-1';
const COMPONENT_A_INSTANCE_2_ID = 'component-a-instance-2';
const COMPONENT_B_INSTANCE_ID = 'component-b-instance';
const REGULAR_ELEMENT_ID = 'regular-element';
const COMPONENT_A_DOCUMENT_ID = '100';
const COMPONENT_B_DOCUMENT_ID = '200';

describe( 'buildUniqueSelector', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should return selector for single component instance', () => {
		// Arrange
		document.body.innerHTML = `
			<div data-id="${ COMPONENT_A_INSTANCE_1_ID }" data-elementor-id="${ COMPONENT_A_DOCUMENT_ID }">
				<div class="content">Component A content</div>
			</div>
		`;
		const element = document.querySelector( `[data-id="${ COMPONENT_A_INSTANCE_1_ID }"]` ) as HTMLElement;

		// Act
		const result = buildUniqueSelector( element );

		// Assert
		expect( result ).toBe( `[data-id="${ COMPONENT_A_INSTANCE_1_ID }"]` );
	} );

	it( 'should return chained selector for nested component instances', () => {
		// Arrange
		document.body.innerHTML = `
			<div data-id="${ COMPONENT_A_INSTANCE_1_ID }" data-elementor-id="${ COMPONENT_A_DOCUMENT_ID }">
				<div class="elementor elementor-${ COMPONENT_A_DOCUMENT_ID }">
					<div data-id="${ COMPONENT_B_INSTANCE_ID }" data-elementor-id="${ COMPONENT_B_DOCUMENT_ID }">
						<div class="content">Component B content</div>
					</div>
				</div>
			</div>
		`;
		const element = document.querySelector( `[data-id="${ COMPONENT_B_INSTANCE_ID }"]` ) as HTMLElement;

		// Act
		const result = buildUniqueSelector( element );

		// Assert
		expect( result ).toBe( `[data-id="${ COMPONENT_A_INSTANCE_1_ID }"] [data-id="${ COMPONENT_B_INSTANCE_ID }"]` );
	} );

	it( 'should skip non-component elements in selector chain', () => {
		// Arrange
		document.body.innerHTML = `
			<div data-id="${ COMPONENT_A_INSTANCE_1_ID }" data-elementor-id="${ COMPONENT_A_DOCUMENT_ID }">
				<div class="elementor">
					<div data-id="${ REGULAR_ELEMENT_ID }">
						<div data-id="${ COMPONENT_B_INSTANCE_ID }" data-elementor-id="${ COMPONENT_B_DOCUMENT_ID }">
							<div class="content">Component B content</div>
						</div>
					</div>
				</div>
			</div>
		`;
		const element = document.querySelector( `[data-id="${ COMPONENT_B_INSTANCE_ID }"]` ) as HTMLElement;

		// Act
		const result = buildUniqueSelector( element );

		// Assert
		expect( result ).toBe( `[data-id="${ COMPONENT_A_INSTANCE_1_ID }"] [data-id="${ COMPONENT_B_INSTANCE_ID }"]` );
		expect( result ).not.toContain( REGULAR_ELEMENT_ID );
	} );

	it( 'should differentiate between multiple instances of same nested component', () => {
		// Arrange
		document.body.innerHTML = `
			<div data-id="${ COMPONENT_A_INSTANCE_1_ID }" data-elementor-id="${ COMPONENT_A_DOCUMENT_ID }">
				<div class="elementor">
					<div data-id="${ COMPONENT_B_INSTANCE_ID }" data-elementor-id="${ COMPONENT_B_DOCUMENT_ID }">
						<div class="content">Component B in instance 1</div>
					</div>
				</div>
			</div>
			<div data-id="${ COMPONENT_A_INSTANCE_2_ID }" data-elementor-id="${ COMPONENT_A_DOCUMENT_ID }">
				<div class="elementor">
					<div data-id="${ COMPONENT_B_INSTANCE_ID }" data-elementor-id="${ COMPONENT_B_DOCUMENT_ID }">
						<div class="content">Component B in instance 2</div>
					</div>
				</div>
			</div>
		`;

		const elementsWithSameId = document.querySelectorAll( `[data-id="${ COMPONENT_B_INSTANCE_ID }"]` );
		const componentBInInstance1 = elementsWithSameId[ 0 ] as HTMLElement;
		const componentBInInstance2 = elementsWithSameId[ 1 ] as HTMLElement;

		// Act
		const selectorForInstance1 = buildUniqueSelector( componentBInInstance1 );
		const selectorForInstance2 = buildUniqueSelector( componentBInInstance2 );

		// Assert
		expect( selectorForInstance1 ).toBe( `[data-id="${ COMPONENT_A_INSTANCE_1_ID }"] [data-id="${ COMPONENT_B_INSTANCE_ID }"]` );
		expect( selectorForInstance2 ).toBe( `[data-id="${ COMPONENT_A_INSTANCE_2_ID }"] [data-id="${ COMPONENT_B_INSTANCE_ID }"]` );
		expect( selectorForInstance1 ).not.toBe( selectorForInstance2 );
	} );

	it( 'should return fallback selector for element without data-elementor-id', () => {
		// Arrange
		document.body.innerHTML = `
			<div data-id="${ REGULAR_ELEMENT_ID }">
				<div class="content">Regular element content</div>
			</div>
		`;
		const element = document.querySelector( `[data-id="${ REGULAR_ELEMENT_ID }"]` ) as HTMLElement;

		// Act
		const result = buildUniqueSelector( element );

		// Assert
		expect( result ).toBe( `[data-id="${ REGULAR_ELEMENT_ID }"]` );
	} );

	it( 'should handle deeply nested component instances efficiently', () => {
		// Arrange
		const componentCInstanceId = 'component-c-instance';
		const componentCDocumentId = '300';

		document.body.innerHTML = `
			<div data-id="${ COMPONENT_A_INSTANCE_1_ID }" data-elementor-id="${ COMPONENT_A_DOCUMENT_ID }">
				<div class="elementor">
					<div data-id="container-1">
						<div data-id="${ COMPONENT_B_INSTANCE_ID }" data-elementor-id="${ COMPONENT_B_DOCUMENT_ID }">
							<div class="elementor">
								<div data-id="container-2">
									<div data-id="container-3">
										<div data-id="${ componentCInstanceId }" data-elementor-id="${ componentCDocumentId }">
											<div class="content">Deeply nested component</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
		const element = document.querySelector( `[data-id="${ componentCInstanceId }"]` ) as HTMLElement;

		// Act
		const result = buildUniqueSelector( element );

		// Assert
		expect( result ).toBe(
			`[data-id="${ COMPONENT_A_INSTANCE_1_ID }"] [data-id="${ COMPONENT_B_INSTANCE_ID }"] [data-id="${ componentCInstanceId }"]`
		);
		expect( result ).not.toContain( 'container-1' );
		expect( result ).not.toContain( 'container-2' );
		expect( result ).not.toContain( 'container-3' );
	} );
} );

