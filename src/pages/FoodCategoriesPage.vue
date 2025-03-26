<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <h5 class="q-mt-none q-mb-none">Food Categories</h5>
      <q-btn color="primary" label="Add Category" icon="add" @click="openAddDialog" />
    </div>

    <q-card>
      <q-card-section>
        <q-input
          v-model="filter"
          label="Search"
          dense
          outlined
          clearable
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="categories"
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
                <img :src="props.row.image || 'https://cdn.quasar.dev/img/mountains.jpg'" />
              </q-avatar>
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
                @click="editCategory(props.row)"
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
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ editedId ? 'Edit Category' : 'Add Category' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveCategory" ref="categoryForm">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="editedItem.name"
                  label="Category Name *"
                  outlined
                  :rules="[val => !!val || 'Name is required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="imageUrl"
                  label="Category Image URL"
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
          <q-btn flat label="Save" color="primary" @click="saveCategory" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">
            Are you sure you want to delete this category?
            <p class="text-caption q-mt-sm">
              Note: This will not delete the food items in this category.
            </p>
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteCategory" :loading="deleting" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore'

export default defineComponent({
  name: 'FoodCategoriesPage',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const categories = ref([])
    const filter = ref('')
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const imageUrl = ref('')
    const categoryForm = ref(null)

    const defaultItem = {
      name: '',
      description: '',
      image: ''
    }

    const editedItem = ref({ ...defaultItem })
    const editedId = ref(null)
    const categoryToDelete = ref(null)

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
      { name: 'description', label: 'Description', field: 'description', align: 'left' },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
    ]

    const fetchCategories = async () => {
      loading.value = true
      try {
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'))
        const querySnapshot = await getDocs(categoriesQuery)
        
        categories.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        pagination.value.rowsNumber = categories.value.length
      } catch (error) {
        console.error('Error fetching categories:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to load categories',
          icon: 'error'
        })
      } finally {
        loading.value = false
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

    const editCategory = (category) => {
      editedItem.value = { ...category }
      editedId.value = category.id
      imageUrl.value = category.image || ''
      dialog.value = true
    }

    const confirmDelete = (category) => {
      categoryToDelete.value = category
      deleteDialog.value = true
    }

    const deleteCategory = async () => {
      deleting.value = true
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'categories', categoryToDelete.value.id))
        
        // Update local data
        const index = categories.value.findIndex(cat => cat.id === categoryToDelete.value.id)
        if (index > -1) {
          categories.value.splice(index, 1)
        }
        
        $q.notify({
          color: 'positive',
          message: 'Category deleted successfully',
          icon: 'check'
        })
      } catch (error) {
        console.error('Error deleting category:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to delete category',
          icon: 'error'
        })
      } finally {
        deleting.value = false
        deleteDialog.value = false
        categoryToDelete.value = null
      }
    }

    const saveCategory = async () => {
      // Validate form
      if (!categoryForm.value.validate()) {
        return
      }
      
      saving.value = true
      try {
        const categoryData = {
          name: editedItem.value.name,
          description: editedItem.value.description || '',
          image: imageUrl.value || editedItem.value.image
        }
        
        if (editedId.value) {
          // Update existing category
          await updateDoc(doc(db, 'categories', editedId.value), categoryData)
          
          // Update local data
          const index = categories.value.findIndex(cat => cat.id === editedId.value)
          if (index > -1) {
            categories.value[index] = {
              ...categoryData,
              id: editedId.value
            }
          }
          
          $q.notify({
            color: 'positive',
            message: 'Category updated successfully',
            icon: 'check'
          })
        } else {
          // Add new category
          const docRef = await addDoc(collection(db, 'categories'), categoryData)
          
          // Update local data
          categories.value.push({
            ...categoryData,
            id: docRef.id
          })
          
          $q.notify({
            color: 'positive',
            message: 'Category added successfully',
            icon: 'check'
          })
        }
        
        dialog.value = false
      } catch (error) {
        console.error('Error saving category:', error)
        $q.notify({
          color: 'negative',
          message: 'Failed to save category',
          icon: 'error'
        })
      } finally {
        saving.value = false
      }
    }

    // Load sample data for demonstration purposes
    const loadSampleData = () => {
      categories.value = [
        {
          id: 'cat1',
          name: 'Burgers',
          description: 'Delicious burgers of all kinds',
          image: 'https://cdn.quasar.dev/img/chicken-burger.jpg'
        },
        {
          id: 'cat2',
          name: 'Pizza',
          description: 'Fresh and hot pizzas',
          image: 'https://cdn.quasar.dev/img/parallax1.jpg'
        },
        {
          id: 'cat3',
          name: 'Salads',
          description: 'Healthy and fresh salads',
          image: 'https://cdn.quasar.dev/img/mountains.jpg'
        },
        {
          id: 'cat4',
          name: 'Beverages',
          description: 'Refreshing drinks',
          image: 'https://cdn.quasar.dev/img/parallax2.jpg'
        },
        {
          id: 'cat5',
          name: 'Desserts',
          description: 'Sweet treats to finish your meal',
          image: 'https://cdn.quasar.dev/img/mountains.jpg'
        }
      ]
      
      pagination.value.rowsNumber = categories.value.length
    }

    onMounted(async () => {
      try {
        await fetchCategories()
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
      categories,
      filter,
      columns,
      pagination,
      dialog,
      deleteDialog,
      editedItem,
      editedId,
      imageUrl,
      categoryForm,
      onRequest,
      openAddDialog,
      editCategory,
      confirmDelete,
      deleteCategory,
      saveCategory
    }
  }
})
</script> 