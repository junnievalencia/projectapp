<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-none">Food Items</h5>
      <q-btn color="primary" label="Add New Item" icon="add" @click="openAddDialog" />
    </div>

    <q-card>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="filter"
              label="Search"
              dense
              outlined
              clearable
              class="q-mr-sm"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 text-right">
            <q-select
              v-model="categoryFilter"
              :options="categoryOptions"
              label="Filter by Category"
              outlined
              dense
              clearable
              options-dense
              class="q-ml-sm"
              style="min-width: 200px"
            />
          </div>
        </div>

        <q-table
          :rows="filteredItems"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @request="onRequest"
          :filter="filter"
          binary-state-sort
        >
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-avatar size="50px">
                <img :src="props.row.image" />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              ${{ props.row.price.toFixed(2) }}
            </q-td>
          </template>

          <template v-slot:body-cell-isAvailable="props">
            <q-td :props="props">
              <q-badge :color="props.row.isAvailable ? 'positive' : 'negative'">
                {{ props.row.isAvailable ? 'Available' : 'Not Available' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
              <q-btn
                size="sm"
                flat
                round
                icon="edit"
                color="amber"
                @click="editItem(props.row)"
              />
              <q-btn
                size="sm"
                flat
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editedId ? 'Edit Food Item' : 'Add New Food Item' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveItem" ref="itemForm">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="editedItem.name"
                  label="Name *"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>

              <div class="col-12">
                <q-select
                  v-model="editedItem.categoryId"
                  :options="categoryOptions"
                  label="Category *"
                  outlined
                  :rules="[val => !!val || 'Category is required']"
                  emit-value
                  map-options
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="editedItem.price"
                  label="Price *"
                  outlined
                  type="number"
                  prefix="$"
                  min="0"
                  step="0.01"
                  :rules="[val => val !== null && val >= 0 || 'Price is required']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-toggle
                  v-model="editedItem.isAvailable"
                  label="Available"
                  color="primary"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="imageUrl"
                  label="Food Image URL"
                  outlined
                />
              </div>

              <div class="col-12" v-if="editedItem.image">
                <div class="text-caption q-mb-sm">Current Image:</div>
                <q-img
                  :src="editedItem.image"
                  style="max-width: 100%; max-height: 200px; object-fit: contain;"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="editedItem.description"
                  label="Description"
                  outlined
                  type="textarea"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveItem" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete this item?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteItem" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore'

export default defineComponent({
  name: 'FoodItemsPage',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const items = ref([])
    const categories = ref([])
    const filter = ref('')
    const categoryFilter = ref(null)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const imageUrl = ref('')
    const itemForm = ref(null)

    const defaultItem = {
      name: '',
      categoryId: null,
      price: 0,
      description: '',
      image: '',
      isAvailable: true
    }

    const editedItem = ref({ ...defaultItem })
    const editedId = ref(null)
    const itemToDelete = ref(null)

    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })

    const columns = [
      { name: 'image', label: 'Image', field: 'image', align: 'center' },
      { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
      { name: 'category', label: 'Category', field: 'categoryName', align: 'left', sortable: true },
      { name: 'price', label: 'Price', field: 'price', align: 'right', sortable: true },
      { name: 'isAvailable', label: 'Status', field: 'isAvailable', align: 'center' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const categoryOptions = computed(() => {
      return categories.value.map(category => ({
        label: category.name,
        value: category.id
      }))
    })

    const filteredItems = computed(() => {
      if (!categoryFilter.value) return items.value
      return items.value.filter(item => item.categoryId === categoryFilter.value.value)
    })

    const fetchItems = async () => {
      loading.value = true
      try {
        const itemsQuery = query(collection(db, 'foodItems'), orderBy('name'))
        const querySnapshot = await getDocs(itemsQuery)
        
        items.value = querySnapshot.docs.map(doc => {
          const data = doc.data()
          const category = categories.value.find(c => c.id === data.categoryId)
          return {
            id: doc.id,
            ...data,
            categoryName: category ? category.name : 'Unknown'
          }
        })
        
        pagination.value.rowsNumber = items.value.length
      } catch (error) {
        console.error('Error fetching items:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to load food items',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'))
        const querySnapshot = await getDocs(categoriesQuery)
        
        categories.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching categories:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to load categories',
          icon: 'error'
        })
      }
    }

    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      pagination.value = { 
        ...pagination.value, 
        page, 
        rowsPerPage, 
        sortBy, 
        descending 
      }
    }

    const openAddDialog = () => {
      editedItem.value = { ...defaultItem }
      editedId.value = null
      imageUrl.value = ''
      dialog.value = true
    }

    const editItem = (item) => {
      editedItem.value = { ...item }
      editedId.value = item.id
      imageUrl.value = item.image || ''
      dialog.value = true
    }

    const confirmDelete = (item) => {
      itemToDelete.value = item
      deleteDialog.value = true
    }

    const deleteItem = async () => {
      deleting.value = true
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'foodItems', itemToDelete.value.id))
        
        // Update local data
        const index = items.value.findIndex(item => item.id === itemToDelete.value.id)
        if (index > -1) {
          items.value.splice(index, 1)
        }
        
        $q.notify({
          color: 'positive',
          message: 'Item deleted successfully',
          icon: 'check'
        })
      } catch (error) {
        console.error('Error deleting item:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to delete item',
          icon: 'error'
        })
      } finally {
        deleting.value = false
        deleteDialog.value = false
        itemToDelete.value = null
      }
    }

    const saveItem = async () => {
      // Validate form
      if (!itemForm.value.validate()) {
        return
      }
      
      saving.value = true
      try {
        // Use the image URL directly instead of uploading
        const itemData = {
          name: editedItem.value.name,
          categoryId: editedItem.value.categoryId,
          price: Number(editedItem.value.price),
          description: editedItem.value.description || '',
          image: imageUrl.value || editedItem.value.image, // Use the entered URL or keep existing
          isAvailable: editedItem.value.isAvailable
        }
        
        if (editedId.value) {
          // Update existing item
          await updateDoc(doc(db, 'foodItems', editedId.value), itemData)
          
          // Update local data
          const index = items.value.findIndex(item => item.id === editedId.value)
          if (index > -1) {
            const category = categories.value.find(c => c.id === itemData.categoryId)
            items.value[index] = {
              ...itemData,
              id: editedId.value,
              categoryName: category ? category.name : 'Unknown'
            }
          }
          
          $q.notify({
            color: 'positive',
            message: 'Item updated successfully',
            icon: 'check'
          })
        } else {
          // Add new item
          const docRef = await addDoc(collection(db, 'foodItems'), itemData)
          
          // Update local data
          const category = categories.value.find(c => c.id === itemData.categoryId)
          items.value.push({
            ...itemData,
            id: docRef.id,
            categoryName: category ? category.name : 'Unknown'
          })
          
          $q.notify({
            color: 'positive',
            message: 'Item added successfully',
            icon: 'check'
          })
        }
        
        dialog.value = false
      } catch (error) {
        console.error('Error saving item:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to save item',
          icon: 'error'
        })
      } finally {
        saving.value = false
      }
    }

    // Load sample data for demonstration purposes
    const loadSampleData = () => {
      categories.value = [
        { id: 'cat1', name: 'Burgers' },
        { id: 'cat2', name: 'Pizza' },
        { id: 'cat3', name: 'Salads' },
        { id: 'cat4', name: 'Beverages' },
        { id: 'cat5', name: 'Desserts' }
      ]
      
      items.value = [
        {
          id: '1',
          name: 'Classic Cheeseburger',
          categoryId: 'cat1',
          categoryName: 'Burgers',
          price: 8.99,
          description: 'Juicy beef patty with melted cheese, lettuce, tomato, and special sauce.',
          image: 'https://cdn.quasar.dev/img/chicken-burger.jpg',
          isAvailable: true
        },
        {
          id: '2',
          name: 'Pepperoni Pizza',
          categoryId: 'cat2',
          categoryName: 'Pizza',
          price: 12.99,
          description: 'Classic pepperoni pizza with tomato sauce and mozzarella cheese.',
          image: 'https://cdn.quasar.dev/img/parallax1.jpg',
          isAvailable: true
        },
        {
          id: '3',
          name: 'Caesar Salad',
          categoryId: 'cat3',
          categoryName: 'Salads',
          price: 7.99,
          description: 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing.',
          image: 'https://cdn.quasar.dev/img/mountains.jpg',
          isAvailable: true
        },
        {
          id: '4',
          name: 'Chocolate Milkshake',
          categoryId: 'cat4',
          categoryName: 'Beverages',
          price: 4.99,
          description: 'Rich and creamy chocolate milkshake topped with whipped cream.',
          image: 'https://cdn.quasar.dev/img/parallax2.jpg',
          isAvailable: true
        },
        {
          id: '5',
          name: 'Ice Cream Sundae',
          categoryId: 'cat5',
          categoryName: 'Desserts',
          price: 5.99,
          description: 'Vanilla ice cream with chocolate sauce, whipped cream, and a cherry on top.',
          image: 'https://cdn.quasar.dev/img/mountains.jpg',
          isAvailable: false
        }
      ]
      
      pagination.value.rowsNumber = items.value.length
    }

    onMounted(async () => {
      try {
        await fetchCategories()
        await fetchItems()
      } catch (error) {
        console.error('Error initializing page:', error)
        // Fall back to sample data if database is not configured
        loadSampleData()
      }
    })

    return {
      loading,
      saving,
      deleting,
      items,
      filter,
      categoryFilter,
      filteredItems,
      columns,
      pagination,
      dialog,
      deleteDialog,
      editedItem,
      editedId,
      imageUrl,
      itemForm,
      categoryOptions,
      onRequest,
      openAddDialog,
      editItem,
      confirmDelete,
      deleteItem,
      saveItem
    }
  }
})
</script> 