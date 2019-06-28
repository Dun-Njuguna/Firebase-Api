const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const app = express(); 

var firebaseConfig = {
    apiKey: "AIzaSyDIkVg9yIYTGT_75sOCzmW4Z1RxOj4xQJ8",
    authDomain: "react1-4ad5b.firebaseapp.com",
    databaseURL: "https://react1-4ad5b.firebaseio.com",
    projectId: "react1-4ad5b",
    storageBucket: "react1-4ad5b.appspot.com",
    messagingSenderId: "374018603976",
    appId: "1:374018603976:web:60d5d56ad54bb8f8"
  };

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req,res) => {
    admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then( data => {
        let screams = [];
        data.forEach(doc => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            }); 
        })
        return res.json(screams);
    })
    .catch(err => console.error(err));
})

app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin.firestore()
        .collection('screams')
        .add(newScream)
        .then((doc) =>{
            res.json({message: `document ${doc.id} created`})
        })
        .catch((err) => {
            res.status(500).json({error: 'somthing went wrong'});
            console.error(err);
        });
});

// Signup

app.post('/signup', (req,res) => {
    const newUser={
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    }

   firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
        return res.status(201).json({message: `user ${data.user.uid} signup successful`})
    }) 
    .catch( err => {
        return res.status(500).json({error: err.code});
    });
})

exports.api = functions.https.onRequest(app);