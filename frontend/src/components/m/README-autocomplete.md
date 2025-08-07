# MAutocomplete Component

A comprehensive Vue 3 autocomplete component with TypeScript support, built with modern features and accessibility in mind.

## Features

- ✅ Single and multiple selection
- ✅ Filterable search
- ✅ Custom value creation
- ✅ Loading states
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ Icons support (Remix Icons via @iconify/vue)
- ✅ Size variants (sm, md, lg)
- ✅ Dark mode support
- ✅ Fully accessible
- ✅ TypeScript support
- ✅ Clearable selection
- ✅ Disabled/readonly states

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | Label text for the input |
| `modelValue` | `any` | - | The selected value(s) |
| `options` | `Option[]` | `[]` | Array of options to display |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `placeholder` | `string` | `''` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the input |
| `readonly` | `boolean` | `false` | Make input readonly |
| `loading` | `boolean` | `false` | Show loading state |
| `clearable` | `boolean` | `true` | Show clear button |
| `filterable` | `boolean` | `true` | Enable search filtering |
| `multiple` | `boolean` | `false` | Allow multiple selections |
| `prependIcon` | `string` | `''` | Icon before input |
| `appendIcon` | `string` | `''` | Icon after input |
| `noDataText` | `string` | `'No options found'` | Text when no options |
| `loadingText` | `string` | `'Loading...'` | Text during loading |
| `maxDisplayItems` | `number` | `10` | Max options to show |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search |
| `allowCustomValue` | `boolean` | `false` | Allow creating custom values |
| `customValueText` | `string` | `'Create: "{query}"'` | Custom value option text |

## Option Interface

```typescript
interface Option {
  id: string | number
  label: string
  value: any
  disabled?: boolean
  [key: string]: any
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Emitted when selection changes |
| `search` | `string` | Emitted when search query changes |
| `select` | `Option` | Emitted when option is selected |
| `create` | `string` | Emitted when custom value is created |
| `clear` | - | Emitted when selection is cleared |
| `focus` | `FocusEvent` | Emitted when input gains focus |
| `blur` | `FocusEvent` | Emitted when input loses focus |

## Usage Examples

### Basic Single Selection

```vue
<template>
  <MAutocomplete
    v-model="selectedValue"
    label="Choose an option"
    :options="options"
    placeholder="Select an option..."
    @select="handleSelect"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedValue = ref('')
const options = ref([
  { id: 1, label: 'Option 1', value: 'option1' },
  { id: 2, label: 'Option 2', value: 'option2' },
  { id: 3, label: 'Option 3', value: 'option3' },
])

function handleSelect(option) {
  console.log('Selected:', option)
}
</script>
```

### Multiple Selection

```vue
<template>
  <MAutocomplete
    v-model="selectedValues"
    label="Choose multiple options"
    :options="options"
    placeholder="Select options..."
    multiple
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedValues = ref([])
const options = ref([
  { id: 1, label: 'Option 1', value: 'option1' },
  { id: 2, label: 'Option 2', value: 'option2' },
  { id: 3, label: 'Option 3', value: 'option3' },
])
</script>
```

### With Custom Values

```vue
<template>
  <MAutocomplete
    v-model="selectedValue"
    label="Add or select"
    :options="options"
    placeholder="Type to search or create..."
    allow-custom-value
    custom-value-text="Add '{query}' as new option"
    @create="handleCreate"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedValue = ref('')
const options = ref([
  { id: 1, label: 'Existing Option', value: 'existing' },
])

function handleCreate(value) {
  const newOption = {
    id: Date.now(),
    label: value,
    value: value.toLowerCase(),
  }
  options.value.push(newOption)
  selectedValue.value = newOption.value
}
</script>
```

### With Icons and Loading

```vue
<template>
  <MAutocomplete
    v-model="selectedValue"
    label="Search with loading"
    :options="options"
    :loading="loading"
    prepend-icon="ri-search-line"
    loading-text="Searching..."
    @search="handleSearch"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedValue = ref('')
const options = ref([])
const loading = ref(false)

async function handleSearch(query) {
  loading.value = true
  try {
    // Simulate API call
    const results = await searchAPI(query)
    options.value = results
  } finally {
    loading.value = false
  }
}
</script>
```

## Styling

The component uses Tailwind CSS/UnoCSS classes and supports dark mode out of the box. All styling is contained within the component and follows the existing design system patterns.

## Keyboard Navigation

- **↑/↓ Arrow Keys**: Navigate through options
- **Enter**: Select highlighted option or open dropdown
- **Escape**: Close dropdown
- **Tab**: Close dropdown and move to next focusable element

## Accessibility

- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- High contrast support
- Screen reader announcements for state changes

## Dependencies

- `@iconify/vue` - For icon rendering
- Vue 3 with Composition API
- TypeScript support
