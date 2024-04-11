<?php

namespace Elementor\Modules\ConversionCenter\Classes\Render;

class Core_Render_Strategy extends Base_Render_Strategy {

	public function render( \Elementor\Modules\ConversionCenter\Widgets\Link_In_Bio $widget ) {
		$settings = $widget->get_settings_for_display();

		if ( empty( $settings['heading'] ) ) {
			return;
		}

		?>
        <h1>
			<?php echo esc_html( $settings['heading'] ); ?>
        </h1>
		<?php
	}
}
