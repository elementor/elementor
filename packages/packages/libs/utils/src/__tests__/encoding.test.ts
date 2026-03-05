import { decodeString, encodeString } from '../encoding';

describe('encoding', () => {
	it('should encode and decode mixed Unicode characters', () => {
		const original = 'Hello שלום مرحبا 你好 🎉 /*...*/';
		const encoded = encodeString(original);
		const decoded = decodeString(encoded);

		expect(decoded).toBe(original);
	});

	it('should return fallback on decode error', () => {
		const invalid = 'not-valid-base64!!!';
		const fallback = 'fallback value';
		const decoded = decodeString(invalid, fallback);

		expect(decoded).toBe(fallback);
	});
});
