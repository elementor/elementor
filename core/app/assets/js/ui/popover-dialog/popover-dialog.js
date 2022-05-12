import { useCallback } from 'react';

export default function PopoverDialog( props ) {
	const { targetRef, offsetTop, offsetLeft, wrapperClass, trigger, hideAfter } = props,
		popoverRef = useCallback( ( popoverEl ) => {
			const target = targetRef?.current;

			// If the target or the popover element does not exist on the page anymore after a re-render, do nothing.
			if ( ! target || ! popoverEl ) {
				return;
			}

			/**
			 * Show Popover
			 */
			const showPopover = () => {
				popoverEl.style.display = 'block';

				popoverEl.setAttribute( 'aria-expanded', true );

				const targetRect = target.getBoundingClientRect(),
					popoverRect = popoverEl.getBoundingClientRect(),
					widthDifference = popoverRect.width - targetRect.width;

				popoverEl.style.top = targetRect.bottom + offsetTop + 'px';
				popoverEl.style.left = targetRect.left - ( widthDifference / 2 ) - offsetLeft + 'px';

				// 16px to compensate for the arrow width.
				popoverEl.style.setProperty( '--popover-arrow-offset-end', ( ( popoverRect.width - 16 ) / 2 ) + 'px' );
			};

			/**
			 * Hide Popover
			 */
			const hidePopover = () => {
				popoverEl.style.display = 'none';
				popoverEl.setAttribute( 'aria-expanded', false );
			};

			/**
			 * Handle the Popover's hover functionality
			 */
			const handlePopoverHover = () => {
				let hideOnMouseOut = true,
					timeOut = null;

				// Show popover on hover of the target
				target.addEventListener( 'mouseover', () => {
					hideOnMouseOut = true;

					showPopover();
				} );

				// Hide popover when not overing over the target or the popover itself
				target.addEventListener( 'mouseleave', () => {
					timeOut = setTimeout( () => {
						if ( hideOnMouseOut ) {
							if ( 'block' === popoverEl.style.display ) {
								hidePopover();
							}
						}
					}, hideAfter );
				} );

				// Don't hide the popover if the user is still hovering over it.
				popoverEl.addEventListener( 'mouseover', () => {
					hideOnMouseOut = false;

					if ( timeOut ) {
						clearTimeout( timeOut );

						timeOut = null;
					}
				} );

				// Once the user stops hovering over the popover, hide it.
				popoverEl.addEventListener( 'mouseleave', () => {
					timeOut = setTimeout( () => {
						if ( hideOnMouseOut ) {
							if ( 'block' === popoverEl.style.display ) {
								hidePopover();
							}
						}
					}, hideAfter );

					hideOnMouseOut = true;
				} );
			};

			/**
			 * Handle the Popover's click functionality
			 */
			const handlePopoverClick = () => {
				let popoverIsActive = false;

				target.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					e.stopPropagation();

					if ( popoverIsActive ) {
						hidePopover();

						popoverIsActive = false;
					} else {
						showPopover();

						popoverIsActive = true;
					}
				} );

				// Make sure the popover doesn't close when it is clicked on.
				popoverEl.addEventListener( 'click', ( e ) => {
					e.stopPropagation();
				} );

				// Hide the popover when clicking outside of it.
				document.body.addEventListener( 'click', () => {
					if ( popoverIsActive ) {
						hidePopover();

						popoverIsActive = false;
					}
				} );
			};

			if ( 'hover' === trigger ) {
				handlePopoverHover();
			} else if ( 'click' === trigger ) {
				handlePopoverClick();
			}
		}, [ targetRef ] );

	let wrapperClasses = 'e-app__popover';

	if ( wrapperClass ) {
		wrapperClasses += ' ' + wrapperClass;
	}

	return (
		<div className={ wrapperClasses } ref={ popoverRef }>
			{ props.children }
		</div>
	);
}

PopoverDialog.propTypes = {
	targetRef: PropTypes.oneOfType( [ PropTypes.func, PropTypes.shape( { current: PropTypes.any } ) ] ).isRequired,
	trigger: PropTypes.string,
	direction: PropTypes.string,
	offsetTop: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	offsetLeft: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	wrapperClass: PropTypes.string,
	children: PropTypes.any,
	hideAfter: PropTypes.number,
};

PopoverDialog.defaultProps = {
	direction: 'bottom',
	trigger: 'hover',
	offsetTop: 10,
	offsetLeft: 0,
	hideAfter: 300,
};
