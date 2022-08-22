<?php
namespace Elementor\Core\App\Modules\ImportExport\Processes;

class Revert extends Process_Base {

	private $import_sessions;

	/**
	 * @throws \Exception
	 */
	public function __construct() {
		parent::__construct();

		$this->import_sessions = $this->get_import_sessions();
	}

	public function run() {
		if ( empty( $this->runners ) ) {
			throw new \Exception( 'Please specify revert runners.' );
		}

		$data = $this->get_last_session_data();

		foreach ( $this->runners as $runner ) {
			if ( $runner->should_revert( $data ) ) {
				$runner->revert( $data );
			}
		}

		$this->revert_attachments( $data );

		$this->delete_last_import_data();
	}

	public function get_import_sessions() {
		$import_sessions = get_option( 'elementor_import_sessions' );

		if ( ! $import_sessions ) {
			return [];
		}

		ksort( $import_sessions, SORT_NUMERIC );

		return $import_sessions;
	}

	public function get_revert_sessions() {
		$revert_sessions = get_option( 'elementor_revert_sessions' );

		if ( ! $revert_sessions ) {
			return [];
		}

		return $revert_sessions;
	}

	public function get_last_session_data() {
		$session_data = $this->import_sessions;

		if ( empty( $session_data ) ) {
			return [];
		}

		return end( $session_data );
	}

	public function get_penultimate_session_data() {
		$session_data = $this->import_sessions;
		$penultimate_element_value = [];

		if ( empty( $session_data ) ) {
			return [];
		}

		end( $session_data );

		prev( $session_data );

		if ( ! is_null( key( $session_data ) ) ) {
			$penultimate_element_value = current( $session_data );
		}

		return $penultimate_element_value;
	}

	private function delete_last_import_data() {
		$import_sessions = get_option( 'elementor_import_sessions' );
		$revert_sessions = get_option( 'elementor_revert_sessions' );

		$reverted_session = array_pop( $import_sessions );

		$revert_sessions[] = [
			'session_id' => $reverted_session['session_id'],
//			'kit_id' => $reverted_session['kit_id'],
			'kit_name' => $reverted_session['kit_name'],
			'source' => $reverted_session['kit_source'],
			'user_id' => get_current_user_id(),
			'import_timestamp' => $reverted_session['start_timestamp'],
			'revert_timestamp' => current_time( 'timestamp' ),
		];

		update_option( 'elementor_import_sessions', $import_sessions, 'no' );
		update_option( 'elementor_revert_sessions', $revert_sessions, 'no' );
	}

	private function revert_attachments( $data ) {
		$query_args = [
			'post_type' => 'attachment',
			'post_status' => 'any',
			'posts_per_page' => -1,
			'meta_query' => [
				[
					'key' => '_elementor_import_session_id',
					'value' => $data['session_id'],
				],
			],
		];

		$query = new \WP_Query( $query_args );

		foreach ( $query->posts as $post ) {
			wp_delete_attachment( $post->ID, true );
		}
	}
}
