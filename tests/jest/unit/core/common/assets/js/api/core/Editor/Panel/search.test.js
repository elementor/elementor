import LocalizedValueStore from 'elementor-editor-utils/localized-value-store';
import UserEvents from 'elementor-editor-utils/user-events';

describe( 'Localization store', () => {
	function builtKeyInputEvent( originalEventKey, keyCode, originalEventData, targetValue ) {
		return {
			keyCode: keyCode,
			originalEvent: { key: originalEventKey, data: originalEventData },
			target: { value: targetValue },
		};
	}

	test( 'should localize non english value', () => {
		const localizedValueStore = new LocalizedValueStore();
		const event = builtKeyInputEvent( 'נ', 66, 'KeyB', '' );
		localizedValueStore.sendKey( event );
		expect( localizedValueStore.get() ).toEqual( 'B' );
	} );
	test( 'should store entire strings', () => {
		const localizedValueStore = new LocalizedValueStore();
		localizedValueStore.sendKey( builtKeyInputEvent( 'נ', 66, 'KeyB', '' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'נ', 66, 'KeyB', 'נ' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'נ', 66, 'KeyB', 'ננ' ) );
		expect( localizedValueStore.get() ).toEqual( 'BBB' );
	} );
	test( 'should include spaces in localized value', () => {
		const localizedValueStore = new LocalizedValueStore();
		localizedValueStore.sendKey( builtKeyInputEvent( 'נ', 66, 'KeyB', '' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( ' ', 32, ' ', 'נ' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'נ', 66, 'KeyB', 'נ ' ) );
		expect( localizedValueStore.get() ).toEqual( 'B B' );
	} );
	test( 'should support english value', () => {
		const localizedValueStore = new LocalizedValueStore();
		localizedValueStore.sendKey( builtKeyInputEvent( 'B', 66, 'KeyB', '' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'b', 66, 'KeyB', 'B' ) );
		expect( localizedValueStore.get() ).toEqual( 'BB' );
	} );
	test( 'should rebuild localized value when input value was truncated', () => {
		const localizedValueStore = new LocalizedValueStore();
		localizedValueStore.sendKey( builtKeyInputEvent( 'א', 84, 'KeyT', '' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'ב', 67, 'KeyC', 'א' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'ג', 68, 'KeyD', 'אב' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'ד', 66, '', 'אבג' ) );
		localizedValueStore.sendKey( builtKeyInputEvent( 'Delete', 46, undefined, 'אג' ) );
		expect( localizedValueStore.get() ).toEqual( 'TD' );
	} );
} );

describe( 'User events', () => {
	function builtPasteEvent( originalEventInputType, ctrlKey, code ) {
		return {
			code: code,
			ctrlKey: ctrlKey,
			originalEvent: { inputType: originalEventInputType },
		};
	}
	const insertFromPaste = 'insertFromPaste';
	test( 'should return true when Control + V was pressed', () => {
		const isPaste = UserEvents.isPaste( builtPasteEvent( undefined, true, 'KeyV' ) );
		expect( isPaste ).toBe( true );
	} );
	test( 'should return false when Control + V was not', () => {
		const isPaste = UserEvents.isPaste( builtPasteEvent( undefined, true, 'KeyC' ) );
		expect( isPaste ).toBe( false );
	} );
	test( 'should return true when pasting from context menu', () => {
		const isPaste = UserEvents.isPaste( builtPasteEvent( insertFromPaste, false, undefined ) );
		expect( isPaste ).toBe( true );
	} );
	test( 'should return false when using another context menu', () => {
		const isPaste = UserEvents.isPaste( builtPasteEvent( 'deleteByCut', false, undefined ) );
		expect( isPaste ).toBe( false );
	} );
}
);
