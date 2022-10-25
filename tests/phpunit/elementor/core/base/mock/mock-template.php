<?php
namespace Elementor\Testing\Core\Base\Mock;

use Elementor\Widget_Base;

class Mock_Template extends Widget_Base {

    public function get_name() {
        return 'template';
    }

    public function get_title() {
		return esc_html__( 'Template', 'elementor' );
	}

	public static function on_import_update_dynamic_content( array $config, array $data, $controls = null ) : array {
        if ( isset( $config['settings']['template_id'] ) && isset( $data['post_ids'] ) ) {
            $config['settings']['template_id'] = $data['post_ids'][ $config['settings']['template_id'] ];
        }

        return $config;
    }
}
