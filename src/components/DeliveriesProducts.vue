<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="deliveries-products">
    <div class="row head">
      <div>Product</div>
      <div>SKU</div>
      <div>Purchase Price</div>
      <div>Sale Price</div>
      <div>Quantity</div>
      <div>Total Purchase</div>
      <div>Total Sale</div>
    </div>
    <div class="rows">
      <div class="row" v-for="product in props.items" :key="product.SKU">
        <div>{{ product.ProductName }}</div>
        <div>{{ product.SKU }}</div>
        <div>{{ product.PurchasePrice }}₴</div>
        <div>{{ product.RetailPrice }}₴</div>
        <div>{{ Number(product.Quantity).toFixed(2) }} {{ product.Unit }}</div>
        <div>{{ (product.PurchasePrice * product.Quantity).toFixed(2) }}₴</div>
        <div>{{ (product.RetailPrice * product.Quantity).toFixed(2) }}₴</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deliveries-products {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 20px 0 20px;
  grid-column: 1 / 3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: center;
  text-align: center;
  font-family: Montserrat;
  font-size: 16px;
  font-weight: 500;
  color: #000;
}

.head {
  padding-left: 35px;
  padding-right: 35px;
  padding-top: 0;
  padding-bottom: 10px;
  flex-shrink: 0;
}
.head > * {
  font-weight: 600 !important;
}

.rows {
  overflow-y: auto;
  overflow-x: visible;
  display: grid;
  gap: 15px;
  padding: 10px 15px 15px;
  scrollbar-width: none;
}
.rows::-webkit-scrollbar {
  display: none;
}

.row:not(.head) {
  padding: 24px 20px;
  border: 3px solid transparent;
  outline: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 16px 3px rgba(0, 0, 0, 0.06);
  background: #fff;
  cursor: pointer;
}

.row div:first-child {
  text-align: left;
  min-width: 70px;
}

.row > * {
  font-family: Montserrat;
  font-size: 16px;
  line-height: 1.1;
  font-weight: 500;
  color: #000;
}
</style>