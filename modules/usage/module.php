<?php

namespace Elementor\Modules\Usage;

use Elementor\Core\Base\Document;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\System_Info\Main as System_Info;
use Elementor\DB;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor usage module.
 *
 * Elementor usage module handler class is responsible for registering and
 * managing Elementor usage modules.
 *
 */
class Module extends BaseModule {
	const META_KEY = '_elementor_elements_usage';
	const OPTION_NAME = 'elementor_elements_usage';

	/**
	 * @var bool
	 */
	private $is_document_saving = false;

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

	public function get_formatted_usage() {
		$usage = [];

		foreach ( get_option( self::OPTION_NAME, [] ) as $doc_type => $elements ) {
			$doc_class = Plugin::$instance->documents->get_document_type( $doc_type );

			if ( $doc_class ) {
				$doc_title = $doc_class::get_title();
			} else {
				$doc_title = $doc_type;
			}

			$tab_group = $doc_class::get_property( 'admin_tab_group' );

			if ( $tab_group ) {
				$doc_title = ucwords( $tab_group ) . ' - ' . $doc_title;
			}

			// Sort by key.
			ksort( $elements );

			foreach ( $elements as $element_type => $count ) {
				unset( $elements[ $element_type ] );

				if ( in_array( $element_type, [ 'section', 'column' ], true ) ) {
					continue;
				}

				$widget_instance = Plugin::$instance->widgets_manager->get_widget_types( $element_type );

				if ( $widget_instance ) {
					$widget_title = $widget_instance->get_title();
				} else {
					$widget_title = $element_type;
				}

				$elements[ $widget_title ] = $count;
			}

			$usage[ $doc_type ] = [
				'title' => $doc_title,
				'elements' => $elements,
			];
		}

		return $usage;
	}

	public function set_saving_flag() {
		$this->is_document_saving = true;
	}

	public function on_status_change( $new_status, $old_status, $post ) {
		$document = Plugin::$instance->documents->get( $post->ID );

		if ( ! $document ) {
			return;
		}

		$is_public_unpublish = 'publish' === $old_status && 'publish' !== $new_status;
		$is_private_unpublish = 'private' === $old_status && 'private' !== $new_status;

		if ( $is_public_unpublish || $is_private_unpublish ) {
			$prev_usage = $document->get_meta( self::META_KEY );

			$this->remove_from_global( $document->get_name(), $prev_usage );
		}

		// If it's from elementor editor, the usage should be saved after post meta was updated.
		if ( $this->is_document_saving ) {
			return;
		}

		$is_public_publish = 'publish' !== $old_status && 'publish' === $new_status;
		$is_private_publish = 'private' !== $old_status && 'private' === $new_status;

		if ( $is_public_publish || $is_private_publish ) {
			$this->save_document_usage( $document );
		}
	}

	/**
	 * @param Document $document
	 */
	public function save_usage( $document ) {
		if ( DB::STATUS_PUBLISH === $document->get_post()->post_status ) {
			$this->save_document_usage( $document );
		}

		$this->is_document_saving = false;
	}

	public function add_tracking_data( $params ) {
		$params['usages']['elements'] = get_option( self::OPTION_NAME );

		return $params;
	}

	private function add_to_global( $doc_name, $doc_usage ) {
		$global_usage = get_option( self::OPTION_NAME, [] );

		foreach ( $doc_usage as $type => $count ) {
			if ( ! isset( $global_usage[ $doc_name ] ) ) {
				$global_usage[ $doc_name ] = [];
			}

			if ( ! isset( $global_usage[ $doc_name ][ $type ] ) ) {
				$global_usage[ $doc_name ][ $type ] = 0;
			}

			$global_usage[ $doc_name ][ $type ] += $doc_usage[ $type ];
		}

		update_option( self::OPTION_NAME, $global_usage, false );
	}

	private function remove_from_global( $doc_name, $doc_usage ) {
		$global_usage = get_option( self::OPTION_NAME, [] );

		foreach ( $doc_usage as $type => $count ) {
			if ( isset( $global_usage[ $doc_name ][ $type ] ) ) {
				$global_usage[ $doc_name ][ $type ] -= $doc_usage[ $type ];
				if ( 0 === $global_usage[ $doc_name ][ $type ] ) {
					unset( $global_usage[ $doc_name ][ $type ] );
				}
			}
		}

		update_option( self::OPTION_NAME, $global_usage, false );
	}

	private function get_elements_usage( $elements ) {
		$usage = [];

		Plugin::$instance->db->iterate_data( $elements, function ( $element ) use ( & $usage ) {
			if ( empty( $element['widgetType'] ) ) {
				$type = $element['elType'];
			} else {
				$type = $element['widgetType'];
			}

			if ( ! isset( $usage[ $type ] ) ) {
				$usage[ $type ] = 0;
			}

			$usage[ $type ] ++;

			return $element;
		} );

		return $usage;
	}

	/**
	 * @param Document $document
	 */
	private function save_document_usage( Document $document ) {
		if ( ! $document::get_property( 'is_editable' ) ) {
			return;
		}

		$usage = $this->get_elements_usage( $document->get_elements_raw_data() );

		$document->update_meta( self::META_KEY, $usage );

		$this->add_to_global( $document->get_name(), $usage );
	}

	/**
	 * Usage module constructor.
	 *
	 * Initializing Elementor usage module.
	 *
	 * @access public
	 */
	public function __construct() {
		add_action( 'transition_post_status', [ $this, 'on_status_change' ], 10, 3 );

		add_action( 'elementor/document/before_save', [ $this, 'set_saving_flag' ] );
		add_action( 'elementor/document/after_save', [ $this, 'save_usage' ] );

		add_filter( 'elementor/tracker/send_tracking_data_params', [ $this, 'add_tracking_data' ] );

		System_Info::add_report( 'usage', [
			'file_name' => __DIR__ . '/usage-reporter.php',
			'class_name' => __NAMESPACE__ . '\Usage_Reporter',
		] );
	}
}
