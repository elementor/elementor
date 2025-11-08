<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if (! defined('ABSPATH') ) {
    exit;
}

class Style_Resolution_Processor implements Css_Processor_Interface
{
    public function get_processor_name(): string
    {
        return 'style_resolution';
    }

    public function get_priority(): int
    {
        return 100; // Final step - highest priority number (runs last)
    }

    public function supports_context( Css_Processing_Context $context ): bool
    {
        $unified_style_manager = $context->get_metadata('unified_style_manager');
        $widgets = $context->get_widgets();

        return null !== $unified_style_manager && ! empty($widgets);
    }

    public function process( Css_Processing_Context $context ): Css_Processing_Context
    {
        $unified_style_manager = $context->get_metadata('unified_style_manager');
        $widgets = $context->get_widgets();
        $debug_log = WP_CONTENT_DIR . '/processor-data-flow.log';

        // DEBUG: Track target widget styles at START
        $target_widget_before = $this->find_target_widget($widgets, 'element-h2-6');
        $font_weight_before = $this->get_widget_resolved_style($target_widget_before, 'font-weight');
        $color_before = $this->get_widget_resolved_style($target_widget_before, 'color');
        file_put_contents(
            $debug_log,
            date('[H:i:s] ') . "STYLE_RESOLUTION_PROCESSOR START: Widget element-h2-6 font-weight = {$font_weight_before}, color = {$color_before}\n",
            FILE_APPEND
        );

        if (null === $unified_style_manager ) {
            return $context;
        }

        // DEBUG: Check if display styles are available before resolution
        $tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
        file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "STYLE_RESOLUTION_PROCESSOR: Starting resolution for " . count($widgets) . " widgets\n", FILE_APPEND );
        
        // Resolve styles recursively for all widgets
        $resolved_widgets = $this->resolve_styles_recursively($widgets, $unified_style_manager);
        
        // DEBUG: Check if display styles were applied
        foreach ( $resolved_widgets as $widget ) {
            $element_id = $widget['element_id'] ?? 'unknown';
            if ( in_array( $element_id, ['element-div-2', 'element-div-3'] ) ) {
                $styles = $widget['styles'] ?? [];
                $has_display = false;
                foreach ( $styles as $style_obj ) {
                    if ( isset( $style_obj['variants'][0]['props']['display'] ) ) {
                        $display_value = $style_obj['variants'][0]['props']['display'];
                        $has_display = true;
                        file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "STYLE_RESOLUTION_PROCESSOR: {$element_id} resolved display: " . json_encode($display_value) . "\n", FILE_APPEND );
                    }
                }
                if ( !$has_display ) {
                    file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "STYLE_RESOLUTION_PROCESSOR: {$element_id} NO display property found\n", FILE_APPEND );
                }
            }
        }

        // Get debug info and stats from style manager
        $debug_info = $unified_style_manager->get_debug_info();
        $reset_styles_stats = $unified_style_manager->get_reset_styles_stats();
        $complex_reset_styles = $unified_style_manager->get_complex_reset_styles();

        // DEBUG: Track target widget styles at END
        $target_widget_after = $this->find_target_widget($resolved_widgets, 'element-h2-6');
        $font_weight_after = $this->get_widget_resolved_style($target_widget_after, 'font-weight');
        $color_after = $this->get_widget_resolved_style($target_widget_after, 'color');
        file_put_contents(
            $debug_log,
            date('[H:i:s] ') . "STYLE_RESOLUTION_PROCESSOR END: Widget element-h2-6 font-weight = {$font_weight_after}, color = {$color_after}\n",
            FILE_APPEND
        );

        // DEBUG: Track if we're overwriting widget data
        $widgets_before = $context->get_widgets();
        foreach ( $widgets_before as $index => $widget_before ) {
            $widget_after = $resolved_widgets[ $index ] ?? null;
            $widget_type = $widget_before['widget_type'] ?? '';
            $element_id = $widget_before['element_id'] ?? '';
            
            if ( $widget_type === 'e-heading' && $widget_after ) {
                $classes_before = $widget_before['attributes']['class'] ?? '';
                $classes_after = $widget_after['attributes']['class'] ?? '';
                
                if ( $classes_before !== $classes_after ) {
                    file_put_contents(
                        $debug_log,
                        date( '[H:i:s] ' ) . "STYLE_RESOLUTION_PROCESSOR: OVERWRITING widget data for {$element_id}\n" .
                        "  Classes before: '{$classes_before}'\n" .
                        "  Classes after:  '{$classes_after}'\n",
                        FILE_APPEND
                    );
                }
            }
        }

        // Update widgets in context
        $context->set_widgets($resolved_widgets);
        $context->set_metadata('style_resolution_debug_info', $debug_info);
        $context->set_metadata('reset_styles_stats', $reset_styles_stats);
        $context->set_metadata('complex_reset_styles', $complex_reset_styles);

        // Add statistics
        $context->add_statistic('widgets_with_resolved_styles', $this->count_widgets_with_resolved_styles($resolved_widgets));
        $context->add_statistic('reset_styles_detected', $reset_styles_stats['reset_element_styles'] > 0 || $reset_styles_stats['reset_complex_styles'] > 0 ? 1 : 0);
        $context->add_statistic('complex_reset_styles_count', count($complex_reset_styles));

        return $context;
    }

    public function get_statistics_keys(): array
    {
        return [
        'widgets_with_resolved_styles',
        'reset_styles_detected',
        'complex_reset_styles_count',
        ];
    }

    private function resolve_styles_recursively( array $widgets, $unified_style_manager ): array
    {
        $resolved_widgets = [];

        foreach ( $widgets as $widget ) {
            $widget_id = $this->get_widget_identifier($widget);
            $element_id = $widget['element_id'] ?? 'no-element-id';
            $widget_classes = $widget['attributes']['class'] ?? '';

            $resolved_styles = $unified_style_manager->resolve_styles_for_widget($widget);

            // DEBUG: Log resolved styles for specific widgets
            if ( in_array( $element_id, ['element-div-2', 'element-div-3', 'element-div-4'] ) ) {
                $tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
                $display_in_resolved = isset($resolved_styles['display']) ? json_encode($resolved_styles['display']) : 'NOT_FOUND';
                file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "RESOLVE_RECURSIVELY: {$element_id} resolved_styles['display'] = {$display_in_resolved}\n", FILE_APPEND );
                file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "RESOLVE_RECURSIVELY: {$element_id} total resolved styles = " . count($resolved_styles) . "\n", FILE_APPEND );
            }

            // CRITICAL FIX: Preserve existing widget data (including modified classes) and only add resolved_styles
            $resolved_widget = $widget; // Preserve all existing data including modified attributes
            $resolved_widget['resolved_styles'] = $resolved_styles;

            // Recursively resolve styles for child widgets
            if (! empty($resolved_widget['children']) ) {
                $resolved_widget['children'] = $this->resolve_styles_recursively($resolved_widget['children'], $unified_style_manager);
            }

            $resolved_widgets[] = $resolved_widget;
        }

        return $resolved_widgets;
    }

    private function get_widget_identifier( array $widget ): string
    {
        $widget_type = $widget['widget_type'] ?? 'unknown';
        $element_id = $widget['element_id'] ?? 'no-element-id';
        return "{$widget_type}#{$element_id}";
    }

    private function count_widgets_with_resolved_styles( array $widgets ): int
    {
        $count = 0;

        foreach ( $widgets as $widget ) {
            // Check if widget has resolved styles
            if (! empty($widget['resolved_styles']) ) {
                ++$count;
            }

            // Count children recursively
            if (! empty($widget['children']) ) {
                $count += $this->count_widgets_with_resolved_styles($widget['children']);
            }
        }

        return $count;
    }

    private function find_target_widget( array $widgets, string $element_id ): ?array
    {
        foreach ( $widgets as $widget ) {
            if (( $widget['element_id'] ?? '' ) === $element_id ) {
                return $widget;
            }
            if (! empty($widget['children']) ) {
                $found = $this->find_target_widget($widget['children'], $element_id);
                if ($found ) {
                    return $found;
                }
            }
        }
        return null;
    }

    private function get_widget_resolved_style( ?array $widget, string $property ): string
    {
        if (! $widget ) {
            return 'WIDGET_NOT_FOUND';
        }

        $resolved_styles = $widget['resolved_styles'] ?? [];
        if (isset($resolved_styles[ $property ]) ) {
            $style = $resolved_styles[ $property ];
            return $style['value'] ?? 'NO_VALUE';
        }

        return 'PROPERTY_NOT_FOUND';
    }
}
