<?php

namespace Elementor\App\Modules\OnboardingV2\Storage;

use Elementor\App\Modules\OnboardingV2\Storage\Entities\User_Progress;
use Elementor\App\Modules\OnboardingV2\Storage\Entities\User_Choices;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Repository {

	const PROGRESS_OPTION_KEY = 'elementor_onboarding_v2_progress';
	const CHOICES_OPTION_KEY = 'elementor_onboarding_v2_choices';

	private static ?Repository $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function get_progress(): User_Progress {
		$data = $this->load_option( self::PROGRESS_OPTION_KEY );

		if ( empty( $data ) ) {
			return User_Progress::default();
		}

		return User_Progress::from_array( $data );
	}

	public function save_progress( User_Progress $progress ): bool {
		return $this->save_option( self::PROGRESS_OPTION_KEY, $progress->to_array() );
	}

	public function update_progress( array $data ): User_Progress {
		$progress = $this->get_progress();
		$progress->apply_changes( $data );
		$this->save_progress( $progress );

		return $progress;
	}

	public function get_choices(): User_Choices {
		$data = $this->load_option( self::CHOICES_OPTION_KEY );

		if ( empty( $data ) ) {
			return User_Choices::default();
		}

		return User_Choices::from_array( $data );
	}

	public function save_choices( User_Choices $choices ): bool {
		return $this->save_option( self::CHOICES_OPTION_KEY, $choices->to_array() );
	}

	public function update_choices( array $data ): User_Choices {
		$choices = $this->get_choices();
		$choices->merge( $data );
		$this->save_choices( $choices );

		return $choices;
	}

	public function had_unexpected_exit(): bool {
		return $this->get_progress()->had_unexpected_exit();
	}

	public function reset(): void {
		delete_option( self::PROGRESS_OPTION_KEY );
		delete_option( self::CHOICES_OPTION_KEY );
	}

	private function load_option( string $key ): array {
		$value = get_option( $key );

		if ( empty( $value ) ) {
			return [];
		}

		if ( is_string( $value ) ) {
			$value = json_decode( $value, true );
		}

		return is_array( $value ) ? $value : [];
	}

	private function save_option( string $key, array $data ): bool {
		return update_option( $key, wp_json_encode( $data ) );
	}
}
