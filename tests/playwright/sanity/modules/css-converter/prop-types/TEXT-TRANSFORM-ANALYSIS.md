# Text-Transform Property Analysis

## 🎯 **Test Objective**
Isolate and analyze the text-transform property conversion and rendering to understand why it's not being applied to DOM elements.

## 🔍 **Test Setup**
- **Test File**: `text-transform-prop-type.test.ts`
- **Expected Result**: ❌ **TESTS SHOULD FAIL** (this is expected behavior)
- **Isolation**: Separated from complex `flat-classes-test-page.html` to focus on single property

## 📋 **Test Cases**

### **HTML Test Content**:
```html
<div>
    <h1 style="text-transform: uppercase;" data-test="text-transform-uppercase">Uppercase Text</h1>
    <h2 style="text-transform: lowercase;" data-test="text-transform-lowercase">Lowercase Text</h2>
    <p style="text-transform: capitalize;" data-test="text-transform-capitalize">capitalize text</p>
    <p style="text-transform: none;" data-test="text-transform-none">None Transform</p>
</div>
```

### **Expected Failures**:
1. **H1 text-transform: uppercase** → Expected: `uppercase`, Actual: `none`
2. **H2 text-transform: lowercase** → Expected: `lowercase`, Actual: `none`
3. **P text-transform: capitalize** → Expected: `capitalize`, Actual: `none`
4. **P text-transform: none** → Expected: `none`, Actual: `none` (this might pass)

## 🔬 **Analysis Framework**

### **Step 1: Conversion Verification**
- ✅ **API Success**: Verify widgets are created successfully
- ✅ **Mapper Called**: Confirm text-transform mapper is invoked
- ✅ **Atomic Structure**: Verify correct `String_Prop_Type` structure generated

### **Step 2: Widget Investigation**
- 🔍 **Atomic Widget Type**: Identify which atomic widget receives the property
- 🔍 **Property Application**: Check if atomic widget applies text-transform to DOM
- 🔍 **Style Schema**: Verify text-transform is supported in atomic widget schema

### **Step 3: DOM Rendering Analysis**
- 🔍 **Editor Rendering**: Check computed styles in Elementor editor
- 🔍 **Frontend Rendering**: Check computed styles on published page
- 🔍 **CSS Output**: Analyze generated CSS for text-transform rules

## 📊 **Debug Output Analysis**

### **Expected Debug Logs**:
```
🔍 DEBUG: Starting text-transform prop type test
🔍 DEBUG: Converting HTML content with text-transform properties
🔍 DEBUG: API Result: { success: true, widgets_created: X, ... }
🔍 DEBUG: Navigating to editor URL: ...
🔍 DEBUG: Editor loaded, starting style verification
🔍 DEBUG: Testing text-transform: uppercase on h1 with selector .e-heading-base
🔍 DEBUG: text-transform: uppercase on h1 - Expected: uppercase, Actual: none
❌ EXPECTED FAILURE: text-transform: uppercase on h1 failed as expected
```

### **Key Metrics to Track**:
- **Widgets Created**: Number of atomic widgets generated
- **Global Classes**: Number of global classes created
- **Conversion Success**: API call success rate
- **Property Mapper Calls**: Text-transform mapper invocation count

## 🚨 **Known Issues to Investigate**

### **1. Atomic Widget Support**
**Question**: Does the atomic heading/paragraph widget support text-transform?
- **File to Check**: `/atomic-widgets/elements/atomic-heading.php`
- **Schema Check**: `/atomic-widgets/styles/style-schema.php`
- **Expected**: Text-transform should be in supported properties

### **2. Property Mapper Integration**
**Question**: Is the text-transform mapper properly integrated?
- **Registry Check**: `class-property-mapper-registry.php`
- **Mapper Implementation**: `text-transform-property-mapper.php`
- **Expected**: Mapper should be registered and called

### **3. Enum Value Validation**
**Question**: Are the text-transform values properly validated?
- **Valid Values**: `none`, `capitalize`, `uppercase`, `lowercase`
- **Mapper Logic**: Check enum validation in mapper
- **Expected**: Only valid enum values should be processed

### **4. Atomic Structure Application**
**Question**: Is the atomic structure being applied to the widget?
- **Widget Creator**: Check if atomic values are stored correctly
- **Style Application**: Check if atomic widgets render the styles
- **Expected**: Atomic structure should translate to DOM styles

## 🔧 **Debugging Steps**

### **Step 1: Run the Test**
```bash
cd plugins/elementor-css/tests/playwright
npx playwright test prop-types/text-transform-prop-type.test.ts --headed
```

### **Step 2: Analyze Debug Output**
- Check console logs for debug information
- Verify API conversion success
- Note actual vs expected values

### **Step 3: Check WordPress Debug Log**
```bash
tail -f debug.log | grep -E "(text-transform|Text_Transform|create_atomic_string_value)"
```

### **Step 4: Inspect Atomic Widget Schema**
- Check if text-transform is supported in atomic widget style schema
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
- ❌ **Editor text-transform**: Expected `uppercase`, Actual `none`
- ❌ **Frontend text-transform**: Expected `uppercase`, Actual `none`

#### **Root Cause Analysis**:
- **Issue Location**: [Mapper/Widget/Schema/Other]
- **Specific Problem**: 
- **Proposed Solution**: 

## 🎯 **Success Criteria**

### **When Tests Should Pass**:
1. **Atomic Widget Support**: Text-transform added to atomic widget schema
2. **Property Application**: Atomic widgets apply text-transform to DOM
3. **Style Rendering**: Computed styles match expected values
4. **Enum Validation**: All valid text-transform values work correctly

### **Current Status**: 
- **Expected**: ❌ **FAILING** (this is correct for now)
- **Goal**: ✅ **PASSING** (after atomic widget fixes)

## 🔍 **Special Considerations**

### **Text-Transform Enum Values**:
- **`none`**: Default value, might already work
- **`uppercase`**: Convert text to uppercase
- **`lowercase`**: Convert text to lowercase  
- **`capitalize`**: Capitalize first letter of each word

### **Expected Behavior**:
- **Visual Change**: Text appearance should change based on transform
- **DOM Property**: `getComputedStyle().textTransform` should return expected value
- **CSS Rule**: Generated CSS should contain `text-transform: [value]`

## 📋 **Next Steps**

1. **Run Test**: Execute and document failures
2. **Analyze Results**: Identify specific failure points
3. **Investigate Schema**: Check atomic widget style support
4. **Compare with Letter-Spacing**: See if both properties have same root cause
5. **Propose Fix**: Determine if issue is in mapper, widget, or schema
6. **Implement Solution**: Apply fixes based on root cause analysis

---

**Note**: This test is designed to fail initially. The failures will help us understand exactly where the text-transform property is being lost in the conversion pipeline.
