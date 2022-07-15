import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyCBeR3F4EVJ92j2a_fpxbrHWbO93lWzf-s",
  authDomain: "brochss-74f75.firebaseapp.com",
  projectId: "brochss-74f75",
  storageBucket: "brochss-74f75.appspot.com",
  messagingSenderId: "51526564441",
  appId: "1:51526564441:web:7c643ae5913269e5f1cf48"
  };

const app = firebase.initializeApp(firebaseConfig);

const db = app.firestore();
const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

export { db, provider, auth };