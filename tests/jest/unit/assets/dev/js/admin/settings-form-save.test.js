import SettingsFormSave, { isNavigationLeavingCurrentScreen, serializeSettingsForm } from 'elementor-admin/settings-form-save';

describe( 'serializeSettingsForm', () => {
	const createForm = ( html ) => {
		const form = document.createElement( 'form' );
		form.innerHTML = html;

		return form;
	};

	it( 'should ignore disabled and unchecked checkbox fields', () => {
		const form = createForm( `
			<input type="checkbox" name="enabled" value="yes" checked>
			<input type="checkbox" name="skipped" value="yes">
			<input type="checkbox" name="off" value="yes" disabled>
		` );

		const snapshot = serializeSettingsForm( form );

		expect( snapshot ).toContain( 'enabled\u0000yes' );
		expect( snapshot ).not.toContain( 'skipped' );
		expect( snapshot ).not.toContain( 'off' );
	} );

	it( 'should produce the same snapshot when values are unchanged', () => {
		const form = createForm( `
			<input type="text" name="b_field" value="2">
			<input type="text" name="a_field" value="1">
		` );

		const first = serializeSettingsForm( form );
		const second = serializeSettingsForm( form );

		expect( first ).toBe( second );
	} );
} );

describe( 'isNavigationLeavingCurrentScreen', () => {
	it( 'should allow in-page settings tab hash navigation', () => {
		const current = 'https://example.com/wp-admin/admin.php?page=elementor-settings#tab-general';
		const target = 'https://example.com/wp-admin/admin.php?page=elementor-settings#tab-features';

		expect( isNavigationLeavingCurrentScreen( current, target ) ).toBe( false );
	} );

	it( 'should block navigation to another elementor admin screen', () => {
		const current = 'https://example.com/wp-admin/admin.php?page=elementor-settings';
		const target = 'https://example.com/wp-admin/admin.php?page=elementor-tools';

		expect( isNavigationLeavingCurrentScreen( current, target ) ).toBe( true );
	} );
} );

describe( 'SettingsFormSave', () => {
	const createForm = () => {
		const form = document.createElement( 'form' );
		form.innerHTML = `
			<input type="text" name="sample" value="initial">
			<div class="elementor-settings-autosave-config" data-toast-saved="Saved" data-toast-saved-with-label="%s done"></div>
			<input type="submit" id="submit" class="button" value="Save">
		`;
		document.body.appendChild( form );

		return form;
	};

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'should mark the form dirty when a field changes', () => {
		const form = createForm();
		const saveHandler = new SettingsFormSave( form );
		const field = form.querySelector( '[name="sample"]' );

		field.value = 'updated';
		saveHandler.syncDirtyState();

		expect( form.classList.contains( 'elementor-settings-form-is-dirty' ) ).toBe( true );
	} );

	it( 'should build a label-specific toast message when available', () => {
		const form = createForm();
		const row = document.createElement( 'tr' );
		row.innerHTML = '<th><label>Post Types</label></th><td><input name="post_types" value="1"></td>';
		form.querySelector( '[name="sample"]' ).closest( 'form' ).appendChild( row );

		const saveHandler = new SettingsFormSave( form );

		saveHandler.lastChangedFieldLabel = 'Post Types';

		expect( saveHandler.buildSuccessToastMessage() ).toBe( 'Post Types done' );
	} );
} );