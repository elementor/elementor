import { Skeleton } from '@elementor/ui';

const SkeletonPlaceholders = ( props ) => (
	<>
		{
			Array( 3 ).fill( true ).map( ( _, index ) => (
				<Skeleton
					width="100%"
					key={ index }
					animation="wave"
					variant="rounded"
					{ ...props }
				/>
			) )
		}
	</>
);

export default SkeletonPlaceholders;
