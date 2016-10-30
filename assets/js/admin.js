(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
( function( $, window, document ) {
	'use strict';

	var ElementorAdminApp = {

		cacheElements: function() {
			this.cache = {
				$body: $( 'body' ),
				$switchMode: $( '#elementor-switch-mode' ),
				$goToEditLink: $( '#elementor-go-to-edit-page-link' ),
				$switchModeInput: $( '#elementor-switch-mode-input' ),
				$switchModeButton: $( '#elementor-switch-mode-button' ),
				$elementorLoader: $( '.elementor-loader' ),
				$builderEditor: $( '#elementor-editor' )
			};
		},

		toggleStatus: function() {
			var isBuilderMode = 'builder' === this.getEditMode();

			this.cache.$body
			    .toggleClass( 'elementor-editor-active', isBuilderMode )
			    .toggleClass( 'elementor-editor-inactive', ! isBuilderMode );
		},

		bindEvents: function() {
			var self = this;

			self.cache.$switchModeButton.on( 'click', function( event ) {
				event.preventDefault();

				if ( 'builder' === self.getEditMode() ) {
					self.cache.$switchModeInput.val( 'editor' );
				} else {
					self.cache.$switchModeInput.val( 'builder' );

					var $wpTitle = $( '#title' );

					if ( ! $wpTitle.val() ) {
						$wpTitle.val( 'Elementor #' + $( '#post_ID' ).val() );
					}

					wp.autosave.server.triggerSave();

					self.animateLoader();

					$( document ).on( 'heartbeat-tick.autosave', function() {
						$( window ).off( 'beforeunload.edit-post' );
						window.location = self.cache.$goToEditLink.attr( 'href' );
					} );
				}

				self.toggleStatus();
			} );

			self.cache.$goToEditLink.on( 'click', function() {
				self.animateLoader();
			} );

			$( 'div.notice.elementor-message-dismissed' ).on( 'click', 'button.notice-dismiss', function( event ) {
				event.preventDefault();

				$.post( ajaxurl, {
					action: 'elementor_set_admin_notice_viewed',
					notice_id: $( this ).closest( '.elementor-message-dismissed' ).data( 'notice_id' )
				} );
			} );

			$( '#elementor-library-sync-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'elementor_reset_library',
					_nonce: $thisButton.data( 'nonce' )
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} );
			} );
		},

		init: function() {
			this.cacheElements();
			this.bindEvents();

			this.initTemplatesImport();
		},

		initTemplatesImport: function() {
			if ( ! this.cache.$body.hasClass( 'post-type-elementor_library' ) ) {
				return;
			}

			var self = this,
				$importButton = self.cache.$importButton = $( '#elementor-import-template-trigger' ),
				$importArea = self.cache.$importArea = $( '#elementor-import-template-area' );

			self.cache.$formAnchor = $( 'h1' );

			$( '#wpbody-content' ).find( '.page-title-action' ).after( $importButton );

			self.cache.$formAnchor.after( self.cache.$importArea );

			$importButton.on( 'click', function() {
				$importArea.toggle();
			} );
		},

		getEditMode: function() {
			return this.cache.$switchModeInput.val();
		},

		animateLoader: function() {
			this.cache.$goToEditLink.addClass( 'elementor-animate' );
		}
	};

	$( function() {
		ElementorAdminApp.init();
	} );

}( jQuery, window, document ) );

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2FkbWluL2FkbWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiggZnVuY3Rpb24oICQsIHdpbmRvdywgZG9jdW1lbnQgKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgRWxlbWVudG9yQWRtaW5BcHAgPSB7XG5cblx0XHRjYWNoZUVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FjaGUgPSB7XG5cdFx0XHRcdCRib2R5OiAkKCAnYm9keScgKSxcblx0XHRcdFx0JHN3aXRjaE1vZGU6ICQoICcjZWxlbWVudG9yLXN3aXRjaC1tb2RlJyApLFxuXHRcdFx0XHQkZ29Ub0VkaXRMaW5rOiAkKCAnI2VsZW1lbnRvci1nby10by1lZGl0LXBhZ2UtbGluaycgKSxcblx0XHRcdFx0JHN3aXRjaE1vZGVJbnB1dDogJCggJyNlbGVtZW50b3Itc3dpdGNoLW1vZGUtaW5wdXQnICksXG5cdFx0XHRcdCRzd2l0Y2hNb2RlQnV0dG9uOiAkKCAnI2VsZW1lbnRvci1zd2l0Y2gtbW9kZS1idXR0b24nICksXG5cdFx0XHRcdCRlbGVtZW50b3JMb2FkZXI6ICQoICcuZWxlbWVudG9yLWxvYWRlcicgKSxcblx0XHRcdFx0JGJ1aWxkZXJFZGl0b3I6ICQoICcjZWxlbWVudG9yLWVkaXRvcicgKVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0dG9nZ2xlU3RhdHVzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpc0J1aWxkZXJNb2RlID0gJ2J1aWxkZXInID09PSB0aGlzLmdldEVkaXRNb2RlKCk7XG5cblx0XHRcdHRoaXMuY2FjaGUuJGJvZHlcblx0XHRcdCAgICAudG9nZ2xlQ2xhc3MoICdlbGVtZW50b3ItZWRpdG9yLWFjdGl2ZScsIGlzQnVpbGRlck1vZGUgKVxuXHRcdFx0ICAgIC50b2dnbGVDbGFzcyggJ2VsZW1lbnRvci1lZGl0b3ItaW5hY3RpdmUnLCAhIGlzQnVpbGRlck1vZGUgKTtcblx0XHR9LFxuXG5cdFx0YmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHRcdHNlbGYuY2FjaGUuJHN3aXRjaE1vZGVCdXR0b24ub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRpZiAoICdidWlsZGVyJyA9PT0gc2VsZi5nZXRFZGl0TW9kZSgpICkge1xuXHRcdFx0XHRcdHNlbGYuY2FjaGUuJHN3aXRjaE1vZGVJbnB1dC52YWwoICdlZGl0b3InICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5jYWNoZS4kc3dpdGNoTW9kZUlucHV0LnZhbCggJ2J1aWxkZXInICk7XG5cblx0XHRcdFx0XHR2YXIgJHdwVGl0bGUgPSAkKCAnI3RpdGxlJyApO1xuXG5cdFx0XHRcdFx0aWYgKCAhICR3cFRpdGxlLnZhbCgpICkge1xuXHRcdFx0XHRcdFx0JHdwVGl0bGUudmFsKCAnRWxlbWVudG9yICMnICsgJCggJyNwb3N0X0lEJyApLnZhbCgpICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0d3AuYXV0b3NhdmUuc2VydmVyLnRyaWdnZXJTYXZlKCk7XG5cblx0XHRcdFx0XHRzZWxmLmFuaW1hdGVMb2FkZXIoKTtcblxuXHRcdFx0XHRcdCQoIGRvY3VtZW50ICkub24oICdoZWFydGJlYXQtdGljay5hdXRvc2F2ZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JCggd2luZG93ICkub2ZmKCAnYmVmb3JldW5sb2FkLmVkaXQtcG9zdCcgKTtcblx0XHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbiA9IHNlbGYuY2FjaGUuJGdvVG9FZGl0TGluay5hdHRyKCAnaHJlZicgKTtcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzZWxmLnRvZ2dsZVN0YXR1cygpO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRzZWxmLmNhY2hlLiRnb1RvRWRpdExpbmsub24oICdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZWxmLmFuaW1hdGVMb2FkZXIoKTtcblx0XHRcdH0gKTtcblxuXHRcdFx0JCggJ2Rpdi5ub3RpY2UuZWxlbWVudG9yLW1lc3NhZ2UtZGlzbWlzc2VkJyApLm9uKCAnY2xpY2snLCAnYnV0dG9uLm5vdGljZS1kaXNtaXNzJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdCQucG9zdCggYWpheHVybCwge1xuXHRcdFx0XHRcdGFjdGlvbjogJ2VsZW1lbnRvcl9zZXRfYWRtaW5fbm90aWNlX3ZpZXdlZCcsXG5cdFx0XHRcdFx0bm90aWNlX2lkOiAkKCB0aGlzICkuY2xvc2VzdCggJy5lbGVtZW50b3ItbWVzc2FnZS1kaXNtaXNzZWQnICkuZGF0YSggJ25vdGljZV9pZCcgKVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9ICk7XG5cblx0XHRcdCQoICcjZWxlbWVudG9yLWxpYnJhcnktc3luYy1idXR0b24nICkub24oICdjbGljaycsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dmFyICR0aGlzQnV0dG9uID0gJCggdGhpcyApO1xuXG5cdFx0XHRcdCR0aGlzQnV0dG9uLnJlbW92ZUNsYXNzKCAnc3VjY2VzcycgKS5hZGRDbGFzcyggJ2xvYWRpbmcnICk7XG5cblx0XHRcdFx0JC5wb3N0KCBhamF4dXJsLCB7XG5cdFx0XHRcdFx0YWN0aW9uOiAnZWxlbWVudG9yX3Jlc2V0X2xpYnJhcnknLFxuXHRcdFx0XHRcdF9ub25jZTogJHRoaXNCdXR0b24uZGF0YSggJ25vbmNlJyApXG5cdFx0XHRcdH0gKVxuXHRcdFx0XHRcdC5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdCR0aGlzQnV0dG9uLnJlbW92ZUNsYXNzKCAnbG9hZGluZycgKS5hZGRDbGFzcyggJ3N1Y2Nlc3MnICk7XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FjaGVFbGVtZW50cygpO1xuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cblx0XHRcdHRoaXMuaW5pdFRlbXBsYXRlc0ltcG9ydCgpO1xuXHRcdH0sXG5cblx0XHRpbml0VGVtcGxhdGVzSW1wb3J0OiBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggISB0aGlzLmNhY2hlLiRib2R5Lmhhc0NsYXNzKCAncG9zdC10eXBlLWVsZW1lbnRvcl9saWJyYXJ5JyApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0JGltcG9ydEJ1dHRvbiA9IHNlbGYuY2FjaGUuJGltcG9ydEJ1dHRvbiA9ICQoICcjZWxlbWVudG9yLWltcG9ydC10ZW1wbGF0ZS10cmlnZ2VyJyApLFxuXHRcdFx0XHQkaW1wb3J0QXJlYSA9IHNlbGYuY2FjaGUuJGltcG9ydEFyZWEgPSAkKCAnI2VsZW1lbnRvci1pbXBvcnQtdGVtcGxhdGUtYXJlYScgKTtcblxuXHRcdFx0c2VsZi5jYWNoZS4kZm9ybUFuY2hvciA9ICQoICdoMScgKTtcblxuXHRcdFx0JCggJyN3cGJvZHktY29udGVudCcgKS5maW5kKCAnLnBhZ2UtdGl0bGUtYWN0aW9uJyApLmFmdGVyKCAkaW1wb3J0QnV0dG9uICk7XG5cblx0XHRcdHNlbGYuY2FjaGUuJGZvcm1BbmNob3IuYWZ0ZXIoIHNlbGYuY2FjaGUuJGltcG9ydEFyZWEgKTtcblxuXHRcdFx0JGltcG9ydEJ1dHRvbi5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRpbXBvcnRBcmVhLnRvZ2dsZSgpO1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cblx0XHRnZXRFZGl0TW9kZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jYWNoZS4kc3dpdGNoTW9kZUlucHV0LnZhbCgpO1xuXHRcdH0sXG5cblx0XHRhbmltYXRlTG9hZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FjaGUuJGdvVG9FZGl0TGluay5hZGRDbGFzcyggJ2VsZW1lbnRvci1hbmltYXRlJyApO1xuXHRcdH1cblx0fTtcblxuXHQkKCBmdW5jdGlvbigpIHtcblx0XHRFbGVtZW50b3JBZG1pbkFwcC5pbml0KCk7XG5cdH0gKTtcblxufSggalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50ICkgKTtcbiJdfQ==
