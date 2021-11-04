// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyB5-JE7QVrWYNA7gzm1-OJh-6hjUqg3YHM",
	authDomain: "e-components-bb43a.firebaseapp.com",
	projectId: "e-components-bb43a",
	storageBucket: "e-components-bb43a.appspot.com",
	messagingSenderId: "100236721156",
	appId: "1:100236721156:web:90f981ea11af050d7a8951",
	measurementId: "G-D6QYQSV6NB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
