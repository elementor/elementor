import { act, renderHook } from '@testing-library/react';

import { acquireSidebarRailLock, useIsSidebarRailLocked } from '../rail-lock';

describe( 'sidebar rail lock', () => {
	it( 'should lock the rail for everyone except the owner', () => {
		// Arrange.
		const { result: anyone } = renderHook( () => useIsSidebarRailLocked() );
		const { result: owner } = renderHook( () => useIsSidebarRailLocked( 'a' ) );

		// Act.
		let release = () => {};

		act( () => {
			release = acquireSidebarRailLock( 'a' );
		} );

		// Assert.
		expect( anyone.current ).toBe( true );
		expect( owner.current ).toBe( false );

		// Cleanup.
		act( () => release() );
	} );

	it( 'should unlock the rail when the owner releases', () => {
		// Arrange.
		const { result } = renderHook( () => useIsSidebarRailLocked() );
		let release = () => {};

		act( () => {
			release = acquireSidebarRailLock( 'a' );
		} );

		// Act.
		act( () => release() );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should ignore a stale release from a previous owner', () => {
		// Arrange.
		const { result } = renderHook( () => useIsSidebarRailLocked() );
		let releaseB = () => {};
		let releaseA = () => {};

		act( () => {
			releaseB = acquireSidebarRailLock( 'b' );
			releaseA = acquireSidebarRailLock( 'a' );
		} );

		// Act.
		act( () => releaseB() );

		// Assert.
		expect( result.current ).toBe( true );

		// Cleanup.
		act( () => releaseA() );

		expect( result.current ).toBe( false );
	} );
} );
