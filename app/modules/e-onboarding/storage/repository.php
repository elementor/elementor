<?php

namespace Elementor\App\Modules\E_Onboarding\Storage;

use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Choices;
use Elementor\App\Modules\E_Onboarding\Storage\Entities\User_Progress;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Repository {

	const PROGRESS_OPTION_KEY = 'elementor_e_onboarding_progress';
	const CHOICES_OPTION_KEY = 'elementor_e_onboarding_choices';
	const DEFAULT_TOTAL_STEPS = 5;

	private static ?Repository $instance = null;

	public static function instance(): Repository {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function get_progress(): User_Progress {
		$data = get_option( self::PROGRESS_OPTION_KEY, [] );

		return User_Progress::from_array( $data );
	}

	public function save_progress( User_Progress $progress ): User_Progress {
		update_option( self::PROGRESS_OPTION_KEY, $progress->to_array() );

		return $progress;
	}

	public function update_progress( array $params ): User_Progress {
		$progress = $this->get_progress();

		if ( isset( $params['current_step'] ) ) {
			$progress->set_current_step( (int) $params['current_step'] );
		}

		if ( isset( $params['completed_steps'] ) ) {
			$progress->set_completed_steps( (array) $params['completed_steps'] );
		}

		if ( isset( $params['exit_type'] ) ) {
			$progress->set_exit_type( $params['exit_type'] );
		}

		if ( isset( $params['complete_step'] ) ) {
			$step = $params['complete_step'];
			$progress->add_completed_step( $step );

			$total_steps = $params['total_steps'] ?? self::DEFAULT_TOTAL_STEPS;

			for ( $i = 0; $i < $total_steps; $i++ ) {
				if ( ! $progress->is_step_completed( $i ) ) {
					$progress->set_current_step( $i );
					break;
				}
			}
		}

		if ( isset( $params['start'] ) && $params['start'] ) {
			$progress->set_started_at( current_time( 'timestamp' ) );
			$progress->set_exit_type( null );
		}

		if ( isset( $params['complete'] ) && $params['complete'] ) {
			$progress->set_completed_at( current_time( 'timestamp' ) );
			$progress->set_exit_type( 'user_exit' );
		}

		if ( isset( $params['user_exit'] ) && $params['user_exit'] ) {
			$progress->set_exit_type( 'user_exit' );
		}

		$progress->set_last_active_timestamp( current_time( 'timestamp' ) );

		return $this->save_progress( $progress );
	}

	public function get_choices(): User_Choices {
		$data = get_option( self::CHOICES_OPTION_KEY, [] );

		return User_Choices::from_array( $data );
	}

	public function save_choices( User_Choices $choices ): User_Choices {
		update_option( self::CHOICES_OPTION_KEY, $choices->to_array() );

		return $choices;
	}

	public function update_choices( array $params ): User_Choices {
		$choices = $this->get_choices();

		// Step 1: Who are you building for? (single)
		if ( isset( $params['building_for'] ) ) {
			$choices->set_building_for( $params['building_for'] );
		}

		// Step 2: What is your site about? (multiple)
		if ( isset( $params['site_about'] ) ) {
			$choices->set_site_about( (array) $params['site_about'] );
		}

		// Step 3: Experience level (single)
		if ( isset( $params['experience_level'] ) ) {
			$choices->set_experience_level( $params['experience_level'] );
		}

		// Step 4: Theme selection (single)
		if ( isset( $params['theme_selection'] ) ) {
			$choices->set_theme_selection( $params['theme_selection'] );
		}

		// Step 5: Site features (multiple)
		if ( isset( $params['site_features'] ) ) {
			$choices->set_site_features( (array) $params['site_features'] );
		}

		return $this->save_choices( $choices );
	}

	public function reset(): void {
		delete_option( self::PROGRESS_OPTION_KEY );
		delete_option( self::CHOICES_OPTION_KEY );
	}

	private function __construct() {}
}
