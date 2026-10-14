export function filterBySearch< T extends { label: string } >( variables: T[], searchValue: string ): T[] {
	const lowerSearchValue = searchValue.toLowerCase();

	return variables.filter( ( variable ) => variable.label.toLowerCase().includes( lowerSearchValue ) );
}
