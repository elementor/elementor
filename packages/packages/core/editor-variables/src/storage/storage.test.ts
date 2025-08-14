import { Storage } from './storage';

describe('Storage.load()', () => {
	it('should load variables from localStorage', () => {
		// Arrange
		const storage = new Storage();
		const mockGetItem = jest.fn().mockReturnValue('{}');
		Object.defineProperty(window, 'localStorage', {
			value: { getItem: mockGetItem },
		});

		// Act
		const result = storage.load();

		// Assert
		expect(result).toEqual({});
	});
});
