// Add JSDOM matchers.
import '@testing-library/jest-dom';
import '@wordpress/jest-console';

import {
	__privateFlushListeners as flushListeners,
	__privateSetReady as setReady,
} from '@elementor/editor-v1-adapters';
import { __resetEnv } from '@elementor/env';
import { __flushAllInjections } from '@elementor/locations';
import { __deleteStore } from '@elementor/store';
import { TextEncoder, TextDecoder } from 'util';

jest.mock( '@elementor/http-client' );
jest.mock( '@elementor/editor-mcp', () => ( {} ) );
globalThis.structuredClone = ( value ) => JSON.parse( JSON.stringify( value ) );
globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

globalThis.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

globalThis.DOMRect = class DOMRect {
	x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      // Computed values based on the spec
      this.top = height < 0 ? y + height : y;
      this.right = width < 0 ? x : x + width;
      this.bottom = height < 0 ? y : y + height;
      this.left = width < 0 ? x + width : x;
    }

    static fromRect(rectangle?: DOMRectInit): DOMRect {
      return new DOMRect(
        rectangle?.x,
        rectangle?.y,
        rectangle?.width,
        rectangle?.height
      );
    }

    toJSON(): any {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        right: this.right,
        bottom: this.bottom,
        left: this.left,
      };
    }
}


let globalOriginalProps: PropertyKey[];

// disable MCP initialization during tests
(globalThis as Record<string, unknown>).__ELEMENTOR_MCP_DISABLED__ = true;

beforeEach( () => {
	/* eslint-disable no-console */
	// The mocks already created at `@wordpress/jest-console`
	// here it just ensure that nothing will be prompt to the console.
	jest.mocked( console.error ).mockImplementation( () => null );
	jest.mocked( console.warn ).mockImplementation( () => null );
	jest.mocked( console.info ).mockImplementation( () => null );
	/* eslint-enable no-console */

	setReady( true );

	globalOriginalProps = Object.keys( globalThis );
} );

afterEach( () => {
	jest.clearAllMocks();
	jest.useRealTimers();

	__flushAllInjections();
	flushListeners();
	__deleteStore();
	__resetEnv();

	// Delete all the props that were added to the global.
	Object.keys( globalThis ).forEach( ( key ) => {
		if ( ! globalOriginalProps.includes( key ) ) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete ( globalThis as unknown as Record< PropertyKey, unknown > )[ key ];
		}
	} );
} );
