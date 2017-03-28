<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Revisions_Manager {

	private static $authors = [];

	public function __construct() {
		self::register_actions();
	}

	public static function handle_revision() {
		add_filter( 'wp_save_post_revision_post_has_changed', '__return_true' );
		add_action( '_wp_put_post_revision', [ __CLASS__, 'save_revision' ] );
	}

	public static function get_revisions( $post_id = 0, $query_args = [], $parse_result = true ) {
		$post = get_post( $post_id );

		if ( ! $post || empty( $post->ID ) ) {
			return [];
		}

		$revisions = [];

		$query_args['meta_key'] = '_elementor_data';

		$posts = wp_get_post_revisions( $post->ID, $query_args );

		if ( ! $parse_result ) {
			return $posts;
		}

		$current_time = current_time( 'timestamp' );

		/** @var \WP_Post $revision */
		foreach ( $posts as $revision ) {
			$date = date_i18n( _x( 'M j @ H:i', 'revision date format', 'elementor' ), strtotime( $revision->post_modified ) );

			$human_time = human_time_diff( strtotime( $revision->post_modified ), $current_time );

			if ( false !== strpos( $revision->post_name, 'autosave' ) ) {
				$type = 'autosave';
			} else {
				$type = 'revision';
			}

			if ( ! isset( self::$authors[ $revision->post_author ] ) ) {
				self::$authors[ $revision->post_author ] = [
					'avatar' => get_avatar( $revision->post_author, 22 ),
					'display_name' => get_the_author_meta( 'display_name' , $revision->post_author ),
				];
			}

			$revisions[] = [
				'id' => $revision->ID,
				'author' => self::$authors[ $revision->post_author ]['display_name'],
				'date' => sprintf( __( '%1$s ago (%2$s)', 'elementor' ), $human_time, $date ),
				'type' => $type,
				'gravatar' => self::$authors[ $revision->post_author ]['avatar'],
			];
		}

		return $revisions;
	}

	public static function save_revision( $revision_id ) {
		$parent_id = wp_is_post_revision( $revision_id );

		if ( ! $parent_id ) {
			return;
		}

		Plugin::$instance->db->copy_elementor_meta( $parent_id, $revision_id );
	}

	public static function restore_revision( $parent_id, $revision_id ) {
		Plugin::$instance->db->copy_elementor_meta( $revision_id, $parent_id );

		$post_css = new Post_CSS_File( $parent_id );
		$post_css->update();
	}

	public static function on_revision_data_request() {
		if ( empty( $_POST['id'] ) ) {
			wp_send_json_error( 'You must set the revision ID' );
		}

		$revision = Plugin::$instance->db->get_plain_editor( $_POST['id'] );

		if ( empty( $revision ) ) {
			wp_send_json_error( 'Invalid Revision' );
		}

		wp_send_json_success( $revision );
	}

	public static function on_delete_revision_request() {
		if ( empty( $_POST['id'] ) ) {
			wp_send_json_error( 'You must set the id' );
		}

		$revision = Plugin::$instance->db->get_plain_editor( $_POST['id'] );

		if ( empty( $revision ) ) {
			wp_send_json_error( __( 'Invalid Revision', 'elementor' ) );
		}

		$deleted = wp_delete_post_revision( $_POST['id'] );

		if ( $deleted && ! is_wp_error( $deleted ) ) {
			wp_send_json_success();
		} else {
			wp_send_json_error( __( 'Cannot delete this Revision', 'elementor' ) );
		}
	}

	public static function add_revision_support_for_all_post_types() {
		$post_types = get_post_types_by_support( 'elementor' );
		foreach ( $post_types as $post_type ) {
			add_post_type_support( $post_type, 'revisions' );
		}
	}

	private static function register_actions() {
		add_action( 'wp_restore_post_revision', [ __CLASS__, 'restore_revision' ], 10, 2 );
		add_action( 'init', [ __CLASS__, 'add_revision_support_for_all_post_types' ], 9999 );

		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_get_revision_data', [ __CLASS__, 'on_revision_data_request' ] );
			add_action( 'wp_ajax_elementor_delete_revision', [ __CLASS__, 'on_delete_revision_request' ] );
		}
	}
}
