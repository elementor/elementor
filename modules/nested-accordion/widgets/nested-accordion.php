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

/**
 * Elementor Nested Accordion widget.
 *
 * Elementor widget that displays a collapsible display of content in an
 * accordion style.
 *
 * @since 3.15.0
 */
class Nested_Accordion extends Widget_Nested_Base {

	const NESTED_ACCORDION = 'nested-accordion';

	public function get_name() {
		return static::NESTED_ACCORDION;
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

	public function show_in_panel(): bool {
		return Plugin::$instance->experiments->is_feature_active( static::NESTED_ACCORDION );
	}

	protected function item_content_container( int $index ) {
		return [
			'elType' => 'container',
			'settings' => [
				'_title' => sprintf( __( 'item #%s', 'elementor' ), $index ),
				'content_width' => 'full',
			],
		];
	}

	protected function get_default_children_elements() {
		return [
			$this->item_content_container( 1 ),
			$this->item_content_container( 2 ),
			$this->item_content_container( 3 ),
		];
	}

	protected function get_default_repeater_title_setting_key() {
		return 'item_title';
	}

	protected function get_default_children_title() {
		return esc_html__( 'Item #%d', 'elementor' );
	}

	protected function get_default_children_placeholder_selector() {
		return '.e-n-accordion';
	}

	protected function get_html_wrapper_class() {
		return 'elementor-widget-n-accordion';
	}

	protected function register_controls() {
		$this->start_controls_section( 'section_items', [
			'label' => esc_html__( 'Accordion', 'elementor' ),
		] );

		$repeater = new Repeater();

		$repeater->add_control( 'item_title', [
			'label' => esc_html__( 'Title', 'elementor' ),
			'type' => Controls_Manager::TEXT,
			'default' => esc_html__( 'Item Title', 'elementor' ),
			'placeholder' => esc_html__( 'Item Title', 'elementor' ),
			'label_block' => true,
			'dynamic' => [
				'active' => true,
			],
		] );

		$repeater->add_control(
			'element_css_id',
			[
				'label' => esc_html__( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'dynamic' => [
					'active' => true,
				],
				'title' => esc_html__( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'style_transfer' => false,
			]
		);

		$this->add_control( 'items', [
			'label' => esc_html__( 'Items', 'elementor' ),
			'type' => Control_Nested_Repeater::CONTROL_TYPE,
			'fields' => $repeater->get_controls(),
			'default' => [
				[
					'item_title' => esc_html__( 'Item #1', 'elementor' ),
				],
				[
					'item_title' => esc_html__( 'Item #2', 'elementor' ),
				],
				[
					'item_title' => esc_html__( 'Item #3', 'elementor' ),
				],
			],
			'title_field' => '{{{ item_title }}}',
			'button_text' => 'Add Item',
		] );

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$items = $settings['items'];
		$id_int = substr( $this->get_id_int(), 0, 3 );
		$items_title_html = '';
		$this->add_render_attribute( 'elementor-accordion', 'class', 'e-n-accordion' );

		foreach ( $items as $index => $item ) {
			$item_setting_key = $this->get_repeater_setting_key( 'item_title', 'items', $index );
			$item_classes = [ 'e-n-accordion-item', 'e-normal' ];
			$item_id = empty( $item['element_css_id'] ) ? 'e-n-accordion-item-' . $id_int : $item['element_css_id'];
			$item_title = $item['item_title'];

			$this->add_render_attribute( $item_setting_key, [
				'id' => $item_id,
				'class' => $item_classes,
			] );

			$title_render_attributes = $this->get_render_attribute_string( $item_setting_key );

			// items content.
			ob_start();
			$this->print_child( $index );
			$item_content = ob_get_clean();

			$items_title_html .= "\t<details {$title_render_attributes}>";
			$items_title_html .= "\t\t<summary class='e-n-accordion-item-title'>{$item_title}</summary>";
			$items_title_html .= "\t\t{$item_content}";
			$items_title_html .= "\t</details>";
		}

		?>
		<div <?php $this->print_render_attribute_string( 'elementor-accordion' ); ?>>
			<?php echo $items_title_html;// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="e-n-accordion" role="tablist" aria-orientation="vertical">
			<# if ( settings['items'] ) {
			const elementUid = view.getIDInt().toString().substr( 0, 3 ); #>

			<# _.each( settings['items'], function( item, index ) {
			const itemCount = index + 1,
				itemUid = elementUid + itemCount,
				itemWrapperKey = itemUid,
				itemTitleKey = 'item-' + itemUid;

			if ( '' !== item.element_css_id ) {
				itemId = item.element_css_id;
			} else {
				itemId = 'e-n-accordion-item-' + itemUid;
			}

			view.addRenderAttribute( itemWrapperKey, {
				'id': itemId,
				'class': [ 'e-n-accordion-item','e-normal' ],
			} );

			view.addRenderAttribute( itemTitleKey, {
				'class': [ 'e-n-accordion-item-title' ],
			} );

			#>

			<details {{{ view.getRenderAttributeString( itemWrapperKey ) }}}>
				<summary {{{ view.getRenderAttributeString( itemTitleKey ) }}}>{{{ item.item_title }}}</summary>
			</details>
			<# } ); #>
		<# } #>
	</div>
		<?php
	}
}
