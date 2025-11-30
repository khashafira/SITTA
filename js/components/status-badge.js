Vue.component('status-badge', {
  props: ['qty','safety'],
  template: `
    <span>
      <span v-if="qty === 0" class="badge badge-empty">Out of stock</span>
      <span v-else-if="qty < safety" class="badge badge-warning">Low</span>
      <span v-else class="badge badge-safe">Safe</span>
    </span>
  `
});
