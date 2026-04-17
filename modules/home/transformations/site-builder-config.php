<?php
namespace Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Base\Transformations_Abstract;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Site_Builder_Config extends Transformations_Abstract {

	public function transform( array $home_screen_data ): array {
		$site_builder = Plugin::$instance->app->get_component( 'site-builder' );

		if ( ! $site_builder ) {
			return $home_screen_data;
		}

		$site_builder_config = $site_builder->get_config();

		if ( ! $site_builder_config ) {
			return $home_screen_data;
		}

		$home_screen_data['site_builder'] = array_merge( $site_builder_config, [
			'siteBuilderUrl' => $site_builder_config['iframeUrl'],
			'apiOrigin'      => defined( 'ELEMENTOR_SITE_PLANNER_API_ORIGIN' )
				? ELEMENTOR_SITE_PLANNER_API_ORIGIN
				: 'https://my.elementor.com/api/v2/ai',
			'previewImage1'  => ELEMENTOR_ASSETS_URL . 'home-screen/v1/images/site-planner-01.jpg',
			'previewImage2'  => ELEMENTOR_ASSETS_URL . 'home-screen/v1/images/site-planner-02.jpg',
			'bgImage'        => ELEMENTOR_ASSETS_URL . 'home-screen/v1/images/site-planner-bg.jpg',
		] );

		$snapshot = $this->wordpress_adapter->get_option( 'elementor_site_builder_snapshot' );
		$home_screen_data['siteBuilderSnapshot'] = is_array( $snapshot ) ? $snapshot : [];

		return $home_screen_data;
	}
}
