<script setup>
import { onMounted, ref, computed } from 'vue'
import { useEmployeesStore } from '@/stores/employees'
import PageToolbar from '@/components/PageToolbar.vue'

const store = useEmployeesStore()
const searchQuery = ref('')
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedEmployee = ref(null)
const isSaving = ref(false)
const errorMessage = ref('')

const addForm = ref({
  login: '',
  password: '',
  fullName: '',
  role: 'manager',
})

const editForm = ref({
  fullName: '',
  role: '',
  status: '',
})

onMounted(() => {
  store.fetchEmployees()
})

const filteredEmployees = computed(() => {
  let result = [...store.employees]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((employee) => {
      const nameMatch = employee.FullName.toLowerCase().includes(query)
      const loginMatch = employee.Login.toLowerCase().includes(query)
      const roleMatch = employee.Role.toLowerCase().includes(query)
      return nameMatch || loginMatch || roleMatch
    })
  }

  return result.sort((a, b) => b.EmployeeID - a.EmployeeID)
})

const openEdit = (employee) => {
  selectedEmployee.value = employee
  editForm.value = {
    fullName: employee.FullName,
    role: employee.Role,
    status: employee.Status,
  }
  errorMessage.value = ''
  isEditModalOpen.value = true
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  resetAddForm()
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedEmployee.value = null
  resetEditForm()
}

const resetAddForm = () => {
  addForm.value = {
    login: '',
    password: '',
    fullName: '',
    role: 'manager',
  }
  errorMessage.value = ''
}

const resetEditForm = () => {
  editForm.value = {
    fullName: '',
    role: '',
    status: '',
  }
  errorMessage.value = ''
}

const submitAdd = async () => {
  isSaving.value = true
  errorMessage.value = ''

  try {
    await store.createEmployee(addForm.value)
    await store.fetchEmployees()
    closeAddModal()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSaving.value = false
  }
}

const submitEdit = async () => {
  if (!selectedEmployee.value) return

  isSaving.value = true
  errorMessage.value = ''

  try {
    await store.updateEmployee(selectedEmployee.value.EmployeeID, editForm.value)
    await store.fetchEmployees()
    closeEditModal()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSaving.value = false
  }
}

const deleteEmployee = async (employee) => {
  if (!confirm(`Are you sure you want to delete employee "${employee.FullName}"?`)) {
    return
  }

  try {
    await store.deleteEmployee(employee.EmployeeID)
  } catch (error) {
    alert(error.message)
  }
}

const getStatusBadge = (status) => {
  const badges = {
    active: { label: 'Active', class: 'status-active' },
    inactive: { label: 'Inactive', class: 'status-inactive' },
  }
  return badges[status] || { label: status, class: '' }
}

const getRoleBadge = (role) => {
  const badges = {
    admin: { label: 'Admin', class: 'role-admin' },
    manager: { label: 'Manager', class: 'role-manager' },
  }
  return badges[role] || { label: role, class: '' }
}
</script>

<template>
  <main>
    <PageToolbar>
      <template #left>
        <h1 class="page-title">Employees</h1>
      </template>
      <template #center>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, login or role..."
            class="search-input"
          />
        </div>
      </template>
      <template #right>
        <div class="toolbar-actions">
          <button class="primary-btn" @click="isAddModalOpen = true">+ Add Employee</button>
        </div>
      </template>
    </PageToolbar>

    <!-- Data Table -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Login</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="5" class="text-center">Loading...</td>
            </tr>
            <tr v-else-if="filteredEmployees.length === 0">
              <td colspan="5" class="text-center">
                <span v-if="searchQuery">No employees match your search.</span>
                <span v-else>No employees found</span>
              </td>
            </tr>
            <tr v-else v-for="employee in filteredEmployees" :key="employee.EmployeeID">
              <td class="employee-name">{{ employee.FullName }}</td>
              <td>{{ employee.Login }}</td>
              <td>
                <span :class="['badge', getRoleBadge(employee.Role).class]">
                  {{ getRoleBadge(employee.Role).label }}
                </span>
              </td>
              <td>
                <span :class="['badge', getStatusBadge(employee.Status).class]">
                  {{ getStatusBadge(employee.Status).label }}
                </span>
              </td>
              <td class="actions-wrapper">
                <div class="actions">
                  <button class="icon-btn" @click="openEdit(employee)" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.33301 14.6667L2.66634 10.6667L11.333 2.00004Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    class="icon-btn icon-btn-delete"
                    @click="deleteEmployee(employee)"
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 4H3.33333H14"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Add Employee Modal -->
  <transition name="fade">
    <div v-if="isAddModalOpen" class="modal-overlay" @click.self="closeAddModal">
      <form class="modal-card" @submit.prevent="submitAdd">
        <header class="modal-header">
          <h2>Add New Employee</h2>
          <button type="button" class="ghost-btn" @click="closeAddModal">✕</button>
        </header>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field">
              <span>Full Name <span class="required">*</span></span>
              <input
                v-model="addForm.fullName"
                type="text"
                placeholder="Enter full name"
                required
              />
            </label>
            <label class="field">
              <span>Login <span class="required">*</span></span>
              <input v-model="addForm.login" type="text" placeholder="Enter login" required />
            </label>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Password <span class="required">*</span></span>
              <input
                v-model="addForm.password"
                type="password"
                placeholder="Enter password"
                required
              />
            </label>
            <label class="field">
              <span>Role <span class="required">*</span></span>
              <select v-model="addForm.role" required>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <footer class="modal-footer">
          <button type="button" class="secondary-btn" @click="closeAddModal">Cancel</button>
          <button type="submit" class="primary-btn" :disabled="isSaving">
            {{ isSaving ? 'Creating...' : 'Add Employee' }}
          </button>
        </footer>
      </form>
    </div>
  </transition>

  <!-- Edit Employee Modal -->
  <transition name="fade">
    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="closeEditModal">
      <form class="modal-card" @submit.prevent="submitEdit">
        <header class="modal-header">
          <div class="header-titles">
            <p class="modal-subtitle">{{ selectedEmployee?.FullName }}</p>
            <h2>Edit Employee</h2>
          </div>
          <button type="button" class="ghost-btn" @click="closeEditModal">✕</button>
        </header>

        <div class="modal-body">
          <label class="field">
            <span>Full Name</span>
            <input v-model="editForm.fullName" type="text" placeholder="Enter full name" required />
          </label>

          <label class="field">
            <span>Role</span>
            <select v-model="editForm.role">
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label class="field">
            <span>Status</span>
            <select v-model="editForm.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <footer class="modal-footer">
          <button type="button" class="secondary-btn" @click="closeEditModal">Cancel</button>
          <button type="submit" class="primary-btn" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </footer>
      </form>
    </div>
  </transition>
</template>

<style scoped>
/* Page Styles */
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  flex: 1;
  min-width: 0;
}

.page-title {
  font-family: Montserrat, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Search */
.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  background: #fff;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.search-input::placeholder {
  color: #9ca3af;
}

/* Table */
.table-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.table-wrapper::-webkit-scrollbar {
  display: none;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Montserrat, sans-serif;
}

.data-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-align: left;
  padding: 14px 16px;
  white-space: nowrap;
  background: #f9fafb;
}

.data-table td {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  min-height: 58px;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.employee-name {
  font-weight: 600;
}

.text-center {
  text-align: center;
  color: #6b7280;
  padding: 32px;
}

/* Badge */
.badge {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

.status-active {
  background: #10b981;
  color: #ffffff;
}

.status-inactive {
  background: #6b7280;
  color: #ffffff;
}

.role-admin {
  background: #8b5cf6;
  color: #ffffff;
}

.role-manager {
  background: #3b82f6;
  color: #ffffff;
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: #2563eb;
}

.icon-btn-delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* Modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 50;
}

.modal-card {
  background: #ffffff;
  width: min(600px, 95vw);
  max-height: 90vh;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-header h2 {
  font-family: Montserrat, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-subtitle {
  font-family: Montserrat, sans-serif;
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.modal-body {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 15px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  color: #111827;
}

.field .required {
  color: #ef4444;
}

.field input,
.field select {
  font-family: Montserrat, sans-serif;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field input::placeholder {
  color: #9ca3af;
}

.error-text {
  font-family: Montserrat, sans-serif;
  color: #ef4444;
  font-size: 14px;
  margin: 0 20px 8px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary-btn {
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-btn:hover {
  background: #1d4ed8;
}

.primary-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.secondary-btn {
  background: #ffffff;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.ghost-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 18px;
  transition: background-color 0.2s ease;
}

.ghost-btn:hover {
  background: #f3f4f6;
}
</style>
