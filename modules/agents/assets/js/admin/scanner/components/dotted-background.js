import { useEffect, useRef } from 'react';
import Box from '@elementor/ui/Box';

import { DOT_FIELD, REDUCED_MOTION_MEDIA, SCANNER_MOTION } from '../scanner-constants';

const hashCell = ( column, row ) => {
	const value = Math.sin( ( column * DOT_FIELD.hashColumn ) + ( row * DOT_FIELD.hashRow ) ) * DOT_FIELD.hashScale;

	return value - Math.floor( value );
};

const opacityFor = ( column, row ) => {
	const biased = Math.pow( hashCell( column, row ), DOT_FIELD.opacityBias );
	const bucket = Math.min( DOT_FIELD.opacitySteps - 1, Math.floor( biased * DOT_FIELD.opacitySteps ) );

	return DOT_FIELD.opacityMin + ( bucket * DOT_FIELD.opacityStep );
};

const resolveGridSpacing = ( width, height ) => {
	const baseGrid = DOT_FIELD.grid;
	const dotCount = Math.ceil( width / baseGrid ) * Math.ceil( height / baseGrid );

	if ( dotCount <= DOT_FIELD.maxDots ) {
		return baseGrid;
	}

	return baseGrid * Math.sqrt( dotCount / DOT_FIELD.maxDots );
};

const buildDots = ( width, height ) => {
	const gridSpacing = resolveGridSpacing( width, height );
	const columns = Math.ceil( width / gridSpacing );
	const rows = Math.ceil( height / gridSpacing );
	const dots = [];

	for ( let row = 0; row < rows; row++ ) {
		for ( let column = 0; column < columns; column++ ) {
			const x = column * gridSpacing;
			const y = row * gridSpacing;
			const hashColumn = Math.floor( x / DOT_FIELD.grid );
			const hashRow = Math.floor( y / DOT_FIELD.grid );

			dots.push( {
				x,
				y,
				base: opacityFor( hashColumn, hashRow ),
				phase: ( hashColumn * DOT_FIELD.driftScaleX ) + ( hashRow * DOT_FIELD.driftScaleY ),
				phaseAlt: ( hashRow * DOT_FIELD.driftScaleY ) - ( hashColumn * DOT_FIELD.driftScaleX ),
			} );
		}
	}

	return dots;
};

const shimmerOpacity = ( dot, cycle ) => {
	const primary = Math.sin( cycle + dot.phase );
	const secondary = Math.sin( ( cycle * DOT_FIELD.secondaryDrift ) + dot.phaseAlt );
	const wave = ( primary + secondary ) / 2;
	const lift = DOT_FIELD.opacityFloor + ( ( 1 - DOT_FIELD.opacityFloor ) * ( ( wave + 1 ) / 2 ) );

	return dot.base * lift;
};

export const DottedBackground = () => {
	const canvasRef = useRef( null );

	useEffect( () => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext?.( '2d' );

		if ( ! canvas || ! context ) {
			return undefined;
		}

		const motionQuery = window.matchMedia( REDUCED_MOTION_MEDIA );
		let dots = [];
		let width = 0;
		let height = 0;
		let frameId = 0;

		const rebuild = () => {
			const nextWidth = canvas.clientWidth;
			const nextHeight = canvas.clientHeight;

			if ( ! nextWidth || ! nextHeight || ( nextWidth === width && nextHeight === height ) ) {
				return;
			}

			width = nextWidth;
			height = nextHeight;
			const ratio = Math.min( window.devicePixelRatio || 1, DOT_FIELD.maxDevicePixelRatio );

			canvas.width = Math.floor( width * ratio );
			canvas.height = Math.floor( height * ratio );
			context.setTransform( ratio, 0, 0, ratio, 0, 0 );
			dots = buildDots( width, height );
		};

		const paint = ( elapsedMs ) => {
			rebuild();
			context.clearRect( 0, 0, width, height );

			const reduced = motionQuery.matches;
			const cycle = reduced ? 0 : ( elapsedMs / SCANNER_MOTION.dotShimmerMs ) * Math.PI * 2;

			dots.forEach( ( dot ) => {
				const opacity = reduced ? dot.base : shimmerOpacity( dot, cycle );

				context.fillStyle = `rgba(${ DOT_FIELD.rgb }, ${ opacity })`;
				context.fillRect( dot.x, dot.y, DOT_FIELD.size, DOT_FIELD.size );
			} );
		};

		const loop = ( now ) => {
			paint( now );
			frameId = window.requestAnimationFrame( loop );
		};

		const start = () => {
			window.cancelAnimationFrame( frameId );

			if ( motionQuery.matches ) {
				paint( 0 );
				return;
			}

			frameId = window.requestAnimationFrame( loop );
		};

		const observer = 'undefined' === typeof ResizeObserver ? null : new ResizeObserver( () => {
			if ( width === canvas.clientWidth && height === canvas.clientHeight ) {
				return;
			}

			start();
		} );

		observer?.observe( canvas );
		motionQuery.addEventListener( 'change', start );
		start();

		return () => {
			window.cancelAnimationFrame( frameId );
			observer?.disconnect();
			motionQuery.removeEventListener( 'change', start );
		};
	}, [] );

	return (
		<Box
			component="canvas"
			ref={ canvasRef }
			aria-hidden="true"
			sx={ {
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
			} }
		/>
	);
};
