import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ajax } from '@elementor/editor-v1-adapters';
import { BulbIcon } from '@elementor/icons';
import { Box, Button, CloseButton, Infotip, Stack, Typography, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { isNoticeDismissed, markNoticeAsDismissedInSession } from './notice-control';

const POPOVER_WIDTH = 296;
const POPOVER_OFFSET: [ number, number ] = [ -24, 12 ];

type InfotipWithPopperProps = React.ComponentProps< typeof Infotip > & {
  PopperProps?: {
    modifiers?: Array< { name: string; options?: { offset: [ number, number ] } } >;
  };
};

const OptimizeInfotip = Infotip as React.FC< InfotipWithPopperProps >;

export type ImagePromotion = {
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  dismissible?: string;
};

type PreviewWindow = Window & {
  elementor?: {
    $preview?: ArrayLike< { contentDocument?: Document | null } >;
  };
};

const isEventInside = ( target: EventTarget | null, anchor: HTMLElement | null ) => {
  if ( ! ( target instanceof Element ) ) {
    return false;
  }

  return (
    !! anchor?.contains( target ) ||
    !! target.closest( '[data-image-optimize-popover], .MuiTooltip-popper' )
  );
};

export const ImageOptimizeTrigger = ( { promotion }: { promotion?: ImagePromotion } ) => {
  const [ open, setOpen ] = useState( false );
  const [ dismissed, setDismissed ] = useState( () => isNoticeDismissed( promotion?.dismissible ) );
  const anchorRef = useRef< HTMLButtonElement >( null );
  const theme = useTheme();
  const placement = 'rtl' === theme.direction ? 'left-start' : 'right-start';

  useEffect( () => {
    if ( ! open ) {
      return undefined;
    }

    const closeOnPointerDown = ( event: Event ) => {
      if ( isEventInside( event.target, anchorRef.current ) ) {
        return;
      }

      setOpen( false );
    };

    const closeOnEscape = ( event: KeyboardEvent ) => {
      if ( 'Escape' !== event.key ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if ( 'keydown' === event.type ) {
        setOpen( false );
      }
    };

    const iframeDocument = ( window as PreviewWindow ).elementor?.$preview?.[ 0 ]?.contentDocument;

    document.addEventListener( 'mousedown', closeOnPointerDown, true );
    document.addEventListener( 'keydown', closeOnEscape, true );
    document.addEventListener( 'keyup', closeOnEscape, true );
    iframeDocument?.addEventListener( 'mousedown', closeOnPointerDown, true );
    iframeDocument?.addEventListener( 'keydown', closeOnEscape, true );
    iframeDocument?.addEventListener( 'keyup', closeOnEscape, true );

    return () => {
      document.removeEventListener( 'mousedown', closeOnPointerDown, true );
      document.removeEventListener( 'keydown', closeOnEscape, true );
      document.removeEventListener( 'keyup', closeOnEscape, true );
      iframeDocument?.removeEventListener( 'mousedown', closeOnPointerDown, true );
      iframeDocument?.removeEventListener( 'keydown', closeOnEscape, true );
      iframeDocument?.removeEventListener( 'keyup', closeOnEscape, true );
    };
  }, [ open ] );

  if ( dismissed || ! promotion?.content ) {
    return null;
  }

  const dismiss = () => {
    setDismissed( true );
    setOpen( false );

    if ( ! promotion.dismissible ) {
      return;
    }

    markNoticeAsDismissedInSession( promotion.dismissible );

    ajax
      .load( {
        action: 'dismissed_editor_notices',
        unique_id: `dismiss-editor-notice-${ promotion.dismissible }`,
        data: { dismissId: promotion.dismissible },
      } )
      .catch( () => {} );
  };

  return (
    <OptimizeInfotip
      arrow
      disableFocusListener
      disableHoverListener
      disableTouchListener
      className="dialog-widget"
      content={
        <Box data-image-optimize-popover="" sx={ { width: POPOVER_WIDTH } }>
          <Stack direction="row" alignItems="center" gap={ 1 } py={ 1 } px={ 2 }>
            <BulbIcon fontSize="small" color="info" />
            <Typography variant="subtitle2">
              { __( 'Optimize your images', 'elementor' ) }
            </Typography>
            <CloseButton
              edge="end"
              sx={ { ml: 'auto' } }
              slotProps={ { icon: { fontSize: 'small' } } }
              onClick={ () => setOpen( false ) }
            />
          </Stack>
          <Stack px={ 2 }>
            <Typography variant="body2" color="secondary" sx={ { pt: 0.5, pb: 1 } }>
              { promotion.content }
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" pt={ 1 } pb={ 1.5 } px={ 2 }>
            <Button
              variant="text"
              size="small"
              color="secondary"
              onClick={ dismiss }
              sx={ { ml: -1 } }
            >
              { __( 'Dismiss', 'elementor' ) }
            </Button>
            { promotion.buttonText && promotion.buttonUrl && (
              <Button
                variant="contained"
                size="small"
                color="info"
                href={ promotion.buttonUrl }
                target="_blank"
                rel="noopener noreferrer"
                sx={ { ml: 'auto' } }
              >
                { promotion.buttonText }
              </Button>
            ) }
          </Stack>
        </Box>
      }
      open={ open }
      placement={ placement }
      PopperProps={ {
        modifiers: [
          {
            name: 'offset',
            options: { offset: POPOVER_OFFSET },
          },
        ],
      } }
    >
      <Button
        ref={ anchorRef }
        variant="text"
        size="small"
        color="info"
        aria-expanded={ open }
        onClick={ () => setOpen( ( current ) => ! current ) }
        startIcon={
          <BulbIcon
            fontSize="tiny"
            sx={ { display: 'block', position: 'relative', top: '-3px' } }
          />
        }
        sx={ {
          display: 'inline-flex',
          alignItems: 'center',
          minWidth: 0,
          minHeight: 0,
          px: 0.75,
          py: 0.25,
          lineHeight: 1,
          fontWeight: 400,
          '& .MuiButton-startIcon': {
            display: 'inline-flex',
            alignItems: 'center',
            margin: 0,
            mr: 0.5,
          },
        } }
      >
        { __( 'Optimize', 'elementor' ) }
      </Button>
    </OptimizeInfotip>
  );
};
