<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Color_Control;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Core\Utils\Svg\Svg_Sanitizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Svg extends Atomic_Widget_Base {
	public function get_name() {
		return 'a-svg';
	}

	public function get_title() {
		return esc_html__( 'SVG Icon', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-favorite';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		if ( ! isset( $settings['svg'] ) ) {
			$this->render_placeholder_svg();
			return;
		}

		$svg = $settings['svg'];
		$svg = new \WP_HTML_Tag_Processor( $svg );

		if ( $svg->next_tag() ) {
			$svg->set_attribute( 'fill', $settings['color'] ?? 'currentColor' );
			$svg->add_class( $settings['classes'] ?? '' );
		}

		$valid_svg = ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );

		echo ( false === $valid_svg ) ? '' : $valid_svg; //phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	protected function render_placeholder_svg() {
		$settings = $this->get_atomic_settings();
		$classes = $settings['classes'] ?? '';
		$color = $settings['color'] ?? 'currentColor';
		?>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="<?php echo esc_attr( $classes ); ?>" fill="<?php echo esc_attr( $color ); ?>">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
		</svg>
		<?php
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Atomic Svg', 'elementor' ) )
			->set_items( [
				Textarea_Control::bind_to( 'svg' )
					->set_label( esc_html__( 'Custom SVG', 'elementor' ) )
					->set_placeholder( '<svg xmlns="http://www.w3.org/2000/svg"...' ),
				Color_Control::bind_to( 'color' )
					->set_label( esc_html__( 'SVG Color', 'elementor' ) ),
			] );

		return [
			$content_section,
		];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'svg' => String_Prop_Type::make()
				->default( '' ),

			'color' => String_Prop_Type::make()
				->default( 'currentColor' ),
		];
	}
}
