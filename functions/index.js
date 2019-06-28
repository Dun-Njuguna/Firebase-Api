const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

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
    db
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

    db
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

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx))return true;
    else return false;  
}

const isEmpty = (string) => {
    if(string.trim() === '')return true
    else return false;
}

// Signup
app.post('/signup', (req,res) => {
    const newUser={
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    } 

    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = 'must not be empty'
    }else if(!isEmail(newUser.email)){
       errors.email = 'Must be a valid email address' 
    }

    if(isEmpty(newUser.password)){
        errors.password = 'must not be empty'
    }
    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = 'passwords do not match'
    }
    if(isEmpty(handle)){
        errors.handle = 'must not be empty'
    }

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    let token,userId;
     db.doc(`/users/${newUser.handle}`)
     .get()
     .then( doc => {
         if(doc.exists){
            return res.status(400).json({handle: 'this handle is already taken'});
         }else{
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
         }
     })
     .then(data =>{
        userId = data.user.uid;
       return  data.user.getIdToken();
     })
     .then((idtoken) => {
         token = idtoken;
         const userCredentials = {
             handle: newUser.handle,
             email: newUser.email,
             createdAt: new Date().toISOString(),
             userId, 
         };
         return db.doc(`/users/${newUser.handle}`).set(userCredentials);
     })
     .then(() =>{
         return res.status(201).json({token})
     })
    .catch( err => {
    if(err.code == 'auth/email-already-in-use'){
        return res.status(400).json({email: "Email in use"});
    }else
        return res.status(500).json({error: err.code});
    });
})

exports.api = functions.https.onRequest(app);