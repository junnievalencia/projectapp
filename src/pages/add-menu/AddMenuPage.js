import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { db } from 'src/boot/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { cld, cloudinaryConfig } from 'src/boot/cloudinary'

export function useAddMenuPage() {
  const $q = useQuasar()
  const router = useRouter()
  
  // Category data
  const categories = ref([])
  const foodItems = ref([])
  const loading = ref(false)
  const uploading = ref(false)
  const search = ref('')
  
  // Category form
  const newCategory = reactive({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    imageFile: null
  })
  
  // Food item form
  const newFoodItem = reactive({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: null,
    imagePreview: null,
    imageFile: null,
    isAvailable: true
  })
  
  // Dialog controls
  const categoryDialog = ref(false)
  const foodItemDialog = ref(false)
  const selectedCategoryId = ref(null)
  
  // Filter categories based on search
  const filteredCategories = computed(() => {
    if (!search.value) return categories.value
    
    const searchLower = search.value.toLowerCase()
    return categories.value.filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower)
    )
  })
  
  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    try {
      if (!file) return '';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('cloud_name', cloudinaryConfig.cloudName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      console.log('Cloudinary upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };
  
  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      loading.value = true;
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      categories.value = categoriesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Category ${doc.id} data:`, data);
        // Ensure imageUrl is always a string
        if (!data.imageUrl || typeof data.imageUrl !== 'string') {
          console.log(`Category ${doc.id} has invalid imageUrl:`, data.imageUrl);
          data.imageUrl = '';
        }
        return {
          id: doc.id,
          ...data,
          foodItems: [] // Initialize foodItems array
        };
      });
      
      // Fetch food items for each category
      const foodItemsSnapshot = await getDocs(collection(db, 'foodItems'));
      const allFoodItems = foodItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Group food items by category
      for (const foodItem of allFoodItems) {
        const categoryIndex = categories.value.findIndex(c => c.id === foodItem.categoryId);
        if (categoryIndex !== -1) {
          categories.value[categoryIndex].foodItems.push(foodItem);
        }
      }
      
      console.log('Categories loaded with food items:', categories.value.length);
    } catch (error) {
      console.error('Error fetching categories:', error);
      $q.notify({
        color: 'negative',
        message: 'Error loading categories: ' + error.message,
        icon: 'error'
      });
    } finally {
      loading.value = false;
    }
  };
  
  const fetchFoodItems = async () => {
    try {
      loading.value = true;
      const foodItemsSnapshot = await getDocs(collection(db, 'foodItems'));
      foodItems.value = foodItemsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Food item ${doc.id} data:`, data);
        // Ensure imageUrl is always a string
        if (!data.imageUrl || typeof data.imageUrl !== 'string') {
          console.log(`Food item ${doc.id} has invalid imageUrl:`, data.imageUrl);
          data.imageUrl = '';
        }
        return {
          id: doc.id,
          ...data
        };
      });
      
      // Update the foodItems arrays in the categories
      if (categories.value.length > 0) {
        categories.value.forEach(category => {
          category.foodItems = foodItems.value.filter(item => item.categoryId === category.id);
        });
      }
      
      console.log('Food items loaded and assigned to categories:', foodItems.value.length);
    } catch (error) {
      console.error('Error fetching food items:', error);
      $q.notify({
        color: 'negative',
        message: 'Error loading food items: ' + error.message,
        icon: 'error'
      });
    } finally {
      loading.value = false;
    }
  };
  
  // Handle image selection for category
  const onCategoryImageSelected = (files) => {
    const file = files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Please select an image file (JPG, PNG)',
          icon: 'error'
        });
      }
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Image file size must be less than 5MB',
          icon: 'error'
        });
      }
      return;
    }
    
    newCategory.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      newCategory.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Handle image selection for food item
  const onFoodItemImageSelected = (files) => {
    const file = files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Please select an image file (JPG, PNG)',
          icon: 'error'
        });
      }
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Image file size must be less than 5MB',
          icon: 'error'
        });
      }
      return;
    }
    
    newFoodItem.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      newFoodItem.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  // Add a new category
  const addCategory = async () => {
    try {
      if (!newCategory.name) {
        $q.notify({
          color: 'negative',
          message: 'Category name is required',
          icon: 'warning'
        });
        return;
      }

      uploading.value = true;
      loading.value = true;
      let imageUrl = '';

      // Upload image if selected
      if (newCategory.imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(newCategory.imageFile);
          console.log('Category image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading category image:', uploadError);
          $q.notify({
            color: 'negative',
            message: 'Failed to upload image. Category will be added without an image.',
            icon: 'warning'
          });
          imageUrl = '';
        }
      }

      // Add category to Firestore
      const categoryRef = await addDoc(collection(db, 'categories'), {
        name: newCategory.name,
        description: newCategory.description || '',
        imageUrl: imageUrl,
        foodItems: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      $q.notify({
        color: 'positive',
        message: 'Category added successfully',
        icon: 'check_circle'
      });

      // Reset form
      newCategory.name = '';
      newCategory.description = '';
      newCategory.imagePreview = null;
      newCategory.imageFile = null;
      
      // Refresh categories list
      await fetchCategories();
      categoryDialog.value = false;
    } catch (error) {
      console.error('Error adding category:', error);
      $q.notify({
        color: 'negative',
        message: 'Error adding category: ' + error.message,
        icon: 'error'
      });
    } finally {
      uploading.value = false;
      loading.value = false;
    }
  };
  
  // Delete a category
  const deleteCategory = async (category) => {
    try {
      // Show confirmation dialog
      const confirmed = await new Promise((resolve) => {
        $q.notify({
          message: `Are you sure you want to delete category "${category.name}"? This will also delete all food items in this category.`,
          color: 'warning',
          position: 'center',
          timeout: 0,
          actions: [
            {
              label: 'Delete',
              color: 'negative',
              handler: () => resolve(true)
            },
            {
              label: 'Cancel',
              color: 'white',
              handler: () => resolve(false)
            }
          ]
        });
      });

      if (!confirmed) return;

      loading.value = true;
      
      // Delete food items in the category
      for (const foodItem of category.foodItems) {
        await deleteDoc(doc(db, 'foodItems', foodItem.id));
      }
      
      // Delete category doc
      await deleteDoc(doc(db, 'categories', category.id));
      
      // Remove from local state
      categories.value = categories.value.filter(c => c.id !== category.id);
      
      loading.value = false;
      $q.notify({
        color: 'positive',
        message: 'Category deleted successfully',
        icon: 'check'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      loading.value = false;
      $q.notify({
        color: 'negative',
        message: 'Failed to delete category: ' + error.message,
        icon: 'error'
      });
    }
  };
  
  // Open food item dialog for a specific category
  const openFoodItemDialog = (categoryId) => {
    selectedCategoryId.value = categoryId
    newFoodItem.categoryId = categoryId
    foodItemDialog.value = true
  }
  
  // Add a new food item
  const addFoodItem = async () => {
    try {
      if (!newFoodItem.name || !newFoodItem.categoryId) {
        $q.notify({
          color: 'negative',
          message: 'Food name and category are required',
          icon: 'warning'
        });
        return;
      }

      uploading.value = true;
      loading.value = true;
      let imageUrl = '';

      // Upload image if selected
      if (newFoodItem.imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(newFoodItem.imageFile);
          console.log('Food item image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading food item image:', uploadError);
          $q.notify({
            color: 'negative',
            message: 'Failed to upload image. Food item will be added without an image.',
            icon: 'warning'
          });
          imageUrl = '';
        }
      }

      // Add food item to Firestore
      const foodItemRef = await addDoc(collection(db, 'foodItems'), {
        name: newFoodItem.name,
        description: newFoodItem.description || '',
        price: parseFloat(newFoodItem.price) || 0,
        categoryId: newFoodItem.categoryId,
        imageUrl: imageUrl,
        isAvailable: newFoodItem.isAvailable !== false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update the category's foodItems array
      const categoryRef = doc(db, 'categories', newFoodItem.categoryId);
      const category = categories.value.find(c => c.id === newFoodItem.categoryId);
      await updateDoc(categoryRef, {
        foodItems: [...(category?.foodItems?.map(f => f.id) || []), foodItemRef.id]
      });

      $q.notify({
        color: 'positive',
        message: 'Food item added successfully',
        icon: 'check_circle'
      });

      // Reset form
      newFoodItem.name = '';
      newFoodItem.description = '';
      newFoodItem.price = 0;
      newFoodItem.categoryId = selectedCategoryId.value;
      newFoodItem.imagePreview = null;
      newFoodItem.imageFile = null;
      newFoodItem.isAvailable = true;
      
      // Refresh food items list
      await fetchCategories();
      foodItemDialog.value = false;
    } catch (error) {
      console.error('Error adding food item:', error);
      $q.notify({
        color: 'negative',
        message: 'Error adding food item: ' + error.message,
        icon: 'error'
      });
    } finally {
      uploading.value = false;
      loading.value = false;
    }
  };
  
  // Delete a food item
  const deleteFoodItem = async (categoryId, foodItem) => {
    try {
      // Show confirmation dialog
      const confirmed = await new Promise((resolve) => {
        $q.notify({
          message: `Are you sure you want to delete food item "${foodItem.name}"?`,
          color: 'warning',
          position: 'center',
          timeout: 0,
          actions: [
            {
              label: 'Delete',
              color: 'negative',
              handler: () => resolve(true)
            },
            {
              label: 'Cancel',
              color: 'white',
              handler: () => resolve(false)
            }
          ]
        });
      });

      if (!confirmed) return;

      loading.value = true;
      
      // Delete food item doc from Firestore
      await deleteDoc(doc(db, 'foodItems', foodItem.id));
      
      // Remove from local state
      const categoryIndex = categories.value.findIndex(c => c.id === categoryId);
      if (categoryIndex !== -1) {
        categories.value[categoryIndex].foodItems = categories.value[categoryIndex].foodItems.filter(
          f => f.id !== foodItem.id
        );
      }
      
      loading.value = false;
      $q.notify({
        color: 'positive',
        message: 'Food item deleted successfully',
        icon: 'check'
      });
    } catch (error) {
      console.error('Error deleting food item:', error);
      loading.value = false;
      $q.notify({
        color: 'negative',
        message: 'Failed to delete food item: ' + error.message,
        icon: 'error'
      });
    }
  };
  
  // Toggle food item availability
  const toggleFoodItemAvailability = async (categoryId, foodItem) => {
    try {
      $q.loading.show();
      
      // Update in Firestore
      await updateDoc(
        doc(db, 'foodItems', foodItem.id),
        { isAvailable: !foodItem.isAvailable }
      );
      
      // Update in local state
      const categoryIndex = categories.value.findIndex(c => c.id === categoryId);
      if (categoryIndex !== -1) {
        const foodItemIndex = categories.value[categoryIndex].foodItems.findIndex(f => f.id === foodItem.id);
        if (foodItemIndex !== -1) {
          categories.value[categoryIndex].foodItems[foodItemIndex].isAvailable = !foodItem.isAvailable;
        }
      }
      
      $q.loading.hide();
      $q.notify({
        color: 'positive',
        message: `Food item ${foodItem.isAvailable ? 'disabled' : 'enabled'} successfully`,
        icon: 'check'
      });
    } catch (error) {
      console.error('Error updating food item availability:', error);
      $q.notify({
        color: 'negative',
        message: 'Failed to update food item',
        icon: 'error'
      });
      $q.loading.hide();
    }
  };
  
  // Reset category form
  const resetCategoryForm = () => {
    newCategory.name = ''
    newCategory.description = ''
    newCategory.imagePreview = null
    newCategory.imageFile = null
  }
  
  // Reset food item form
  const resetFoodItemForm = () => {
    newFoodItem.name = ''
    newFoodItem.description = ''
    newFoodItem.price = 0
    newFoodItem.categoryId = selectedCategoryId.value
    newFoodItem.imagePreview = null
    newFoodItem.imageFile = null
    newFoodItem.isAvailable = true
  }
  
  // Handle image loading errors
  const handleImageError = (event, type, item) => {
    // Log the error for debugging
    console.error(`Failed to load ${type} image:`, event);
    if (item) {
      console.error(`Item details:`, item);
      console.error(`Image URL that failed:`, item.imageUrl);
    } else if (type === 'category') {
      console.error(`Category image URL that failed:`, this.category.imageUrl);
    }
    
    // Hide the broken image
    event.target.style.display = 'none';
    
    // Notify user
    $q.notify({
      color: 'negative',
      message: `Failed to load ${type} image. Using placeholder instead.`,
      icon: 'warning'
    });
  };
  
  // Navigation function to go back
  const goBack = () => {
    router.push('/dashboard')
  }
  
  // Refresh data
  const refreshData = () => {
    fetchCategories()
  }
  
  // Fetch data on component mount
  onMounted(() => {
    fetchCategories()
  })
  
  return {
    categories,
    foodItems,
    filteredCategories,
    loading,
    uploading,
    search,
    newCategory,
    newFoodItem,
    categoryDialog,
    foodItemDialog,
    selectedCategoryId,
    fetchCategories,
    fetchFoodItems,
    onCategoryImageSelected,
    onFoodItemImageSelected,
    addCategory,
    deleteCategory,
    openFoodItemDialog,
    addFoodItem,
    deleteFoodItem,
    toggleFoodItemAvailability,
    resetCategoryForm,
    resetFoodItemForm,
    goBack,
    handleImageError
  }
} 