import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCKbwBqxbyFHZ0ajq86F7_eT8XA1H9f7FA",
  authDomain: "imageupload-265af.firebaseapp.com",
  projectId: "imageupload-265af",
  storageBucket: "imageupload-265af.appspot.com",
  messagingSenderId: "435411696239",
  appId: "1:435411696239:web:d2f79396af84a2aa40eb9a",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
