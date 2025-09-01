import { useEffect, useRef } from 'react';

import media from '../media';
import normalize from '../normalize';
import { type Attachment } from '../types/attachment';
import { type MediaFrame } from '../types/wp-media';
import wpPluploadSettings from '../wp-plupload-settings';

export type OpenOptions = {
	mode?: 'upload' | 'browse';
};

export type MediaType = 'image' | 'svg';

type Options = {
	mediaTypes: MediaType[];
	title?: string;
} & (
	| {
			multiple: true;
			selected: Array< number | null >;
			onSelect: ( val: Attachment[] ) => void;
	  }
	| {
			multiple: false;
			selected: number | null;
			onSelect: ( val: Attachment ) => void;
	  }
);

export default function useWpMediaFrame( options: Options ) {
	const frame = useRef< MediaFrame >();

	const open = ( openOptions: OpenOptions = {} ) => {
		cleanupFrame( frame.current );

		frame.current = createFrame( { ...options, ...openOptions } );

		frame.current?.open();
	};

	useEffect( () => {
		return () => {
			cleanupFrame( frame.current );
		};
	}, [] );

	return {
		open,
	};
}

function createFrame( { onSelect, multiple, mediaTypes, selected, title, mode = 'browse' }: Options & OpenOptions ) {
	const frame: MediaFrame = media()( {
		title,
		multiple,
		library: {
			type: getMimeTypes( mediaTypes ),
		},
	} )
		.on( 'open', () => {
			setTypeCaller( frame );
			applyMode( frame, mode );
			applySelection( frame, selected );
		} )
		.on( 'close', () => cleanupFrame( frame ) )
		.on( 'insert select', () => select( frame, multiple, onSelect ) );

	handleExtensions( frame, mediaTypes );

	return frame;
}

function cleanupFrame( frame?: MediaFrame ) {
	frame?.detach();
	frame?.remove();
}

function applyMode( frame: MediaFrame, mode: OpenOptions[ 'mode' ] = 'browse' ) {
	frame.content.mode( mode );
}

function applySelection( frame: MediaFrame, selected: number | null | Array< number | null > ) {
	const selectedAttachments = ( typeof selected === 'number' ? [ selected ] : selected )
		?.filter( ( id ) => !! id )
		.map( ( id ) => media().attachment( id as number ) );

	frame
		.state()
		.get( 'selection' )
		.set( selectedAttachments || [] );
}

function select( frame: MediaFrame, multiple: boolean, onSelect: Options[ 'onSelect' ] ) {
	const attachments = frame.state().get( 'selection' ).toJSON().map( normalize );

	const onSelectFn = onSelect as ( val: Attachment | Attachment[] ) => void;

	onSelectFn( multiple ? attachments : attachments[ 0 ] );
}

function setTypeCaller( frame: MediaFrame ) {
	frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-wp-media-upload' );
}

function handleExtensions( frame: MediaFrame, mediaTypes: MediaType[] ) {
	const defaultExtensions = wpPluploadSettings().defaults.filters.mime_types?.[ 0 ]?.extensions;

	// Set extensions by media types
	frame.on( 'ready', () => {
		wpPluploadSettings().defaults.filters.mime_types = [ { extensions: getExtensions( mediaTypes ) } ];
	} );

	// Restore default upload extensions
	frame.on( 'close', () => {
		wpPluploadSettings().defaults.filters.mime_types = defaultExtensions
			? [ { extensions: defaultExtensions } ]
			: [];
	} );
}

const imageExtensions = [ 'avif', 'bmp', 'gif', 'ico', 'jpe', 'jpeg', 'jpg', 'png', 'webp' ];

function getMimeTypes( mediaTypes: MediaType[] ) {
	const mimeTypesPerType: Record< MediaType, string[] > = {
		image: imageExtensions.map( ( extension ) => `image/${ extension }` ),
		svg: [ 'image/svg+xml' ],
	};

	return mediaTypes.reduce( ( prev, currentType ) => {
		return prev.concat( mimeTypesPerType[ currentType ] );
	}, [] as string[] );
}

function getExtensions( mediaTypes: MediaType[] ) {
	const extensionsPerType: Record< MediaType, string[] > = {
		image: imageExtensions,
		svg: [ 'svg' ],
	};

	const extensions = mediaTypes.reduce( ( prev, currentType ) => {
		return prev.concat( extensionsPerType[ currentType ] );
	}, [] as string[] );

	return extensions.join( ',' );
}
