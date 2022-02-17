import { useQuery } from 'react-query';

const useConnectionTest = () => {
	return useQuery(
		[],
		async () => {
			return ( await window.top.$e.data.get(
				'connect/test',
				{},
				{ refresh: true },
			) ).data;
		}
	);
};

export { useConnectionTest };
export default useConnectionTest;
