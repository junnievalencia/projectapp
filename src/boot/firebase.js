import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBvBJNuaRiCOg3dwdNZswgDbWxxvTdoWJU",
  authDomain: "bufood-admin.firebaseapp.com",
  projectId: "bufood-admin",
  storageBucket: "bufood-admin.appspot.com",
  messagingSenderId: "709336809253",
  appId: "1:709336809253:web:9363429545372bfde0a4cc"
};

const app = initializeApp(firebaseConfig)
console.log('Firebase app initialized with config:', {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket
});

const auth = getAuth(app)
console.log('Firebase Auth initialized')

const db = getFirestore(app)
console.log('Firestore initialized')

const storage = getStorage(app)
console.log('Firebase Storage initialized with bucket:', storage.bucket);

export { auth, db, storage }

export default boot(({ app }) => {
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
  app.config.globalProperties.$storage = storage
}) 