import SettingsFormSave, {
	isNavigationLeavingCurrentScreen,
	isSafeAdminNavigationDestination,
	resolveAdminNavigationUrl,
	serializeSettingsForm,
} from 'elementor-admin/settings-form-save';

const NAV_AFTER_SAVE_STORAGE_KEY = 'elementor_admin_settings_nav_after_save';
const NAV_AFTER_SAVE_INTENT_KEY = 'elementor_admin_settings_nav_after_save_intent';
const TEST_ORIGIN = 'https://example.com';

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

describe( 'resolveAdminNavigationUrl', () => {
	it( 'should resolve relative admin.php links against the current admin path', () => {
		const baseHref = 'https://example.com/wp-admin/admin.php?page=elementor-role-manager';
		const resolved = resolveAdminNavigationUrl( 'admin.php?page=elementor-element-manager', baseHref );

		expect( resolved ).toBe(
			'https://example.com/wp-admin/admin.php?page=elementor-element-manager',
		);
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

describe( 'isSafeAdminNavigationDestination', () => {
	it( 'should allow same-origin wp-admin URLs', () => {
		const destination = 'https://example.com/wp-admin/admin.php?page=elementor-tools';

		expect(
			isSafeAdminNavigationDestination( destination, TEST_ORIGIN ),
		).toBe( true );
	} );

	it( 'should allow element manager admin URLs', () => {
		const destination = 'https://example.com/wp-admin/admin.php?page=elementor-element-manager';

		expect(
			isSafeAdminNavigationDestination( destination, TEST_ORIGIN ),
		).toBe( true );
	} );

	it( 'should reject cross-origin URLs', () => {
		const destination = 'https://other.test/wp-admin/admin.php?page=elementor-tools';

		expect(
			isSafeAdminNavigationDestination( destination, TEST_ORIGIN ),
		).toBe( false );
	} );

	it( 'should reject non-wp-admin URLs', () => {
		const destination = 'https://example.com/blog/post';

		expect(
			isSafeAdminNavigationDestination( destination, TEST_ORIGIN ),
		).toBe( false );
	} );
} );

describe( 'SettingsFormSave', () => {
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
		sessionStorage.clear();
		delete window.elementorCommon;
	} );

	it( 'should disable submit until a field changes', () => {
		const form = createForm();
		const saveHandler = new SettingsFormSave( form );
		const submit = form.querySelector( '#submit' );
		const field = form.querySelector( '[name="sample"]' );

		field.value = 'updated';
		saveHandler.syncSubmitState();

		expect( submit.disabled ).toBe( false );

		field.value = 'initial';
		saveHandler.syncSubmitState();

		expect( submit.disabled ).toBe( true );
	} );

	it( 'should mark the form dirty when a field changes', () => {
		const form = createForm();
		const saveHandler = new SettingsFormSave( form );

		form.querySelector( '[name="sample"]' ).value = 'updated';
		saveHandler.syncSubmitState();

		expect( form.classList.contains( 'elementor-settings-form-is-dirty' ) ).toBe( true );
	} );

	it( 'should allow navigation when the form is submitted', () => {
		const form = createForm();
		const saveHandler = new SettingsFormSave( form );
		const field = form.querySelector( '[name="sample"]' );

		field.value = 'updated';
		saveHandler.syncSubmitState();

		form.dispatchEvent( new Event( 'submit', { bubbles: true, cancelable: true } ) );

		expect( saveHandler.allowNavigation ).toBe( true );
		expect( sessionStorage.getItem( 'elementor_admin_settings_scroll_y_after_save' ) ).not.toBeNull();
	} );

	it( 'should redirect after save only for safe destinations', () => {
		const assignMock = jest.fn();

		delete window.location;
		window.location = {
			origin: TEST_ORIGIN,
			href: 'https://example.com/wp-admin/admin.php?page=elementor-settings&settings-updated=true',
			search: '?page=elementor-settings&settings-updated=true',
			assign: assignMock,
		};

		sessionStorage.setItem(
			NAV_AFTER_SAVE_STORAGE_KEY,
			'https://example.com/wp-admin/admin.php?page=elementor-tools',
		);
		sessionStorage.setItem( NAV_AFTER_SAVE_INTENT_KEY, '1' );

		const form = createForm();
		new SettingsFormSave( form );

		expect( assignMock ).toHaveBeenCalledWith(
			'https://example.com/wp-admin/admin.php?page=elementor-tools',
		);
		expect( sessionStorage.getItem( NAV_AFTER_SAVE_STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( NAV_AFTER_SAVE_INTENT_KEY ) ).toBeNull();
	} );

	it( 'should not redirect without save-and-navigate intent', () => {
		const assignMock = jest.fn();

		delete window.location;
		window.location = {
			origin: TEST_ORIGIN,
			href: 'https://example.com/wp-admin/admin.php?page=elementor-settings&settings-updated=true',
			search: '?page=elementor-settings&settings-updated=true',
			assign: assignMock,
		};

		sessionStorage.setItem(
			NAV_AFTER_SAVE_STORAGE_KEY,
			'https://example.com/wp-admin/admin.php?page=elementor-tools',
		);

		const form = createForm();
		new SettingsFormSave( form );

		expect( assignMock ).not.toHaveBeenCalled();
	} );

	it( 'should clear unsafe post-save destinations', () => {
		const assignMock = jest.fn();

		delete window.location;
		window.location = {
			origin: TEST_ORIGIN,
			href: 'https://example.com/wp-admin/admin.php?page=elementor-settings&settings-updated=true',
			search: '?page=elementor-settings&settings-updated=true',
			assign: assignMock,
		};

		sessionStorage.setItem(
			NAV_AFTER_SAVE_STORAGE_KEY,
			'https://evil.test/wp-admin/admin.php?page=elementor-tools',
		);
		sessionStorage.setItem( NAV_AFTER_SAVE_INTENT_KEY, '1' );

		const form = createForm();
		new SettingsFormSave( form );

		expect( assignMock ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( NAV_AFTER_SAVE_STORAGE_KEY ) ).toBeNull();
		expect( sessionStorage.getItem( NAV_AFTER_SAVE_INTENT_KEY ) ).toBeNull();
	} );
} );