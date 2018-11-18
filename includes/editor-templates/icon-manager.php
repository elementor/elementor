<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<script type="text/template" id="tmpl-elementor-icon-manager">
    <div id="elementor-icon-manager__content"></div>

</script>
<script>
	class Tabs {
        init() {
            this.cacheElements();
            this.setupAria();
            this.appendIndicator();
            this.bindEvents();
        },

        cacheElements() {
            this.$el = $( '.tabs' );
            this.cache = {
                $tabList: this.$el.find( 'ul' ),
                $tab: this.$tabList.find( 'li' ),
                $tabFirst: this.$tabList.find( 'li:first-child a' ),
                $tabLink: this.$tab.find( 'a' ),
                $tabPanel: this.$el.find( 'section' ),
                $tabPanelFirstContent: this.$el.find( 'section > *:first-child' ),
                $tabPanelFirst: this.$el.find( 'section:first-child' ),
                $tabPanelNotFirst: this.$el.find( 'section:not(:first-of-type)' ),
            }
        },

			bindEvents() {
				this.cache.$tabLink.on( 'click', () => {
					this.changeTab();
					this.animateIndicator( $( event.currentTarget ) );
				}.bind( this ) );
				this.cache.$tabLink.on( 'keydown', () => {
					this.changeTabKey();
				}.bind( this ) );
			},

			changeTab() {
				const self = $( event.target );
				event.preventDefault();
				this.removeTabFocus();
				this.setSelectedTab( self );
				this.hideAllTabPanels();
				this.setSelectedTabPanel( self );
			},

			animateIndicator: function(elem) {
				var offset = elem.offset().left;
				var width = elem.width();
				var $indicator = this.$tabList.find('.indicator');

				console.log(elem.width());

				$indicator.transition({
					x: offset,
					width: elem.width()
				})
			},

			appendIndicator: function() {
				this.$tabList.append('<div class="indicator"></div>');
			},

			changeTabKey: function() {
				var self = $(event.target),
					$target = this.setKeyboardDirection(self, event.keyCode);

				if ($target.length) {
					this.removeTabFocus(self);
					this.setSelectedTab($target);
				}
				this.hideAllTabPanels();
				this.setSelectedTabPanel($(document.activeElement));
				this.animateIndicator($target);
			},

			hideAllTabPanels: function() {
				this.$tabPanel.attr('aria-hidden', 'true');
			},

			removeTabFocus: function(self) {
				var $this = self || $('[role="tab"]');

				$this.attr({
					'tabindex': '-1',
					'aria-selected': null
				});
			},

			selectFirstTab: function() {
				this.$tabFirst.attr({
					'aria-selected': 'true',
					'tabindex': '0'
				});
			},

			setupAria: function() {
				this.$tabList.attr('role', 'tablist');
				this.$tab.attr('role', 'presentation');
				this.$tabLink.attr({
					'role': 'tab',
					'tabindex': '-1'
				});
				this.$tabLink.each(function() {
					var $this = $(this);

					$this.attr('aria-controls', $this.attr('href').substring(1));
				});
				this.$tabPanel.attr({
					'role': 'tabpanel'
				});
				this.$tabPanelFirstContent.attr({
					'tabindex': '0'
				});
				this.$tabPanelNotFirst.attr({
					'aria-hidden': 'true'
				});
				this.selectFirstTab();
			},

			setKeyboardDirection: function(self, keycode) {
				var $prev = self.parents('li').prev().children('[role="tab"]'),
					$next = self.parents('li').next().children('[role="tab"]');

				switch (keycode) {
					case 37:
						return $prev;
						break;
					case 39:
						return $next;
						break;
					default:
						return false;
						break;
				}
			},

			setSelectedTab: function(self) {
				self.attr({
					'aria-selected': true,
					'tabindex': '0'
				}).focus();
			},

			setSelectedTabPanel: function(self) {
				$('#' + self.attr('href').substring(1)).attr('aria-hidden', null);
			},

		};
	}(jQuery);

	Tabs.init();
</script>
