import elementorLocations from '../';

export const useLocation = ( locationName : string ) => {
	return elementorLocations.get( locationName ) ?? [];
};
