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
  
  function listiningGuchi(app){
      var any = app.getArgument(ANY_ARGUMENT);
      if(any){
        app.data.fallbackCount = 0;  
        if(any == "寝不足"){
            app.ask("ありゃやあ、寝不足なんですね。");
        }
        else if(any == "上司"){
            app.ask("あらま、上司が。色々大変ですね");
        }
        else{
            app.ask("あらま、色々大変ですね");
        }
      }
      else{
          fallback(app);
      }
  }
  function fallback(app){
    console.log(app.data.fallbackCount);
    if (typeof app.data.fallbackCount !== 'number') {
      app.data.fallbackCount = 0;
    }
    app.data.fallbackCount++;
    // Provide two prompts before ending game
    if (app.data.fallbackCount === 1) {
      //app.setContext(Contexts.DONE_YES_NO);
      return app.ask("いまなんていいましたか？");
    }
    else if(app.data.fallbackCount === 2){
        return app.ask("失礼しました、わかりにくかったです。「寝不足」や「上司がつらい」等といってください");
    }
    else{
        return app.tell("すみません。勉強不足で役にたてそうにありません。");
    }
  }
  
  let actionMap = new Map();
  actionMap.set(GUCHI,listiningGuchi);
  app.handleRequest(actionMap);
});
