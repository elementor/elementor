import SettingsFormSave, { isNavigationLeavingCurrentScreen, serializeSettingsForm } from 'elementor-admin/settings-form-save';

describe( 'serializeSettingsForm', () => {
	// Arrange
	const createForm = ( html ) => {
		const form = document.createElement( 'form' );
		form.innerHTML = html;

		return form;
	};

	it( 'should ignore disabled and unchecked checkbox fields', () => {
		// Arrange
		const form = createForm( `
			<input type="checkbox" name="enabled" value="yes" checked>
			<input type="checkbox" name="skipped" value="yes">
			<input type="checkbox" name="off" value="yes" disabled>
		` );

		// Act
		const snapshot = serializeSettingsForm( form );

		// Assert
		expect( snapshot ).toContain( 'enabled\u0000yes' );
		expect( snapshot ).not.toContain( 'skipped' );
		expect( snapshot ).not.toContain( 'off' );
	} );

	it( 'should produce the same snapshot when values are unchanged', () => {
		// Arrange
		const form = createForm( `
			<input type="text" name="b_field" value="2">
			<input type="text" name="a_field" value="1">
		` );

		// Act
		const first = serializeSettingsForm( form );
		const second = serializeSettingsForm( form );

		// Assert
		expect( first ).toBe( second );
	} );
} );

describe( 'isNavigationLeavingCurrentScreen', () => {
	it( 'should allow in-page settings tab hash navigation', () => {
		// Arrange
		const current = 'https://example.com/wp-admin/admin.php?page=elementor-settings#tab-general';
		const target = 'https://example.com/wp-admin/admin.php?page=elementor-settings#tab-features';

		// Act
		const leaves = isNavigationLeavingCurrentScreen( current, target );

		// Assert
		expect( leaves ).toBe( false );
	} );

	it( 'should block navigation to another elementor admin screen', () => {
		// Arrange
		const current = 'https://example.com/wp-admin/admin.php?page=elementor-settings';
		const target = 'https://example.com/wp-admin/admin.php?page=elementor-tools';

		// Act
		const leaves = isNavigationLeavingCurrentScreen( current, target );

		// Assert
		expect( leaves ).toBe( true );
	} );
} );

describe( 'SettingsFormSave', () => {
	// Arrange
	const createForm = () => {
		const form = document.createElement( 'form' );
		form.innerHTML = `
			<input type="text" name="sample" value="initial">
			<input type="submit" id="submit" class="button button-primary" value="Save Changes">
		`;
		document.body.appendChild( form );

		return form;
	};

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should disable submit until a field changes', () => {
		// Arrange
		const form = createForm();
		const saveHandler = new SettingsFormSave( form );
		const submit = form.querySelector( '#submit' );
		const field = form.querySelector( '[name="sample"]' );

		// Act
		field.value = 'updated';
		saveHandler.syncSubmitState();

		// Assert
		expect( submit.disabled ).toBe( false );

		// Act
		field.value = 'initial';
		saveHandler.syncSubmitState();

		// Assert
		expect( submit.disabled ).toBe( true );
	} );

	it( 'should show dirty status when a field changes', () => {
		// Arrange
		const form = createForm();
		form.innerHTML = `
			<input type="text" name="sample" value="initial">
			<p class="elementor-settings-form-actions__status" data-label-dirty="Unsaved changes"></p>
			<input type="submit" id="submit" value="Save">
		`;
		const saveHandler = new SettingsFormSave( form );
		const status = form.querySelector( '.elementor-settings-form-actions__status' );

		// Act
		form.querySelector( '[name="sample"]' ).value = 'updated';
		saveHandler.syncSubmitState();

		// Assert
		expect( status.dataset.state ).toBe( 'dirty' );
		expect( status.textContent ).toBe( 'Unsaved changes' );
	} );
} );