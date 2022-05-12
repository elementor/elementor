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

    public static function on_import_replace_dynamic_content( $config, $map_old_new_post_ids ) {
        if ( isset( $config['settings']['template_id'] ) ) {
            $config['settings']['template_id'] = $map_old_new_post_ids[ $config['settings']['template_id'] ];
        }

        return $config;
    }
}
