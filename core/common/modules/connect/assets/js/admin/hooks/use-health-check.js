import { useQuery } from 'react-query';

const useHealthCheck = () => {
	return useQuery(
		[],
		async () => {
			return ( await window.top.$e.data.get(
				'connect/health-check',
				{},
				{ refresh: true },
			) ).data;
		}
	);
};

export { useHealthCheck };
export default useHealthCheck;
