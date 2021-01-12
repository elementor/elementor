<?php

namespace Elementor\Modules\WidgetsPanel\Data\Endpoints;

use Elementor\Data\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Class Favorites
 * @package Elementor\Modules\WidgetsPanel\Data\Endpoints
 */
class Favorites extends Endpoint {

	/**
	 * Set meta key name
	 *
	 * Filed meta_key in database table wp_usermeta
	 *
	 * @since 3.0.16
	 */
	const META_KEY = '_elementor_favorites_widgets';

	/**
	 * The name of path - Rest Api
	 *
	 * @since 3.0.16
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'favorites';
	}

	/**
	 * Register Rest
	 *
	 * @since 3.0.16
	 * @access public
	 *
	 * @throws \Exception
	 */
	protected function register() {
		parent::register();

		$this->register_item_route( \WP_REST_Server::READABLE );
		$this->register_item_route( \WP_REST_Server::CREATABLE );
		$this->register_item_route( \WP_REST_Server::DELETABLE );
	}

	/**
	 * Retrieve favorites widgets from DB
	 *
	 * @since 3.0.16
	 * @access public
	 *
	 * @param string           $id
	 * @param \WP_REST_Request $request
	 *
	 * @return bool|int|\WP_Error|\WP_REST_Response
	 */
	public function get_item( $id, $request ) {
		return $this->get_favorite_widget();
	}

	/**
	 * Add favorite widget to DB
	 *
	 * @since 3.0.16
	 * @access public
	 *
	 * @param string           $id
	 * @param \WP_REST_Request $request
	 *
	 * @return bool|int|\WP_Error|\WP_REST_Response
	 */
	public function create_item( $id, $request ) {
		return $this->mark_as_favorite_widget( $id, true );
	}

	/**
	 * Delete favorite widget from DB
	 *
	 * @since 3.0.16
	 * @access public
	 *
	 * @param string           $id
	 * @param \WP_REST_Request $request
	 *
	 * @return bool|int|\WP_Error|\WP_REST_Response
	 */
	public function delete_item( $id, $request ) {
		return $this->mark_as_favorite_widget( $id, false );
	}

	/**
	 * Retrieve favorites widgets from DB.
	 *
	 * @since 3.0.16
	 * @access private
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return array|mixed
	 */
	private function get_favorite_widget() {
		$favorites_widgets = get_user_meta( get_current_user_id(), self::META_KEY, true );
		if ( ! $favorites_widgets ) {
			$favorites_widgets = [];
		}
		return $favorites_widgets;
	}

	/**
	 * Mark or unmark widget as favorite.
	 *
	 * Update user meta containing his favorite widgets. For a given widget
	 * ID, add the widget to the favorite widgets or remove it from the
	 * favorites, based on the `favorite` parameter.
	 *
	 * @since 3.0.16
	 * @access private
	 *
	 * @param int  $widget_id   The widget ID.
	 * @param bool $favorite    Optional. Whether the template is marked as
	 *                          favorite, or not. Default is true.
	 *
	 * @return int|bool User meta ID if the key didn't exist, true on successful
	 *                  update, false on failure.
	 */
	private function mark_as_favorite_widget( $widget_id, $favorite = true ) {
		$favorites_widgets = $this->get_favorite_widget();

		if ( $favorite ) {
			if ( isset( $favorites_widgets[ $widget_id ] ) ) {
				return true;
			}
			$favorites_widgets[ $widget_id ] = $favorite;
		} else {
			unset( $favorites_widgets[ $widget_id ] );
		}

		return update_user_meta( get_current_user_id(), self::META_KEY, $favorites_widgets );
	}

}
