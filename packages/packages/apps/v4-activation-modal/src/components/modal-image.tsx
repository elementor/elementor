import * as React from 'react';
import { useMemo, useState } from 'react';
import { Box, Skeleton, type Theme } from '@elementor/ui';

type ImageEntry = {
	id: string;
	src: string;
};

type ModalImageProps = {
	id: string;
	images: ImageEntry[];
};

export const ModalImage: React.FC< ModalImageProps > = ( { id, images } ) => {
	const [ loadedIds, setLoadedIds ] = useState< Record< string, boolean > >( {} );

    const showSkeleton = useMemo( () => images.some( ( img ) => ! loadedIds[ img.id ] ), [ images, loadedIds ] );

	const markLoaded = ( key: string ) => setLoadedIds( ( prev ) => ( { ...prev, [ key ]: true } ) );

	return (
		<>
			{ showSkeleton && <Skeleton variant="rectangular" width="80%" height="60%" /> }
			{ images.map( ( { id: key, src } )  => (
				<Box
					key={ key }
					component="img"
					src={ src }
					alt={ `Modal image ${ key }` }
					onLoad={ () => markLoaded( key ) }
					onError={ () => markLoaded( key ) }
					sx={ {
						display: showSkeleton ? 'none' : 'block',
						width: key === id ? '100%' : '0',
						height: key === id ? '100%' : '0',
						opacity: key === id ? 1 : 0,
						objectFit: 'cover',
						objectPosition: 'left top',
						transition: ( theme: Theme ) =>
							theme.transitions.create( [ 'opacity' ], {
								easing: theme.transitions.easing.sharp,
								duration: theme.transitions.duration.enteringScreen,
							} ),
					} }
				/>
			) ) 
			}
		</>
	);
};
