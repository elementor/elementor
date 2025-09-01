export const mockSetFilters = jest.fn();
export const mockOnClearFilter = jest.fn();

export const setupMocks = () => {
	jest.clearAllMocks();
	return {
		mockSetFilters,
		mockOnClearFilter,
	};
};
