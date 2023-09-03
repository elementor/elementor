import { Skeleton } from '@elementor/ui';

const SkeletonPlaceholders = ( { sx = {}, ...props } ) => (
	<>
		{
			Array( 3 ).fill( true ).map( ( _, index ) => (
				<Skeleton
					width="100%"
					key={ index }
					animation="wave"
					variant="rounded"
					{ ...props }
					sx={ { borderRadius: ( { border } ) => border.size.md, ...sx } }
				/>
			) )
		}
	</>
);

SkeletonPlaceholders.propTypes = {
	sx: PropTypes.object,
};

export default SkeletonPlaceholders;
