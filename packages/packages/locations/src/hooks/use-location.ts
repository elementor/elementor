import elementorLocations from '../index';

export const useLocation = ( locationName : string ) => {
	return elementorLocations.get( locationName ) ?? [];
};
