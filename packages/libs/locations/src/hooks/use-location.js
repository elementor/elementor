import elementorLocations from '../';

export const useLocation = ( locationName ) => {
	const components = elementorLocations.get( locationName ) ?? [];

	return components;
};
