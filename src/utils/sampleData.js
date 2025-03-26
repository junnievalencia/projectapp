import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore'

/**
 * Initializes sample order data in Firestore if none exists
 * This ensures the dashboard has data to display
 */
export async function ensureSampleOrderData() {
  try {
    // Check if there are any orders first
    const ordersQuery = query(collection(db, 'orders'))
    const snapshot = await getCountFromServer(ordersQuery)
    const orderCount = snapshot.data().count
    
    // Only add sample data if no orders exist
    if (orderCount === 0) {
      const sampleOrders = [
        {
          customerName: 'John Doe',
          customerPhone: '09123456789',
          items: [
            { name: 'Fried Chicken', price: 120, quantity: 2 },
            { name: 'Rice', price: 25, quantity: 2 }
          ],
          status: 'pending',
          totalAmount: '290',
          paymentMethod: 'Cash',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Jane Smith',
          customerPhone: '09876543210',
          items: [
            { name: 'Adobo', price: 130, quantity: 1 },
            { name: 'Rice', price: 25, quantity: 1 },
            { name: 'Softdrink', price: 35, quantity: 1 }
          ],
          status: 'completed',
          totalAmount: '190',
          paymentMethod: 'GCash',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Mark Johnson',
          customerPhone: '09123459876',
          items: [
            { name: 'Pancit Canton', price: 150, quantity: 1 },
            { name: 'Softdrink', price: 35, quantity: 2 }
          ],
          status: 'completed',
          totalAmount: '220',
          paymentMethod: 'Maya',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Anna Garcia',
          customerPhone: '09567891234',
          items: [
            { name: 'Sinigang', price: 160, quantity: 1 },
            { name: 'Rice', price: 25, quantity: 2 }
          ],
          status: 'dispatched',
          totalAmount: '210',
          paymentMethod: 'Cash',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Robert Tan',
          customerPhone: '09918273645',
          items: [
            { name: 'Beef Tapa', price: 140, quantity: 1 },
            { name: 'Rice', price: 25, quantity: 1 },
            { name: 'Softdrink', price: 35, quantity: 1 }
          ],
          status: 'dispatched',
          totalAmount: '200',
          paymentMethod: 'GCash',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Sarah Lee',
          customerPhone: '09223344556',
          items: [
            { name: 'Sisig', price: 130, quantity: 1 },
            { name: 'Rice', price: 25, quantity: 1 }
          ],
          status: 'completed',
          totalAmount: '155',
          paymentMethod: 'Cash',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Michael Wang',
          customerPhone: '09887766554',
          items: [
            { name: 'Kare-Kare', price: 180, quantity: 1 },
            { name: 'Rice', price: 25, quantity: 2 }
          ],
          status: 'pending',
          totalAmount: '230',
          paymentMethod: 'Maya',
          createdAt: serverTimestamp()
        },
        {
          customerName: 'Emily Santos',
          customerPhone: '09554433221',
          items: [
            { name: 'Bulalo', price: 220, quantity: 1 },
            { name: 'Rice', price: 25, quantity: 3 }
          ],
          status: 'completed',
          totalAmount: '295',
          paymentMethod: 'GCash',
          createdAt: serverTimestamp()
        }
      ]
      
      // Add sample orders to Firestore
      const ordersRef = collection(db, 'orders')
      for (const order of sampleOrders) {
        await addDoc(ordersRef, order)
      }
      
      console.log('Sample order data added to Firestore')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error ensuring sample data:', error)
    return false
  }
}

/**
 * Initializes sample food items in Firestore if none exists
 */
export async function ensureSampleFoodItems() {
  try {
    // Check if there are any food items first
    const itemsQuery = query(collection(db, 'foodItems'))
    const snapshot = await getCountFromServer(itemsQuery)
    const itemCount = snapshot.data().count
    
    // Only add sample data if no food items exist
    if (itemCount === 0) {
      const sampleFoodItems = [
        {
          name: 'Fried Chicken',
          price: 120,
          description: 'Crispy fried chicken with special seasoning',
          categoryId: 'main',
          isAvailable: true,
          createdAt: serverTimestamp()
        },
        {
          name: 'Adobo',
          price: 130,
          description: 'Traditional Filipino dish with soy sauce and vinegar',
          categoryId: 'main',
          isAvailable: true,
          createdAt: serverTimestamp()
        },
        {
          name: 'Pancit Canton',
          price: 150,
          description: 'Stir-fried noodles with vegetables and meat',
          categoryId: 'main',
          isAvailable: true,
          createdAt: serverTimestamp()
        },
        {
          name: 'Sinigang',
          price: 160,
          description: 'Sour soup with vegetables and meat',
          categoryId: 'main',
          isAvailable: true,
          createdAt: serverTimestamp()
        },
        {
          name: 'Rice',
          price: 25,
          description: 'Steamed white rice',
          categoryId: 'side',
          isAvailable: true,
          createdAt: serverTimestamp()
        },
        {
          name: 'Softdrink',
          price: 35,
          description: 'Refreshing carbonated beverage',
          categoryId: 'beverage',
          isAvailable: true,
          createdAt: serverTimestamp()
        }
      ]
      
      // Add sample food items to Firestore
      const itemsRef = collection(db, 'foodItems')
      for (const item of sampleFoodItems) {
        await addDoc(itemsRef, item)
      }
      
      console.log('Sample food items added to Firestore')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error ensuring sample food items:', error)
    return false
  }
} 