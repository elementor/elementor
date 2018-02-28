<?php
namespace Elementor\Core\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Tag extends Base_Tag {

	final public function get_content( array $options = [] ) {
		ob_start();

		if ( ! empty( $options['wrap'] ) ) { ?>
			<span id="elementor-tag-<?php echo $this->get_id(); ?>" class="elementor-tag">
		<?php }

		$this->render();

		if ( ! empty( $options['wrap'] ) ) { ?>
			</span>
		<?php }

		return ob_get_clean();
	}

	final public function get_content_type() {
		return 'ui';
	}
}
