<?php
namespace Elementor\Modules\Usage;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\DynamicTags\Manager;
use Elementor\Core\Utils\Usage;
use Elementor\Modules\System_Info\Module as System_Info;
use Elementor\Modules\Usage\GlobalUsage\Global_Elements_Usage;
use Elementor\Modules\Usage\GlobalUsage\Global_Documents_Usage;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Tracker;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor usage module.
 *
 * Elementor usage module handler class is responsible for registering and
 * managing Elementor usage data.
 *
 */
class Module extends BaseModule {
	const ELEMENTS_META_KEY = '_elementor_elements_usage';
	const ELEMENTS_OPTION_NAME = 'elementor_elements_usage';

	const DOCUMENT_META_KEY = '_elementor_document_usage';
	const DOCUMENT_OPTION_NAME = 'elementor_document_usage';

	/**
	 * @var bool
	 */
	private $is_document_saving = false;

	/**
	 * @var \Elementor\Modules\Usage\GlobalUsage\Global_Elements_Usage
	 */
	private $global_elements_usage;

	/**
	 * @var \Elementor\Modules\Usage\GlobalUsage\Global_Documents_Usage
	 */
	private $global_settings_page_usage;

	/**
	 * Get module name.
	 *
	 * Retrieve the usage module name.
	 *
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'usage';
	}

	/**
	 * Get doc type count.
	 *
	 * Get count of documents based on doc type
	 *
	 * Remove 'wp-' from $doc_type for BC, support doc type change since 2.7.0.
	 *
	 * @param \Elementor\Core\Documents_Manager $doc_class
	 * @param String $doc_type
	 *
	 * @return int
	 */
	public function get_doc_type_count( $doc_class, $doc_type ) {
		static $posts = null;
		static $library = null;

		if ( null === $posts ) {
			$posts = \Elementor\Tracker::get_posts_usage();
		}

		if ( null === $library ) {
			$library = \Elementor\Tracker::get_library_usage();
		}

		$posts_usage = $posts;

		if ( $doc_class::get_property( 'show_in_library' ) ) {
			$posts_usage = $library;
		}

		$doc_type_common = str_replace( 'wp-', '', $doc_type );

		$doc_usage = isset( $posts_usage[ $doc_type_common ] ) ? $posts_usage[ $doc_type_common ] : 0;

		return is_array( $doc_usage ) ? $doc_usage['publish'] : $doc_usage;
	}

	/**
	 * Get formatted usage.
	 *
	 * Retrieve formatted usage, for frontend.
	 *
	 * @param String format
	 *
	 * @return array
	 */
	public function get_formatted_usage( $format = 'html' ) {
		$usage = [];

		foreach ( get_option( self::ELEMENTS_OPTION_NAME, [] ) as $doc_type => $elements ) {
			$doc_class = Plugin::$instance->documents->get_document_type( $doc_type );

			if ( 'html' === $format && $doc_class ) {
				$doc_title = $doc_class::get_title();
			} else {
				$doc_title = $doc_type;
			}

			$doc_count = $this->get_doc_type_count( $doc_class, $doc_type );

			$tab_group = $doc_class::get_property( 'admin_tab_group' );

			if ( 'html' === $format && $tab_group ) {
				$doc_title = ucwords( $tab_group ) . ' - ' . $doc_title;
			}

			// Replace element type with element title.
			foreach ( $elements as $element_type => $data ) {
				unset( $elements[ $element_type ] );

				if ( in_array( $element_type, [ 'section', 'column' ], true ) ) {
					continue;
				}

				$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( $element_type );

				if ( 'html' === $format && $widget_instance ) {
					$widget_title = $widget_instance->get_title();
				} else {
					$widget_title = $element_type;
				}

				$elements[ $widget_title ] = $data['count'];
			}

			// Sort elements by key.
			ksort( $elements );

			$usage[ $doc_type ] = [
				'title' => $doc_title,
				'elements' => $elements,
				'count' => $doc_count,
			];

			// ' ? 1 : 0;' In sorters is compatibility for PHP8.0.
			// Sort usage by title.
			uasort( $usage, function( $a, $b ) {
				return ( $a['title'] > $b['title'] ) ? 1 : 0;
			} );

			// If title includes '-' will have lower priority.
			uasort( $usage, function( $a ) {
				return strpos( $a['title'], '-' ) ? 1 : 0;
			} );
		}

		return $usage;
	}

	/**
	 * Before document Save.
	 *
	 * Called on elementor/document/before_save, remove document from global & set saving flag.
	 *
	 * @param Document $document
	 * @param array $data new settings to save.
	 */
	public function before_document_save( $document, $data ) {
		$current_status = get_post_status( $document->get_post() );
		$new_status = isset( $data['settings']['post_status'] ) ? $data['settings']['post_status'] : '';

		if ( $current_status === $new_status ) {
			$this->remove_document_usage( $document );
		}

		$this->is_document_saving = true;
	}

	/**
	 * After document save.
	 *
	 * Called on `elementor/document/after_save`, adds document to global & clear saving flag.
	 *
	 * @param Document $document
	 */
	public function after_document_save( $document ) {
		if ( Document::STATUS_PUBLISH === $document->get_post()->post_status || Document::STATUS_PRIVATE === $document->get_post()->post_status ) {
			$this->save_document_usage( $document );
		}

		$this->is_document_saving = false;
	}

	/**
	 * On status change.
	 *
	 * Called on `transition_post_status`.
	 *
	 * @param string $new_status
	 * @param string $old_status
	 * @param \WP_Post $post
	 */
	public function on_status_change( $new_status, $old_status, $post ) {
		if ( wp_is_post_autosave( $post ) ) {
			return;
		}

		// If it's from elementor editor, the usage should be saved via `before_document_save`/`after_document_save`.
		if ( $this->is_document_saving ) {
			return;
		}

		$document = Plugin::$instance->documents->get( $post->ID );

		if ( ! $document ) {
			return;
		}

		$is_public_unpublish = 'publish' === $old_status && 'publish' !== $new_status;
		$is_private_unpublish = 'private' === $old_status && 'private' !== $new_status;

		if ( $is_public_unpublish || $is_private_unpublish ) {
			$this->remove_document_usage( $document );
		}

		$is_public_publish = 'publish' !== $old_status && 'publish' === $new_status;
		$is_private_publish = 'private' !== $old_status && 'private' === $new_status;

		if ( $is_public_publish || $is_private_publish ) {
			$this->save_document_usage( $document );
		}
	}

	/**
	 * On before delete post.
	 *
	 * Called on `on_before_delete_post`.
	 *
	 * @param int $post_id
	 */
	public function on_before_delete_post( $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document->get_id() !== $document->get_main_id() ) {
			return;
		}

		$this->remove_document_usage( $document );
	}

	/**
	 * Add tracking data.
	 *
	 * Called on `elementor/tracker/send_tracking_data_params`.
	 *
	 * @param array $params
	 *
	 * @return array
	 */
	public function add_tracking_data( $params ) {
		$elements_usage = $this->global_elements_usage
			->create_from_global()
			->get_collection()
			->all();

		$params['usages']['elements'] = empty( $elements_usage ) ? false : $elements_usage;

		$params['usages']['documents'] = $this->global_settings_page_usage
			->create_from_global()
			->get_collection()
			->all();

		return $params;
	}

	/**
	 * Recalculate usage.
	 *
	 * Recalculate usage for all elementor posts.
	 *
	 * @param int $limit
	 * @param int $offset
	 *
	 * @return int
	 */
	public function recalc_usage( $limit = -1, $offset = 0 ) {
		// While requesting recalc_usage, data should be deleted.
		// if its in a batch the data should be deleted only on the first batch.
		if ( 0 === $offset ) {
			delete_option( self::ELEMENTS_OPTION_NAME );
		}

		$post_types = get_post_types( array( 'public' => true ) );

		// Cannot use the pagination parameters of WP_Query if set `no_found_rows` to true.
		$query = new \WP_Query( [
			'meta_key' => '_elementor_data',
			'post_type' => $post_types,
			'post_status' => [ 'publish', 'private' ],
			'posts_per_page' => $limit,
			'offset' => $offset,
		] );

		foreach ( $query->posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );

			if ( ! $document ) {
				continue;
			}

			$this->after_document_save( $document );
		}

		// Clear query memory before leave.
		wp_cache_flush();

		return count( $query->posts );
	}

	/**
	 * Save document usage.
	 *
	 * Save requested document usage, and update global.
	 *
	 * @param Document $document
	 */
	private function save_document_usage( Document $document ) {
		if ( ! $document::get_property( 'is_editable' ) && ! $document->is_built_with_elementor() ) {
			return;
		}

		try {
			$this->add_document_usage( $document );
		} catch ( \Exception $exception ) {
			Plugin::$instance->logger->get_logger()->error( $exception->getMessage(), [
				'document_id' => $document->get_id(),
				'document_name' => $document->get_name(),
			] );

			return;
		};
	}

	private function add_document_usage( $document ) {
		$this->global_elements_usage->add( $document )->save_global();
		$this->global_settings_page_usage->add( $document )->save_global();
	}

	private function remove_document_usage( $document ) {
		$this->global_elements_usage->remove( $document )->save_global();
		$this->global_settings_page_usage->remove( $document )->save_global();
	}

	/**
	 * Add system info report.
	 */
	public function add_system_info_report() {
		System_Info::add_report( 'usage', [
			'file_name' => __DIR__ . '/usage-reporter.php',
			'class_name' => __NAMESPACE__ . '\Usage_Reporter',
		] );
	}

	/**
	 * Usage module constructor.
	 *
	 * Initializing Elementor usage module.
	 *
	 * @access public
	 */
	public function __construct() {
		if ( ! Tracker::is_allow_track() ) {
			return;
		}

		$this->global_settings_page_usage = new Global_Documents_Usage();
		$this->global_elements_usage = new Global_Elements_Usage();

		add_action( 'transition_post_status', [ $this, 'on_status_change' ], 10, 3 );
		add_action( 'before_delete_post', [ $this, 'on_before_delete_post' ] );

		add_action( 'elementor/document/before_save', [ $this, 'before_document_save' ], 10, 2 );
		add_action( 'elementor/document/after_save', [ $this, 'after_document_save' ] );

		add_filter( 'elementor/tracker/send_tracking_data_params', [ $this, 'add_tracking_data' ] );

		add_action( 'admin_init', [ $this, 'add_system_info_report' ], 50 );
	}
}
