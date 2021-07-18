<?php
namespace Elementor\Core\Editor\Data\WidgetsConfig;

use Elementor\Core\Utils\Collection;
use Elementor\Data\Base\Controller as Controller_Base;
use Elementor\Plugin;

class Controller extends Controller_Base {
	/**
	 * @return string
	 */
	public function get_name() {
		return 'widgets-config';
	}

	/**
	 * @return void
	 */
	public function register_endpoints() {
		//
	}

	/**
	 * @return void
	 */
	protected function register_internal_endpoints() {
		$this->register_endpoint( Endpoints\Index::class );
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return object
	 */
	public function get_items( $request ) {
		$config = ( new Collection( Plugin::$instance->widgets_manager->get_widget_types() ) );

		$exclude = $request->get_param( 'exclude' );

		if ( ! empty( $exclude ) ) {
			$config = $config->filter( function ( $widget, $widget_key ) use ( $exclude ) {
				return ! in_array( $widget_key, $exclude, true );
			} );
		}

		return (object) $config
			->map( function ( $widget ) {
				return $this->prepare_for_response( $widget );
			} )
			->all();
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return object
	 */
	public function get_item( $request ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $request->get_param( 'id' ) );

		return (object) $this->prepare_for_response( $widget );
	}

	/**
	 * @param $widget
	 *
	 * @return array
	 */
	private function prepare_for_response( $widget ) {
		return apply_filters(
			'elementor/data/widgets-config/prepare-for-response',
			[
				'controls' => $widget->get_stack( false )['controls'],
				'tabs_controls' => $widget->get_tabs_controls(),
			],
			$widget
		);
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return bool
	 */
	public function get_permission_callback( $request ) {
		return current_user_can( 'edit_posts' );
	}
}
