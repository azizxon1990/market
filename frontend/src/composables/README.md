# useFormatting Composable

A Vue composable for consistent number and currency formatting across the application.

## Usage

```typescript
import { useFormatting } from '~/composables/useFormatting'

// In setup function
const { formatNumber, formatCurrency, formatQuantity, formatPercentage, formatCompact } = useFormatting()

// Use the formatting functions
const price = 1250.50
const formattedPrice = formatCurrency(price) // "1,250.50 UZS" or "1 250,50 сўм"
```

## Available Functions

### `formatNumber(value: number): string`
Formats numbers with thousand separators and 2 decimal places.

**Examples:**
- `formatNumber(1234.56)` → `"1,234.56"`
- `formatNumber(1000000)` → `"1,000,000.00"`

### `formatCurrency(value: number): string`
Formats numbers as UZS currency using Uzbek locale.

**Examples:**
- `formatCurrency(1250.50)` → `"1,250.50 UZS"` (or localized equivalent)
- `formatCurrency(1000000)` → `"1,000,000.00 UZS"`

### `formatQuantity(value: number): string`
Formats whole numbers (quantities) with thousand separators.

**Examples:**
- `formatQuantity(1500)` → `"1,500"`
- `formatQuantity(1000000)` → `"1,000,000"`

### `formatPercentage(value: number): string`
Formats numbers as percentages (0.25 = 25%).

**Examples:**
- `formatPercentage(0.25)` → `"25.0%"`
- `formatPercentage(0.1234)` → `"12.34%"`

### `formatCompact(value: number): string`
Formats large numbers in compact notation.

**Examples:**
- `formatCompact(1500)` → `"1.5K"`
- `formatCompact(1000000)` → `"1M"`

## Components Using This Composable

- `selection-products.vue` - Product selection drawer with pricing
- Add your components here when you implement the composable

## Customization

To modify the formatting behavior:

1. **Change Currency**: Update the `currency` property in `formatCurrency()`
2. **Change Locale**: Update locale strings (`'uz-UZ'`, `'en-US'`) to match your region
3. **Decimal Places**: Modify `minimumFractionDigits` and `maximumFractionDigits`

## Future Enhancements

- Add support for multiple currencies
- Add date/time formatting functions
- Add locale-specific formatting based on user preferences
