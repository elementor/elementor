import { getPostTypeCreateCapability, type Slug } from '../api/post';
import useUser from './use-user';

export default function useCanCreate( postTypeSlug: Slug ): boolean {
	const { data: user } = useUser();
	const capability = getPostTypeCreateCapability( postTypeSlug );

	return !! user?.capabilities?.[ capability ];
}