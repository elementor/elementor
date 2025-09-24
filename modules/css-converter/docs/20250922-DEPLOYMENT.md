# CSS Class Converter - Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All tests passing (PHPUnit)
- [x] Code follows WordPress coding standards
- [x] No linting errors
- [x] Performance optimizations implemented
- [x] Security validations in place
- [x] Error handling comprehensive

### ✅ Testing
- [x] Unit tests for all components
- [x] Integration tests for end-to-end flows
- [x] API tests for REST endpoints
- [x] Manual testing completed
- [x] Edge case handling verified

### ✅ Documentation
- [x] User guide complete
- [x] Implementation guide available
- [x] API documentation ready
- [x] Changelog prepared
- [x] Future roadmap documented

### ✅ Integration
- [x] Module properly integrated with Elementor
- [x] Global Classes system integration tested
- [x] Variable conversion system integration verified
- [x] REST API routes registered correctly

## Deployment Steps

### 1. Pre-Deployment Verification

```bash
# Run all tests
cd /path/to/elementor/tests/phpunit
phpunit elementor/modules/css-converter/

# Verify manual test suite
wp eval-file modules/css-converter/test-class-conversion.php

# Check for any linting issues
composer run lint
```

### 2. Feature Flag (Optional)

If using feature flags, ensure the CSS Class Converter is properly gated:

```php
// In experiments or feature flags
'css_class_converter' => [
    'label' => 'CSS Class Converter',
    'description' => 'Convert CSS classes to Global Classes',
    'default' => false, // Start disabled
    'dependencies' => ['global_classes'],
]
```

### 3. Database Considerations

No database migrations required. The feature uses existing:
- Kit metadata for Global Classes storage
- Variable system for CSS variable conversion

### 4. Performance Monitoring

Monitor these metrics post-deployment:
- API response times for `/css-converter/classes`
- Memory usage during large CSS processing
- Global Classes storage performance
- Error rates and warning frequencies

### 5. Rollback Plan

If issues arise:
1. Disable the feature via experiment flag
2. Remove REST route registration
3. Clear any cached Global Classes if needed

## Configuration

### Environment Variables

No environment variables required for MVP. Optional configurations:

```php
// Allow public access (development only)
define('ELEMENTOR_CSS_CONVERTER_ALLOW_PUBLIC_ACCESS', true);

// Enable debug logging
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Filters and Hooks

Available for customization:

```php
// Allow public access override
add_filter('elementor_css_converter_allow_public_access', '__return_true');

// Customize supported properties (future)
add_filter('elementor_css_converter_supported_properties', function($properties) {
    $properties[] = 'background-color';
    return $properties;
});
```

## Monitoring and Maintenance

### Log Files

Monitor these log locations:
- CSS files: `modules/css-converter/logs/css-*.css`
- PHP errors: WordPress debug.log
- API errors: REST API logs

### Performance Metrics

Key metrics to track:
- Average conversion time per class
- Memory usage for large CSS files
- API success/error rates
- Global Classes storage performance

### Health Checks

Regular health checks:
```bash
# Test API endpoint
curl -X POST "/wp-json/elementor/v2/css-converter/classes" \
  -d '{"css": ".test { color: red; }", "store": false}'

# Verify module loading
wp eval 'var_dump(class_exists("Elementor\Modules\CssConverter\Module"));'

# Check Global Classes integration
wp eval 'var_dump(class_exists("Elementor\Modules\GlobalClasses\Global_Classes_Repository"));'
```

## Security Considerations

### Access Control
- Default: Admin capability required (`manage_options`)
- Override: `elementor_css_converter_allow_public_access` filter
- REST API: WordPress nonce verification

### Input Validation
- CSS parsing: Sabberworm parser validation
- URL fetching: WordPress HTTP API security
- Parameter sanitization: REST API validation

### Output Sanitization
- Schema validation for Global Classes
- XSS prevention in labels and values
- SQL injection prevention via parameterized queries

## Troubleshooting

### Common Issues

1. **API Returns 403 Forbidden**
   - Check user permissions
   - Verify `manage_options` capability
   - Check filter overrides

2. **CSS Parsing Errors**
   - Validate CSS syntax
   - Check for unsupported CSS features
   - Review error logs

3. **No Classes Converted**
   - Verify simple class selectors (`.className`)
   - Check supported properties (`color`, `font-size`)
   - Review warnings in response

4. **Global Classes Not Stored**
   - Check Global Classes module availability
   - Verify kit metadata permissions
   - Review storage error logs

### Debug Mode

Enable debug mode for detailed logging:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Test with debug info
wp eval '
$service = new \Elementor\Modules\CssConverter\Services\Class_Conversion_Service();
$result = $service->convert_css_to_global_classes(".test { color: red; }");
error_log("CSS Converter Result: " . print_r($result, true));
'
```

## Post-Deployment Tasks

### 1. User Communication
- Update documentation
- Notify users of new feature
- Provide usage examples
- Share best practices

### 2. Feedback Collection
- Monitor support channels
- Collect user feedback
- Track feature usage
- Identify improvement areas

### 3. Performance Optimization
- Monitor API performance
- Optimize based on usage patterns
- Consider caching strategies
- Plan scaling improvements

### 4. Future Development
- Review roadmap priorities
- Plan next iteration features
- Gather requirements for enhancements
- Schedule development cycles

## Success Criteria

### Functional Requirements
- ✅ CSS classes successfully converted to Global Classes
- ✅ Color and font-size properties properly mapped
- ✅ CSS variables correctly resolved
- ✅ Duplicate classes properly handled
- ✅ API responds within acceptable time limits

### Performance Requirements
- ✅ API response time < 5 seconds for typical CSS files
- ✅ Memory usage < 256MB for large CSS files
- ✅ Error rate < 1% under normal conditions
- ✅ No impact on existing Elementor functionality

### User Experience Requirements
- ✅ Clear error messages and warnings
- ✅ Comprehensive documentation available
- ✅ Intuitive API interface
- ✅ Reliable conversion results

## Support and Maintenance

### Documentation Updates
Keep documentation current with:
- Feature changes and improvements
- New supported properties
- API changes and additions
- Best practices and examples

### Regular Maintenance
- Monitor performance metrics
- Update dependencies as needed
- Review and update tests
- Plan feature enhancements

### Community Support
- Respond to user questions
- Address bug reports promptly
- Consider feature requests
- Maintain active communication
