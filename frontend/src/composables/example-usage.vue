<!-- Example: How to use useFormatting composable in any Vue component -->

<script setup lang="ts">
import { useFormatting } from '~/composables/useFormatting'

// Get all formatting functions
const { formatNumber, formatCurrency, formatQuantity, formatPercentage, formatCompact } = useFormatting()

// Example data
const exampleData = {
  price: 1250.75,
  quantity: 1500,
  percentage: 0.15,
  largeNumber: 1500000
}
</script>

<template>
  <div class="space-y-4 p-6">
    <h2 class="text-xl font-bold">useFormatting Examples</h2>
    
    <!-- Currency formatting -->
    <div>
      <h3 class="font-semibold">Currency Formatting</h3>
      <p>Raw: {{ exampleData.price }}</p>
      <p>Formatted: {{ formatCurrency(exampleData.price) }}</p>
    </div>

    <!-- Number formatting -->
    <div>
      <h3 class="font-semibold">Number Formatting</h3>
      <p>Raw: {{ exampleData.price }}</p>
      <p>Formatted: {{ formatNumber(exampleData.price) }}</p>
    </div>

    <!-- Quantity formatting -->
    <div>
      <h3 class="font-semibold">Quantity Formatting</h3>
      <p>Raw: {{ exampleData.quantity }}</p>
      <p>Formatted: {{ formatQuantity(exampleData.quantity) }}</p>
    </div>

    <!-- Percentage formatting -->
    <div>
      <h3 class="font-semibold">Percentage Formatting</h3>
      <p>Raw: {{ exampleData.percentage }}</p>
      <p>Formatted: {{ formatPercentage(exampleData.percentage) }}</p>
    </div>

    <!-- Compact formatting -->
    <div>
      <h3 class="font-semibold">Compact Formatting</h3>
      <p>Raw: {{ exampleData.largeNumber }}</p>
      <p>Formatted: {{ formatCompact(exampleData.largeNumber) }}</p>
    </div>

    <!-- Table example with formatted values -->
    <div>
      <h3 class="font-semibold">Table Template Example</h3>
      <table class="border border-gray-300">
        <thead>
          <tr>
            <th class="border border-gray-300 p-2">Item</th>
            <th class="border border-gray-300 p-2">Price</th>
            <th class="border border-gray-300 p-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 p-2">Product 1</td>
            <td class="border border-gray-300 p-2">{{ formatCurrency(1250.75) }}</td>
            <td class="border border-gray-300 p-2">{{ formatQuantity(1500) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MDataTable template slot example -->
    <div>
      <h3 class="font-semibold">MDataTable Template Slot Example</h3>
      <code class="block bg-gray-100 p-4 text-sm">
        &lt;MDataTable :columns="columns" :data="data"&gt;
          &lt;template #price="{ row }"&gt;
            &lt;span class="font-medium"&gt;
              {{ '{{ formatCurrency(row.price) }}' }}
            &lt;/span&gt;
          &lt;/template&gt;
          
          &lt;template #quantity="{ row }"&gt;
            {{ '{{ formatQuantity(row.quantity) }}' }}
          &lt;/template&gt;
        &lt;/MDataTable&gt;
      </code>
    </div>
  </div>
</template>
