'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


// a. the action name from the make_name Dialogflow intent
const EXAMPLE = "example";
// b. the parameters that are parsed from the make_name intent 


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body)); 
  
  function exampleFunction(app){
      app.ask("hogehoge");
  }
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(EXAMPLE,exampleFunction);
  
app.handleRequest(actionMap);
});
