<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Attachment_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	public function get_icon() {
		return 'eicon-image';
	}

	public function get_title() {
		return esc_html__( 'Atomic Image', 'elementor' );
	}

	public function get_name() {
		return 'a-image';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		$image = $settings['image'];

		?> <img
			src='<?php echo esc_attr( $image['url'] ); ?>'
			alt='<?php echo esc_attr( $image['alt'] ); ?>'
		/>
		<?php
	}

	protected function define_atomic_controls(): array {
		$media_control = Attachment_Control::bind_to( 'image' )
			->set_media_type( 'image' )
			->set_wp_media_title( esc_html__( 'Insert Media', 'elementor' ) );

		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				$media_control,
			]);

		return [
			$content_section,
		];
	}

	protected static function define_props_schema(): array {
		return [
			'image' => Atomic_Prop::make()
				->default( [
					'$$type' => 'image-url',
					'value' => [
						'url' => Utils::get_placeholder_image_src(),
						'alt' => 'Default Image',
					],
				] ),
		];
	}
}
