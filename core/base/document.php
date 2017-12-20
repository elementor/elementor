<?php
namespace Elementor\Core\Base;

use Elementor\Plugin;
use Elementor\DB;
use Elementor\Element_Base;
use Elementor\Controls_Manager;
use Elementor\Controls_Stack;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Document extends Controls_Stack {

	/**
	 * @var \WP_Post
	 */
	protected $post;

	public static function get_properties() {
		return [
			'is_editable' => true,
			'edit_area' => 'content',
		];
	}

	public static function get_title() {
		return __( 'Document', '' );
	}

	public static function get_property( $key ) {
		return self::_get_items( self::get_properties(), $key );
	}

	public static function get_class_full_name() {
		return get_called_class();
	}

	public function get_unique_name() {
		return $this->get_name() . '-' . $this->post->ID;
	}

	public function is_editable_by_current_user() {
		return User::is_current_user_can_edit( $this->post->ID );
	}

	public function get_wp_preview_url() {
		$wp_preview_url = get_preview_post_link(
			$this->post->ID,
			[
				'preview_id' => $this->post->ID,
				'preview_nonce' => wp_create_nonce( 'post_preview_' . $this->post->ID ),
			]
		);

		/**
		 * Filters the Wordpress preview URL.
		 *
		 * @since 1.9.0
		 *
		 * @param string $wp_preview_url URL with chosen scheme.
		 * @param Document $this Document.
		 */
		return apply_filters( 'elementor/document/wp_preview_url', $wp_preview_url, $this );
	}

	public function get_exit_to_dashboard_url() {
		$exit_url = get_edit_post_link( $this->post->ID );

		/**
		 * Filters the Exit To Dashboard URL.
		 *
		 * @since 1.9.0
		 *
		 * @param string $$exit_url Default exit URL.
		 * @param Document $this Document.
		 */
		$exit_url = apply_filters( 'elementor/document/exit_to_dashboard_url', $exit_url, $this );

		return $exit_url;
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'document_settings',
			[
				'label' => __( 'Document Settings', '' ),
				'tab' => Controls_Manager::TAB_SETTINGS,
			]
		);

		$this->add_control(
			'post_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => $this->post->post_title,
				'label_block' => true,
				'separator' => 'none',
			]
		);

		$post_type_object = get_post_type_object( $this->post->post_type );

		$can_publish = $post_type_object && current_user_can( $post_type_object->cap->publish_posts );

		if ( 'publish' === $this->post->post_status || 'private' === $this->post->post_status || $can_publish ) {
			$this->add_control(
				'post_status',
				[
					'label' => __( 'Status', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'default' => $this->post->post_status,
					'options' => get_post_statuses(),
				]
			);
		}

		$this->end_controls_section();
	}

	/**
	 * Is built with Elementor.
	 *
	 * Check whether the post was built with Elementor.
	 *
	 * @since 1.0.10
	 * @access public
	 *
	 * @return bool Whether the post was built with Elementor.
	 */
	public function is_built_with_elementor() {
		return ! ! get_post_meta( $this->post->ID, '_elementor_edit_mode', true );
	}

	/**
	 * @static
	 * @since  1.0.0
	 * @access public
	 *
	 * @return mixed
	 */
	public function get_edit_url() {
		$edit_link = add_query_arg(
			[
				'post' => $this->post->ID,
				'action' => 'elementor',
			],
			admin_url( 'post.php' )
		);

		return apply_filters( 'elementor/document/get_edit_link', $edit_link, $this );
	}

	/**
	 * @static
	 * @since 1.6.4
	 * @access public
	 */
	public function get_preview_url() {
		$preview_url = set_url_scheme( add_query_arg( 'elementor-preview', '', get_permalink( $this->post->ID ) ) );

		return apply_filters( 'elementor/document/preview_url', $preview_url, $this );
	}

	/**
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $key
	 *
	 * @return array
	 */
	public function get_json_meta( $key ) {
		$meta = get_post_meta( $this->post->ID, $key, true );

		if ( is_string( $meta ) && ! empty( $meta ) ) {
			$meta = json_decode( $meta, true );
		}

		if ( empty( $meta ) ) {
			$meta = [];
		}

		return $meta;
	}

	/**
	 * @since  1.0.0
	 * @access public
	 *
	 * @param string $status
	 *
	 * @return array
	 */
	public function get_elements( $status = DB::STATUS_PUBLISH ) {
		$elements = $this->get_json_meta( '_elementor_data' );

		if ( DB::STATUS_DRAFT === $status ) {
			$autosave = wp_get_post_autosave( $this->post->ID );

			if ( is_object( $autosave ) ) {
				$elements = Plugin::$instance->documents
					->get( $autosave->ID )
					->get_json_meta( '_elementor_data' );
			}
		} elseif ( empty( $data ) ) {
			$elements = Plugin::$instance->db->_get_new_editor_from_wp_editor( $this->post->ID );
		}

		return $elements;
	}

	public function get_post() {
		return $this->post;
	}

	public function __construct( array $data = [] ) {
		$this->post = get_post( $data['post_id'] );

		if ( ! $this->post ) {
			$this->post = new \WP_Post( (object) [] );
		}

		// Each Control_Stack is based on a unique ID.
		$data['id'] = $data['post_id'];

		parent::__construct( $data );
	}
}
