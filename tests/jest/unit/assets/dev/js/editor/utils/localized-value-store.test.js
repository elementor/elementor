import LocalizedValueStore from 'elementor-editor-utils/localized-value-store';

describe( 'Localized value store', () => {
	test( 'Should localize non english values', () => {
		// Arrange.
		const localizedValueStore = new LocalizedValueStore();

		// Act.
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'נ', 66, 'KeyB', '' ) );
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'נ', 66, 'KeyB', 'נ' ) );
		const localizedData = localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'נ', 66, 'KeyB', 'ננ' ) );

		// Assert.
		expect( localizedData ).toEqual( 'BBB' );
	} );

	test( 'Should include spaces in localized value', () => {
		// Arrange.
		const localizedValueStore = new LocalizedValueStore();

		// Act.
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'נ', 66, 'KeyB', '' ) );
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( ' ', 32, ' ', 'נ' ) );
		const localizedData = localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'נ', 66, 'KeyB', 'נ ' ) );

		// Assert.
		expect( localizedData ).toEqual( 'B B' );
	} );

	test( 'Should retain character case when localization not required', () => {
		// Arrange.
		const localizedValueStore = new LocalizedValueStore();

		// Act.
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'B', 66, 'KeyB', '' ) );
		const localizedData = localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'b', 66, 'KeyB', 'B' ) );

		// Assert.
		expect( localizedData ).toEqual( 'Bb' );
	} );

	test( 'Should rebuild localized value when input value was truncated', () => {
		// Arrange.
		const localizedValueStore = new LocalizedValueStore();

		// Act.
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'א', 84, 'KeyT', '' ) );
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'ב', 67, 'KeyC', 'א' ) );
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'ג', 68, 'KeyD', 'אב' ) );
		localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'ד', 66, '', 'אבג' ) );
		const localizedData = localizedValueStore.appendAndParseLocalizedData( builtKeyInputEvent( 'Delete', 46, undefined, 'אג' ) );

		// Assert.
		expect( localizedData ).toEqual( 'TD' );
	} );

	test( 'Should return empty string when Control + V was pressed', () => {
		// Arrange.
		const localizedValueStore = new LocalizedValueStore();

		// Act.
		const localizedData = localizedValueStore.appendAndParseLocalizedData( builtPasteEvent( undefined, true, 'KeyV' ) );

		// Assert.
		expect( localizedData ).toBe( '' );
	} );

	test( 'Should return empty string when pasting from context menu', () => {
		// Arrange.
		const localizedValueStore = new LocalizedValueStore();

		// Act.
		const localizedData = localizedValueStore.appendAndParseLocalizedData( builtPasteEvent( 'insertFromPaste', false, undefined ) );

		// Assert.
		expect( localizedData ).toBe( '' );
	} );
} );

function builtKeyInputEvent( originalEventKey, keyCode, originalEventData, targetValue ) {
	return {
		keyCode,
		originalEvent: { key: originalEventKey, data: originalEventData },
		target: { value: targetValue },
	};
}

function builtPasteEvent( originalEventInputType, ctrlKey, code ) {
	return {
		code,
		ctrlKey,
		originalEvent: { inputType: originalEventInputType },
	};
}
