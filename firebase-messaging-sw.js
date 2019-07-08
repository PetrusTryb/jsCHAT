importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
firebase.initializeApp({
  'messagingSenderId': '684850370153'
});
firebase.messaging().onMessage((payload) => {
  console.log('Message received. ', payload);
  // ...
});