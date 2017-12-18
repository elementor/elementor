<?php
namespace Elementor\Core\Base;

use Elementor\Plugin;
use Elementor\DB;
use Elementor\Element_Base;
use Elementor\Controls_Manager;
use Elementor\Controls_Stack;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Document extends Controls_Stack {

	/**
	 * @var \WP_Post
	 */
	private $post;

	private static $properties = [
		'is_editable' => true,
		'edit_area' => 'content',
	];

	/**
	 * @var Element_Base[]
	 */
	private $elements;

	public static function get_properties( $key = null ) {
		return self::_get_items( self::$properties, $key );
	}

	public static function get_class_full_name() {
		return get_called_class();
	}

	public function get_unique_name() {
		return $this->get_name() . '-' . $this->post->ID;
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

		$can_publish = current_user_can( $post_type_object->cap->publish_posts );

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

		if ( is_string( $meta ) ) {
			if ( empty( $meta ) ) {
				$meta = [];
			} else {
				$meta = json_decode( $meta, true );
			}
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
			$draft_data = $this->get_json_meta( '_elementor_draft_data' );

			if ( ! empty( $draft_data ) ) {
				$elements = $draft_data;
			}

			if ( empty( $this->elements ) ) {
				$elements = Plugin::$instance->db->_get_new_editor_from_wp_editor( $this->post->ID );
			}
		}

		return $elements;
	}

	public function __construct( array $data = [] ) {
		$this->post = get_post( $data['post_id'] );

		if ( ! $this->post ) {
			$this->post = new \WP_Post( (object) [] );
		}

		$this->elements = $this->get_elements();

		// Each Control_Stack is based on a unique ID.
		$data['id'] = $data['post_id'];

		parent::__construct( $data );
	}
}
