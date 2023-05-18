<?php
namespace Elementor\Modules\NestedAccordion\Widgets;

use Elementor\Controls_Manager;
use Elementor\Modules\NestedElements\Base\Widget_Nested_Base;
use Elementor\Modules\NestedElements\Controls\Control_Nested_Repeater;
use Elementor\Plugin;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class NestedAccordion extends Widget_Nested_Base {

	public function get_name() {
		return 'nested-accordion';
	}

	public function get_title() {
		return esc_html__( 'Accordion', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-accordion';
	}

	public function get_keywords() {
		return [ 'nested', 'tabs', 'accordion', 'toggle' ];
	}

	protected function tab_content_container( int $index ) {
		return [
			'elType' => 'container',
			'settings' => [
				'_title' => sprintf( __( 'Tab #%s', 'elementor' ), $index ),
				'content_width' => 'full',
			],
		];
	}

	protected function get_default_children_elements() {
		return [
			$this->tab_content_container( 1 ),
			$this->tab_content_container( 2 ),
			$this->tab_content_container( 3 ),
		];
	}

	protected function get_default_repeater_title_setting_key() {
		return 'tab_title';
	}

	protected function get_default_children_title() {
		return esc_html__( 'Tab #%d', 'elementor' );
	}

	protected function get_default_children_placeholder_selector() {
		return '.e-n-accordion';
	}

	protected function get_html_wrapper_class() {
		return 'elementor-widget-n-accordion';
	}

	protected function register_controls() {
		$this->start_controls_section( 'section_tabs', [
			'label' => esc_html__( 'Accordion', 'elementor' ),
		] );

		$repeater = new Repeater();

		$repeater->add_control( 'tab_title', [
			'label' => esc_html__( 'Title', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => esc_html__( 'Tab Title', 'elementor' ),
			'placeholder' => esc_html__( 'Tab Title', 'elementor' ),
			'label_block' => true,
			'dynamic' => [
				'active' => true,
			],
		] );

		$this->add_control( 'tabs', [
			'label' => esc_html__( 'Tabs Items', 'elementor' ),
			'type' => Control_Nested_Repeater::CONTROL_TYPE,
			'fields' => $repeater->get_controls(),
			'default' => [
				[
					'tab_title' => esc_html__( 'Tab #1', 'elementor' ),
				],
				[
					'tab_title' => esc_html__( 'Tab #2', 'elementor' ),
				],
				[
					'tab_title' => esc_html__( 'Tab #3', 'elementor' ),
				],
			],
			'title_field' => '{{{ tab_title }}}',
			'button_text' => 'Add Tab',
		] );

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$tabs = $settings['tabs'];
		$id_int = substr( $this->get_id_int(), 0, 3 );
		$tabs_title_html = '';
		$this->add_render_attribute( 'elementor-accordion', 'class', 'e-n-accordion' );

		foreach ( $tabs as $index => $item ) {
			$tab_count = $index + 1;
			$tab_title_setting_key = $this->get_repeater_setting_key( 'tab_title', 'tabs', $index );
			$tab_title_classes = [ 'e-n-tab-title', 'e-normal' ];
			$tab_id = 'e-n-tab-title-' . $id_int . $tab_count;
			$tab_title = $item['tab_title'];

			$this->add_render_attribute( $tab_title_setting_key, [
				'id' => $tab_id,
				'class' => $tab_title_classes,
				'aria-selected' => 1 === $tab_count ? 'true' : 'false',
				'data-tab' => $tab_count,
				'role' => 'tab',
				'tabindex' => 1 === $tab_count ? '0' : '-1',
				'aria-controls' => 'e-n-tab-content-' . $id_int . $tab_count,
				'aria-expanded' => 'false',
			] );

			$title_render_attributes = $this->get_render_attribute_string( $tab_title_setting_key );
			$tab_title_text_class = $this->get_render_attribute_string( 'tab-title-text' );

			// Tabs content.
			ob_start();
			$this->print_child( $index );
			$tab_content = ob_get_clean();

			$tabs_title_html .= "\t<details {$title_render_attributes}>";
			$tabs_title_html .= "\t\t<summary>{$tab_title}</summary>";
			$tabs_title_html .= "\t\t{$tab_content}";
			$tabs_title_html .= "\t</details>";
		}

		?>
		<div <?php $this->print_render_attribute_string( 'elementor-accordion' ); ?>>
			<?php echo $tabs_title_html;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="e-n-accordion" role="tablist" aria-orientation="vertical">
			<# if ( settings['tabs'] ) {
			const elementUid = view.getIDInt().toString().substr( 0, 3 ); #>

			<# _.each( settings['tabs'], function( item, index ) {
			const tabCount = index + 1,
				tabUid = elementUid + tabCount,
				tabWrapperKey = tabUid,
				tabTitleKey = 'tab-title-' + tabUid;

			if ( '' !== item.element_id ) {
				tabId = item.element_id;
			}

			view.addRenderAttribute( tabWrapperKey, {
				'id': tabId,
				'class': [ 'e-n-tab-title','e-normal' ],
				'data-tab': tabCount,
				'role': 'tab',
				'tabindex': 1 === tabCount ? '0' : '-1',
			} );

			view.addRenderAttribute( tabTitleKey, {
				'class': [ 'e-n-tab-title' ],
				'data-binding-type': 'repeater-item',
				'data-binding-repeater-name': 'tabs',
				'data-binding-setting': [ 'tab_title' ],
				'data-binding-index': tabCount,
			} );
			#>

			<details {{{ view.getRenderAttributeString( tabWrapperKey ) }}}>
				<summary {{{ view.getRenderAttributeString( tabTitleKey ) }}}>{{{ item.tab_title }}}</summary>
			</details>
			<# } ); #>
		<# } #>
	</div>
		<?php
	}
}
