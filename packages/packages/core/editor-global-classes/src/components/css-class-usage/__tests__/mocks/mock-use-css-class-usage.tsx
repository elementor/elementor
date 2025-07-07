jest.mock( '../../hooks/use-css-class-usage' );

require( '../../hooks/use-css-class-usage' ).useCssClassUsage.mockReturnValue( {
	data: {},
	isLoading: false,
} );

export const mockUseCssClassUsage = ( data: any, isLoading = false ) => {
	require( '../../hooks/use-css-class-usage' ).useCssClassUsage.mockReturnValue( {
		data,
		isLoading,
	} );
};
