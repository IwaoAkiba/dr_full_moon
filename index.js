'use strict';

process.env.DEBUG = 'actions-on-google:*';
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const App = require('actions-on-google').DialogflowApp; // Google Assistant helper library

// a. action 名 を書く Dialogflow intent
const GUCHI = 'guchi';

// b. パラメータ 名を書く
const ANY_ARGUMENT = 'any';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  function listeningGuchi(app){
      var any = app.getArgument(ANY_ARGUMENT);
      if(any){
        if(any == "寝不足"){
            app.ask("ありゃやあ、寝不足なんですね。");
        }
        else if(any == "上司"){
            app.ask("あらま、上司が。色々大変ですね");
        }
        else{
            app.ask("あらまあ、色々大変ですね");
        }
      }
      else{
          app.ask("あらま、色々大変ですね");
      }
  }
  
  let actionMap = new Map();
  actionMap.set(GUCHI,listeningGuchi);
  app.handleRequest(actionMap);
});
