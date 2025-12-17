<script setup>
import { ref, watch, computed } from 'vue'
import { useSuppliersStore } from '@/stores/suppliers'

const props = defineProps({ 
    isOpen: Boolean,
    supplier: Object 
})
const emit = defineEmits(['close'])

const store = useSuppliersStore()
const isSaving = ref(false)
const confirmDeactivate = ref(false)
const errors = ref({})

const form = ref({})

const isActive = computed(() => {
    return form.value.Status && form.value.Status.toLowerCase() === 'active'
})

const handlePhoneInput = (event) => {
    let val = event.target.value.replace(/[^0-9+\s-]/g, '')
    if (val.length > 18) val = val.slice(0, 19)
    form.value.Phone = val
    if (errors.value.Phone) delete errors.value.Phone
}

const handleIBANInput = (event) => {
    let val = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (val.length > 29) val = val.slice(0, 29)
    form.value.IBAN = val
    if (errors.value.IBAN) delete errors.value.IBAN
}

const validate = () => {
    errors.value = {}
    let isValid = true

    if (form.value.Phone.length < 9) {
        errors.value.Phone = 'Invalid phone format'
        isValid = false
    }
    if (form.value.IBAN.length !== 29) {
        errors.value.IBAN = 'IBAN must be 29 characters'
        isValid = false
    }
    if (!form.value.Name) {
        errors.value.Name = 'Required'
        isValid = false
    }
    return isValid
}

watch(() => props.isOpen, (isOpen) => {
    if (isOpen && props.supplier) {
        form.value = { ...props.supplier }
        
        if (!form.value.IBAN) form.value.IBAN = 'UA'
        
        confirmDeactivate.value = false
        errors.value = {}
    }
})

const save = async () => {
    if (!validate()) return

    if (!form.value.SupplierID) return
    isSaving.value = true
    const success = await store.updateSupplier(form.value.SupplierID, form.value)
    isSaving.value = false
    if (success) emit('close')
}

const toggleStatus = async () => {
    if (isActive.value && !confirmDeactivate.value) {
        confirmDeactivate.value = true
        return
    }

    const newStatus = isActive.value ? 'Inactive' : 'Active'
    
    const success = await store.toggleSupplierStatus(form.value.SupplierID, newStatus)
    
    if (success) {
        form.value.Status = newStatus 
        confirmDeactivate.value = false
        emit('close')
    }
}
</script>

<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card">
        <header>
            <h2>Edit Supplier</h2>
            <button class="close-btn" @click="emit('close')">✕</button>
        </header>

        <form @submit.prevent="save" class="modal-body custom-scroll">
            <div class="form-row">
                <div class="form-group">
                    <label>Company Name</label>
                    <input v-model="form.Name" required type="text" :class="{ 'invalid': errors.Name }">
                </div>
                <div class="form-group">
                    <label>Code (EDRPOU)</label>
                    <input v-model="form.Code" type="text">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Phone (max 19)</label>
                    <input 
                        :value="form.Phone" 
                        @input="handlePhoneInput"
                        type="text"
                        :class="{ 'invalid': errors.Phone }"
                    >
                    <span v-if="errors.Phone" class="error-msg">{{ errors.Phone }}</span>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="form.Email" type="email">
                </div>
            </div>

            <div class="form-group">
                <label>Address</label>
                <input v-model="form.Address" type="text">
            </div>

            <div class="form-group">
                <label>IBAN (max 29)</label>
                <input 
                    :value="form.IBAN" 
                    @input="handleIBANInput"
                    type="text"
                    :class="{ 'invalid': errors.IBAN }"
                >
                <span v-if="errors.IBAN" class="error-msg">{{ errors.IBAN }}</span>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Payment Terms</label>
                    <select v-model="form.PaymentTerms">
                        <option value="Prepaid">Prepaid</option>
                        <option value="Postpaid">Postpaid</option> 
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>SLA (Days)</label>
                    <input v-model="form.SLA_Days" type="number" min="0">
                </div>
            </div>
        </form>

        <footer>
            <button 
                type="button"
                :class="[
                    'btn-status', 
                    isActive ? (confirmDeactivate ? 'btn-confirm' : 'btn-deactivate') : 'btn-activate'
                ]" 
                @click="toggleStatus"
                @mouseleave="confirmDeactivate = false" 
            >
                <template v-if="isActive">
                    {{ confirmDeactivate ? 'Confirm Deactivation' : 'Deactivate' }}
                </template>
                <template v-else>
                    Activate Supplier
                </template>
            </button>
            
            <div class="actions">
                <button class="btn-cancel" @click="emit('close')">Cancel</button>
                <button class="btn-save" @click="save" :disabled="isSaving">
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
            </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; 
  inset: 0; 
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(2px); 
  display: grid; 
  place-items: center; 
  z-index: 100; 
  padding: 20px;
}
.modal-card {
  background: #fff; 
  width: 100%; 
  max-width: 600px; 
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); 
  display: flex; 
  flex-direction: column;
  overflow: hidden; 
  max-height: 90vh;
}

header {
    padding: 20px; 
    border-bottom: 1px solid #E5E7EB; 
    display: flex;
    justify-content: space-between; 
    align-items: center; 
    background: #F9FAFB;
}

header h2 { 
    margin: 0; 
    font-family: Montserrat; 
    font-size: 18px; 
    font-weight: 600; 
    color: #111827; 
}

.close-btn { 
    background: none; 
    border: none; 
    font-size: 20px; 
    cursor: pointer; 
    color: #6B7280; 
}

.modal-body { 
    padding: 20px; 
    overflow-y: auto; 
    display: flex; 
    flex-direction: column; 
    gap: 15px; 
}

.form-row { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 15px; 
}

.form-group { 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
}

label { 
    font-family: Montserrat; 
    font-size: 13px; 
    font-weight: 600; 
    color: #374151; 
}

input, select {
    padding: 10px; 
    border: 1px solid #D1D5DB; 
    border-radius: 8px;
    font-family: Montserrat; 
    font-size: 14px; 
    outline: none; 
    transition: border 0.2s;
}
input:focus, select:focus { 
    border-color: #3B82F6; 
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
}

.invalid {
    border-color: #EF4444 !important;
    background: #FEF2F2;
}
.error-msg {
    color: #EF4444;
    font-size: 11px;
    font-family: Montserrat;
    margin-top: -2px;
}

footer {
    padding: 15px 20px; 
    border-top: 1px solid #E5E7EB; 
    display: flex;
    justify-content: space-between; 
    align-items: center; 
    background: #F9FAFB;
}
.actions { 
    display: flex; 
    gap: 10px; 
}

.btn-cancel {
    background: #fff; 
    border: 1px solid #D1D5DB; 
    padding: 8px 16px; 
    border-radius: 6px;
    font-family: Montserrat; 
    font-weight: 600; 
    cursor: pointer;
}
.btn-save {
    background: #3B82F6; 
    color: white; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 6px;
    font-family: Montserrat; 
    font-weight: 600; 
    cursor: pointer;
}

.btn-save:hover { 
    background: #2563EB; 
}

.btn-status {
    padding: 8px 16px; 
    border-radius: 6px; 
    font-family: Montserrat; 
    font-weight: 600;
    cursor: pointer; 
    transition: all 0.2s; 
    border: 1px solid transparent; 
    min-width: 120px;
}

.btn-deactivate { 
    background: #FEF2F2; 
    color: #DC2626; 
    border-color: #FECACA; 
}

.btn-deactivate:hover { 
    background: #FEE2E2; 
}

.btn-confirm { 
    background: #DC2626; 
    color: white; 
    border-color: #DC2626; 
}

.btn-activate { 
    background: #10B981; 
    color: white; 
    border-color: #059669; 
}

.btn-activate:hover { 
    background: #059669; 
}

.fade-enter-active, .fade-leave-active { 
    transition: opacity 0.2s; 
}

.fade-enter-from, .fade-leave-to { 
    opacity: 0; 
}
</style>