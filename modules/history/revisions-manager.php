<?php
namespace Elementor\Modules\History;

use Elementor\Core\Base\Document;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Settings\Manager;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor history revisions manager.
 *
 * Elementor history revisions manager handler class is responsible for
 * registering and managing Elementor revisions manager.
 *
 * @since 1.7.0
 */
class Revisions_Manager {

	/**
	 * Maximum number of revisions to display.
	 */
	const MAX_REVISIONS_TO_DISPLAY = 100;

	/**
	 * Authors list.
	 *
	 * Holds all the authors.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private static $authors = [];

	/**
	 * History revisions manager constructor.
	 *
	 * Initializing Elementor history revisions manager.
	 *
	 * @since 1.7.0
	 * @access public
	 */
	public function __construct() {
		self::register_actions();
	}

	/**
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function handle_revision() {
		add_filter( 'wp_save_post_revision_check_for_changes', '__return_false' );
	}

	/**
	 * @since 2.0.0
	 * @access public
	 * @static
	 *
	 * @param $post_content
	 * @param $post_id
	 *
	 * @return string
	 */
	public static function avoid_delete_auto_save( $post_content, $post_id ) {
		// Add a temporary string in order the $post will not be equal to the $autosave
		// in edit-form-advanced.php:210
		if ( $post_id && Plugin::$instance->db->is_built_with_elementor( $post_id ) ) {
			$post_content .= '<!-- Created with Elementor -->';
		}

		return $post_content;
	}

	/**
	 * @since 2.0.0
	 * @access public
	 * @static
	 */
	public static function remove_temp_post_content() {
		global $post;

		if ( Plugin::$instance->db->is_built_with_elementor( $post->ID ) ) {
			$post->post_content = str_replace( '<!-- Created with Elementor -->', '', $post->post_content );
		}
	}

	/**
	 * @since 1.7.0
	 * @access public
	 * @static
	 *
	 * @param int   $post_id
	 * @param array $query_args
	 * @param bool  $parse_result
	 *
	 * @return array
	 */
	public static function get_revisions( $post_id = 0, $query_args = [], $parse_result = true ) {
		$post = get_post( $post_id );

		if ( ! $post || empty( $post->ID ) ) {
			return [];
		}

		$revisions = [];

		$default_query_args = [
			'posts_per_page' => self::MAX_REVISIONS_TO_DISPLAY,
			'meta_key' => '_elementor_data',
		];

		$query_args = array_merge( $default_query_args, $query_args );

		$posts = wp_get_post_revisions( $post->ID, $query_args );

		if ( ! wp_revisions_enabled( $post ) ) {
			$autosave = Utils::get_post_autosave( $post->ID );
			if ( $autosave ) {
				if ( $parse_result ) {
					array_unshift( $posts, $autosave );
				} else {
					array_unshift( $posts, $autosave->ID );
				}
			}
		}

		if ( $parse_result ) {
			array_unshift( $posts, $post );
		} else {
			array_unshift( $posts, $post->ID );
			return $posts;
		}

		$current_time = current_time( 'timestamp' );

		/** @var \WP_Post $revision */
		foreach ( $posts as $revision ) {
			$date = date_i18n( _x( 'M j @ H:i', 'revision date format', 'elementor' ), strtotime( $revision->post_modified ) );

			$human_time = human_time_diff( strtotime( $revision->post_modified ), $current_time );

			if ( $revision->ID === $post->ID ) {
				$type = 'current';
			} elseif ( false !== strpos( $revision->post_name, 'autosave' ) ) {
				$type = 'autosave';
			} else {
				$type = 'revision';
			}

			if ( ! isset( self::$authors[ $revision->post_author ] ) ) {
				self::$authors[ $revision->post_author ] = [
					'avatar' => get_avatar( $revision->post_author, 22 ),
					'display_name' => get_the_author_meta( 'display_name', $revision->post_author ),
				];
			}

			$revisions[] = [
				'id' => $revision->ID,
				'author' => self::$authors[ $revision->post_author ]['display_name'],
				'timestamp' => strtotime( $revision->post_modified ),
				'date' => sprintf(
					/* translators: 1: Human readable time difference, 2: Date */
					__( '%1$s ago (%2$s)', 'elementor' ),
					$human_time,
					$date
				),
				'type' => $type,
				'gravatar' => self::$authors[ $revision->post_author ]['avatar'],
			];
		}

		return $revisions;
	}

	/**
	 * @since 1.9.2
	 * @access public
	 * @static
	 */
	public static function update_autosave( $autosave_data ) {
		self::save_revision( $autosave_data['ID'] );
	}

	/**
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function save_revision( $revision_id ) {
		$parent_id = wp_is_post_revision( $revision_id );

		if ( $parent_id ) {
			Plugin::$instance->db->safe_copy_elementor_meta( $parent_id, $revision_id );
		}
	}

	/**
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function restore_revision( $parent_id, $revision_id ) {
		$is_built_with_elementor = Plugin::$instance->db->is_built_with_elementor( $revision_id );

		Plugin::$instance->db->set_is_elementor_page( $parent_id, $is_built_with_elementor );

		if ( ! $is_built_with_elementor ) {
			return;
		}

		Plugin::$instance->db->copy_elementor_meta( $revision_id, $parent_id );

		$post_css = new Post_CSS( $parent_id );

		$post_css->update();
	}

	/**
	 * @since 2.3.0
	 * @access public
	 * @static
	 *
	 * @param $data
	 *
	 * @return array
	 * @throws \Exception
	 */
	public static function ajax_get_revision_data( array $data ) {
		if ( ! isset( $data['id'] ) ) {
			throw new \Exception( 'You must set the revision ID.' );
		}

		$revision = get_post( $data['id'] );

		if ( empty( $revision ) ) {
			throw new \Exception( 'Invalid revision.' );
		}

		if ( ! current_user_can( 'edit_post', $revision->ID ) ) {
			throw new \Exception( __( 'Access denied.', 'elementor' ) );
		}

		$revision_data = [
			'settings' => Manager::get_settings_managers( 'page' )->get_model( $revision->ID )->get_settings(),
			'elements' => Plugin::$instance->db->get_plain_editor( $revision->ID ),
		];

		return $revision_data;
	}

	/**
	 * @since 2.3.0
	 * @access public
	 * @static
	 *
	 * @param array $data
	 *
	 * @throws \Exception
	 */
	public static function ajax_delete_revision( array $data ) {
		if ( empty( $data['id'] ) ) {
			throw new \Exception( 'You must set the revision ID.' );
		}

		$revision = get_post( $data['id'] );

		if ( empty( $revision ) ) {
			throw new \Exception( 'Invalid revision.' );
		}

		if ( ! current_user_can( 'delete_post', $revision->ID ) ) {
			throw new \Exception( __( 'Access denied.', 'elementor' ) );
		}

		$deleted = wp_delete_post_revision( $revision->ID );

		if ( ! $deleted || is_wp_error( $deleted ) ) {
			throw new \Exception( __( 'Cannot delete this revision.', 'elementor' ) );
		}
	}

	/**
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function add_revision_support_for_all_post_types() {
		$post_types = get_post_types_by_support( 'elementor' );
		foreach ( $post_types as $post_type ) {
			add_post_type_support( $post_type, 'revisions' );
		}
	}

	/**
	 * @since 2.0.0
	 * @access public
	 * @static
	 * @param array $return_data
	 * @param Document $document
	 *
	 * @return array
	 */
	public static function on_ajax_save_builder_data( $return_data, $document ) {
		$post_id = $document->get_main_id();

		$latest_revisions = self::get_revisions(
			$post_id, [
				'posts_per_page' => 1,
			]
		);

		$all_revision_ids = self::get_revisions(
			$post_id, [
				'fields' => 'ids',
			], false
		);

		// Send revisions data only if has revisions.
		if ( ! empty( $latest_revisions ) ) {
			$current_revision_id = self::current_revision_id( $post_id );

			$return_data = array_replace_recursive( $return_data, [
				'config' => [
					'current_revision_id' => $current_revision_id,
				],
				'latest_revisions' => $latest_revisions,
				'revisions_ids' => $all_revision_ids,
			] );
		}

		return $return_data;
	}

	/**
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function db_before_save( $status, $has_changes ) {
		if ( $has_changes ) {
			self::handle_revision();
		}
	}

	/**
	 * Localize settings.
	 *
	 * Add new localized settings for the revisions manager.
	 *
	 * Fired by `elementor/editor/localize_settings` filter.
	 *
	 * @since 1.7.0
	 * @access public
	 * @static
	 */
	public static function editor_settings( $settings, $post_id ) {
		$settings = array_replace_recursive( $settings, [
			'revisions_enabled' => ( $post_id && wp_revisions_enabled( get_post( $post_id ) ) ),
			'current_revision_id' => self::current_revision_id( $post_id ),
			'i18n' => [
				'edit_draft' => __( 'Edit Draft', 'elementor' ),
				'edit_published' => __( 'Edit Published', 'elementor' ),
				'no_revisions_1' => __( 'Revision history lets you save your previous versions of your work, and restore them any time.', 'elementor' ),
				'no_revisions_2' => __( 'Start designing your page and you\'ll be able to see the entire revision history here.', 'elementor' ),
				'current' => __( 'Current Version', 'elementor' ),
				'restore' => __( 'Restore', 'elementor' ),
				'restore_auto_saved_data' => __( 'Restore Auto Saved Data', 'elementor' ),
				'restore_auto_saved_data_message' => __( 'There is an autosave of this post that is more recent than the version below. You can restore the saved data fron the Revisions panel', 'elementor' ),
				'revision' => __( 'Revision', 'elementor' ),
				'revision_history' => __( 'Revision History', 'elementor' ),
				'revisions_disabled_1' => __( 'It looks like the post revision feature is unavailable in your website.', 'elementor' ),
				'revisions_disabled_2' => sprintf(
					/* translators: %s: Codex URL */
					__( 'Learn more about <a target="_blank" href="%s">WordPress revisions</a>', 'elementor' ),
					'https://codex.wordpress.org/Revisions#Revision_Options'
				),
			],
		] );

		return $settings;
	}

	public static function ajax_get_revisions() {
		return self::get_revisions();
	}

	/**
	 * @since 2.3.0
	 * @access public
	 * @static
	 */
	public static function register_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'get_revisions', [ __CLASS__, 'ajax_get_revisions' ] );
		$ajax->register_ajax_action( 'get_revision_data', [ __CLASS__, 'ajax_get_revision_data' ] );
		$ajax->register_ajax_action( 'delete_revision', [ __CLASS__, 'ajax_delete_revision' ] );
	}

	/**
	 * @since 1.7.0
	 * @access private
	 * @static
	 */
	private static function register_actions() {
		add_action( 'wp_restore_post_revision', [ __CLASS__, 'restore_revision' ], 10, 2 );
		add_action( 'init', [ __CLASS__, 'add_revision_support_for_all_post_types' ], 9999 );
		add_filter( 'elementor/editor/localize_settings', [ __CLASS__, 'editor_settings' ], 10, 2 );
		add_action( 'elementor/db/before_save', [ __CLASS__, 'db_before_save' ], 10, 2 );
		add_action( '_wp_put_post_revision', [ __CLASS__, 'save_revision' ] );
		add_action( 'wp_creating_autosave', [ __CLASS__, 'update_autosave' ] );
		add_action( 'elementor/ajax/register_actions', [ __CLASS__, 'register_ajax_actions' ] );

		// Hack to avoid delete the auto-save revision in WP editor.
		add_filter( 'edit_post_content', [ __CLASS__, 'avoid_delete_auto_save' ], 10, 2 );
		add_action( 'edit_form_after_title', [ __CLASS__, 'remove_temp_post_content' ] );

		if ( Utils::is_ajax() ) {
			add_filter( 'elementor/documents/ajax_save/return_data', [ __CLASS__, 'on_ajax_save_builder_data' ], 10, 2 );
		}
	}

	/**
	 * @since 1.9.0
	 * @access private
	 * @static
	 */
	private static function current_revision_id( $post_id ) {
		$current_revision_id = $post_id;
		$autosave = Utils::get_post_autosave( $post_id );

		if ( is_object( $autosave ) ) {
			$current_revision_id = $autosave->ID;
		}

		return $current_revision_id;
	}
}
