# Letter-Spacing Property Analysis

## 🎯 **Test Objective**
Isolate and analyze the letter-spacing property conversion and rendering to understand why it's not being applied to DOM elements.

## 🔍 **Test Setup**
- **Test File**: `letter-spacing-prop-type.test.ts`
- **Expected Result**: ❌ **TESTS SHOULD FAIL** (this is expected behavior)
- **Isolation**: Separated from complex `flat-classes-test-page.html` to focus on single property

## 📋 **Test Cases**

### **HTML Test Content**:
```html
<div>
    <h1 style="letter-spacing: 1px;" data-test="letter-spacing-1px">Letter spacing 1px</h1>
    <h2 style="letter-spacing: 2px;" data-test="letter-spacing-2px">Letter spacing 2px</h2>
    <p style="letter-spacing: 0.5px;" data-test="letter-spacing-half">Letter spacing 0.5px</p>
    <p style="letter-spacing: 1.5px;" data-test="letter-spacing-decimal">Letter spacing 1.5px</p>
    <p style="letter-spacing: 0.1em;" data-test="letter-spacing-em">Letter spacing 0.1em</p>
    <p style="letter-spacing: normal;" data-test="letter-spacing-normal">Letter spacing normal</p>
</div>
```

### **Expected Failures**:
1. **H1 letter-spacing: 1px** → Expected: `1px`, Actual: `normal`
2. **H2 letter-spacing: 2px** → Expected: `2px`, Actual: `normal`
3. **P letter-spacing: 0.5px** → Expected: `0.5px`, Actual: `normal`
4. **P letter-spacing: 1.5px** → Expected: `1.5px`, Actual: `normal`
5. **P letter-spacing: 0.1em** → Expected: `0.1em`, Actual: `normal`

## 🔬 **Analysis Framework**

### **Step 1: Conversion Verification**
- ✅ **API Success**: Verify widgets are created successfully
- ✅ **Mapper Called**: Confirm letter-spacing mapper is invoked
- ✅ **Atomic Structure**: Verify correct `Size_Prop_Type` structure generated

### **Step 2: Widget Investigation**
- 🔍 **Atomic Widget Type**: Identify which atomic widget receives the property
- 🔍 **Property Application**: Check if atomic widget applies letter-spacing to DOM
- 🔍 **Style Schema**: Verify letter-spacing is supported in atomic widget schema

### **Step 3: DOM Rendering Analysis**
- 🔍 **Editor Rendering**: Check computed styles in Elementor editor
- 🔍 **Frontend Rendering**: Check computed styles on published page
- 🔍 **CSS Output**: Analyze generated CSS for letter-spacing rules

## 📊 **Debug Output Analysis**

### **Expected Debug Logs**:
```
🔍 DEBUG: Starting letter-spacing prop type test
🔍 DEBUG: Converting HTML content with letter-spacing properties
🔍 DEBUG: API Result: { success: true, widgets_created: X, ... }
🔍 DEBUG: Navigating to editor URL: ...
🔍 DEBUG: Editor loaded, starting style verification
🔍 DEBUG: Testing letter-spacing: 1px on h1 with selector .e-heading-base
🔍 DEBUG: letter-spacing: 1px on h1 - Expected: 1px, Actual: normal
❌ EXPECTED FAILURE: letter-spacing: 1px on h1 failed as expected
```

### **Key Metrics to Track**:
- **Widgets Created**: Number of atomic widgets generated
- **Global Classes**: Number of global classes created
- **Conversion Success**: API call success rate
- **Property Mapper Calls**: Letter-spacing mapper invocation count

## 🚨 **Known Issues to Investigate**

### **1. Atomic Widget Support**
**Question**: Does the atomic heading/paragraph widget support letter-spacing?
- **File to Check**: `/atomic-widgets/elements/atomic-heading.php`
- **Schema Check**: `/atomic-widgets/styles/style-schema.php`
- **Expected**: Letter-spacing should be in supported properties

### **2. Property Mapper Integration**
**Question**: Is the letter-spacing mapper properly integrated?
- **Registry Check**: `class-property-mapper-registry.php`
- **Mapper Implementation**: `letter-spacing-property-mapper.php`
- **Expected**: Mapper should be registered and called

### **3. Atomic Structure Application**
**Question**: Is the atomic structure being applied to the widget?
- **Widget Creator**: Check if atomic values are stored correctly
- **Style Application**: Check if atomic widgets render the styles
- **Expected**: Atomic structure should translate to DOM styles

## 🔧 **Debugging Steps**

### **Step 1: Run the Test**
```bash
cd plugins/elementor-css/tests/playwright
npx playwright test prop-types/letter-spacing-prop-type.test.ts --headed
```

### **Step 2: Analyze Debug Output**
- Check console logs for debug information
- Verify API conversion success
- Note actual vs expected values

### **Step 3: Check WordPress Debug Log**
```bash
tail -f debug.log | grep -E "(letter-spacing|Letter_Spacing|create_atomic_size_value)"
```

### **Step 4: Inspect Atomic Widget Schema**
- Check if letter-spacing is supported in atomic widget style schema
- Verify prop type definitions match our mapper output

## 📝 **Test Results Template**

### **Test Run: [DATE]**

#### **API Conversion**:
- ✅/❌ **Success**: 
- **Widgets Created**: 
- **Global Classes**: 
- **Post ID**: 

#### **Property Mapper**:
- ✅/❌ **Mapper Called**: 
- ✅/❌ **Atomic Structure Generated**: 
- **Debug Log Output**: 

#### **DOM Rendering**:
- ❌ **Editor letter-spacing**: Expected `1px`, Actual `normal`
- ❌ **Frontend letter-spacing**: Expected `1px`, Actual `normal`

#### **Root Cause Analysis**:
- **Issue Location**: [Mapper/Widget/Schema/Other]
- **Specific Problem**: 
- **Proposed Solution**: 

## 🎯 **Success Criteria**

### **When Tests Should Pass**:
1. **Atomic Widget Support**: Letter-spacing added to atomic widget schema
2. **Property Application**: Atomic widgets apply letter-spacing to DOM
3. **Style Rendering**: Computed styles match expected values

### **Current Status**: 
- **Expected**: ❌ **FAILING** (this is correct for now)
- **Goal**: ✅ **PASSING** (after atomic widget fixes)

## 📋 **Next Steps**

1. **Run Test**: Execute and document failures
2. **Analyze Results**: Identify specific failure points
3. **Investigate Schema**: Check atomic widget style support
4. **Propose Fix**: Determine if issue is in mapper, widget, or schema
5. **Implement Solution**: Apply fixes based on root cause analysis

---

**Note**: This test is designed to fail initially. The failures will help us understand exactly where the letter-spacing property is being lost in the conversion pipeline.
