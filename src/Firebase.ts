import firebase from "firebase";

const firebaseConfig = {
    //Add your own config
  };

const app = firebase.initializeApp(firebaseConfig);

const db = app.firestore();
const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

export { db, provider, auth };