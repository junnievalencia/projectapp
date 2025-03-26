import { db } from 'boot/firebase'
import { 
  collection, 
  addDoc, 
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore'

const sampleOrders = [
  {
    orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerName: 'John Doe',
    customerPhone: '+639123456789',
    deliveryAddress: '123 Main St, Manila',
    items: [
      {
        id: 'item1',
        name: 'Classic Burger',
        price: 120,
        quantity: 2,
        notes: 'Extra cheese',
        subtotal: 240
      },
      {
        id: 'item2',
        name: 'French Fries',
        price: 60,
        quantity: 1,
        notes: 'Extra salt',
        subtotal: 60
      }
    ],
    totalAmount: 300,
    paymentMethod: 'Cash',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    rider: null,
    processingTime: null,
    vendorId: 'vendor1',
    vendorName: 'Burger House'
  },
  {
    orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerName: 'Jane Smith',
    customerPhone: '+639876543210',
    deliveryAddress: '456 Park Ave, Quezon City',
    items: [
      {
        id: 'item3',
        name: 'Spaghetti',
        price: 150,
        quantity: 1,
        notes: 'Extra sauce',
        subtotal: 150
      },
      {
        id: 'item4',
        name: 'Garlic Bread',
        price: 80,
        quantity: 2,
        notes: 'Extra garlic',
        subtotal: 160
      }
    ],
    totalAmount: 310,
    paymentMethod: 'GCash',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    rider: null,
    processingTime: null,
    vendorId: 'vendor2',
    vendorName: 'Pasta Palace'
  },
  {
    orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerName: 'Mike Johnson',
    customerPhone: '+639555555555',
    deliveryAddress: '789 Beach Rd, Pasay',
    items: [
      {
        id: 'item5',
        name: 'Pizza Margherita',
        price: 450,
        quantity: 1,
        notes: 'Extra cheese',
        subtotal: 450
      },
      {
        id: 'item6',
        name: 'Coca Cola',
        price: 40,
        quantity: 2,
        notes: 'Extra ice',
        subtotal: 80
      }
    ],
    totalAmount: 530,
    paymentMethod: 'Cash',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    rider: null,
    processingTime: null,
    vendorId: 'vendor3',
    vendorName: 'Pizza Paradise'
  },
  {
    orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerName: 'Sarah Wilson',
    customerPhone: '+639111111111',
    deliveryAddress: '321 Forest St, Makati',
    items: [
      {
        id: 'item7',
        name: 'Chicken Wings',
        price: 200,
        quantity: 1,
        notes: 'Extra sauce',
        subtotal: 200
      },
      {
        id: 'item8',
        name: 'Onion Rings',
        price: 100,
        quantity: 1,
        notes: 'Extra crispy',
        subtotal: 100
      }
    ],
    totalAmount: 300,
    paymentMethod: 'GCash',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    rider: null,
    processingTime: null,
    vendorId: 'vendor4',
    vendorName: 'Wing World'
  },
  {
    orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerName: 'David Brown',
    customerPhone: '+639222222222',
    deliveryAddress: '654 River Rd, Taguig',
    items: [
      {
        id: 'item9',
        name: 'Fish and Chips',
        price: 250,
        quantity: 1,
        notes: 'Extra tartar sauce',
        subtotal: 250
      },
      {
        id: 'item10',
        name: 'Milk Tea',
        price: 120,
        quantity: 1,
        notes: 'Extra pearls',
        subtotal: 120
      }
    ],
    totalAmount: 370,
    paymentMethod: 'Cash',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    rider: null,
    processingTime: null,
    vendorId: 'vendor5',
    vendorName: 'Seafood Shack'
  }
]

// Function to verify order was properly added to database
async function verifyOrderAdded(orderId) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      console.log('Order verified in database:', orderSnap.data().customerName);
      return true;
    } else {
      console.error('Order not found in database after adding:', orderId);
      return false;
    }
  } catch (error) {
    console.error('Error verifying order:', error);
    return false;
  }
}

export async function addSampleOrders() {
  try {
    const ordersCollection = collection(db, 'orders')
    const addedOrders = []
    
    for (const order of sampleOrders) {
      // Generate a new random order number for each order and refresh timestamps
      const orderWithRandomNumber = {
        ...order,
        orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      const docRef = await addDoc(ordersCollection, orderWithRandomNumber)
      console.log('Added order:', orderWithRandomNumber.customerName, 'with ID:', docRef.id)
      
      // Verify order was added
      const verified = await verifyOrderAdded(docRef.id);
      if (verified) {
        addedOrders.push(docRef.id);
      }
    }
    
    console.log('Successfully added all sample orders')
    return addedOrders
  } catch (error) {
    console.error('Error adding sample orders:', error)
    throw error
  }
} 