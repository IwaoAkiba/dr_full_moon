'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


// a. the action name from the make_name Dialogflow intent
const CHECK_MOON = 'check_moon';
const WHEN_FULL_MOON = 'when_full_moon';
const CHECK_LOCATION = 'check_location';
const CONFIRM_LOCATION = 'confirm_location';
const CHECK_NEXT_FULL_MOON = 'next_full_moon';
const CHECK_PREVIOUS_FULL_MOON = 'previous_full_moon';
const FALL_BACK = 'fall_back';
const WELCOME = 'input.welcome';
const CHECK_NEXT_NEXT_FULL_MOON = 'next_next_full_moon';
const CHECK_PREVIOUS_PREVIOUS_FULL_MOON = 'previous_previous_full_moon';
const WHENISFULLMOON_REPEAT = 'WhenisFullMoon.WhenisFullMoon-repeat';

// b. the parameters that are parsed from the make_name intent 
const DATE_ARGUMENT = 'date';
const LOCATION_ARGUMENT = 'location';
const DATE_PERIOD_ARGUMENT = 'date-period';
const ANY_ARGUMENT = 'any';
const CONTEXT_ANSWERED = 'answered';



exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body)); 
  
  var fullMoonDays = [
                        new Date(2016,0,24,10,47),
                        new Date(2016,1,23,3,21),
                        new Date(2016,2,23,21,2),
                        new Date(2016,3,22,14,24),
                        new Date(2016,4,22,6,15),
                        new Date(2016,5,20,20,3),
                        new Date(2016,6,20,7,57),
                        new Date(2016,7,18,18,27),
                        new Date(2016,8,17,4,6),
                        new Date(2016,9,16,13,24),
                        new Date(2016,10,14,22,53),
                        new Date(2016,11,14,9,6),
                        new Date(2017,0,12,20,34),
                        new Date(2017,1,11,9,33),
                        new Date(2017,2,12,23,54),
                        new Date(2017,3,11,15,8),
                        new Date(2017,4,11,6,42),
                        new Date(2017,5,9,22,10),
                        new Date(2017,6,9,13,7),
                        new Date(2017,7,8,3,11),
                        new Date(2017,8,6,16,3),
                        new Date(2017,9,6,3,40),
                        new Date(2017,10,4,14,23),
                        new Date(2017,11,4,0,47),
                        new Date(2018,0,2,11,24),
                        new Date(2018,0,31,22,27),
                        new Date(2018,2,2,09,51),
                        new Date(2018,2,31,21,37),
                        new Date(2018,3,30,9,58),
                        new Date(2018,4,29,23,20),
                        new Date(2018,5,28,13,53),
                        new Date(2018,6,28,5,20),
                        new Date(2018,7,26,20,56),
                        new Date(2018,8,25,11,52),
                        new Date(2018,9,25,1,45),
                        new Date(2018,10,23,14,39),
                        new Date(2018,11,23,2,49),
                        new Date(2019,0,21,14,17),
                        new Date(2019,1,20,0,54),
                        new Date(2019,2,21,10,43),
                        new Date(2019,3,19,20,13),
                        new Date(2019,4,19,6,12),
                        new Date(2019,5,17,17,31),
                        new Date(2019,6,17,6,39),
                        new Date(2019,7,15,21,30),
                        new Date(2019,8,14,13,33),
                        new Date(2019,9,14,6,8),
                        new Date(2019,10,12,22,35),
                        new Date(2019,11,12,14,13)
                        ];
                        
    var timezoneoffset = -9;
    var userDate = app.getArgument(DATE_ARGUMENT);
    //今日
    var dt = new Date(Date.now() - (timezoneoffset * 60 - new Date().getTimezoneOffset()) * 60000);
    var dtYear = dt.getFullYear();
    var dtMonth = dt.getMonth() + 1; 
    var dtDate = dt.getDate();
    var dtHours = dt.getHours(); // あとで使う。
    
  
  function checkWhenIsFullMoon(app){
      //var contextParameter = 1;
      //app.setContext(CONTEXT_ANSWERED,5,contextParameter);
      var date = app.getArgument(DATE_ARGUMENT);
      var date_period = app.getArgument(DATE_PERIOD_ARGUMENT);
      var any = app.getArgument(ANY_ARGUMENT);
      var fullMoonStartYear = fullMoonDays[0].getFullYear();
      var fullMoonStartMonth = fullMoonDays[0].getMonth() + 1;
      var fullMoonStartDate = fullMoonDays[0].getDate();
      var fullMoonDaysLastID = fullMoonDays.length - 1;
      var fullMoonEndYear = fullMoonDays[fullMoonDaysLastID].getFullYear();
      var fullMoonEndMonth = fullMoonDays[fullMoonDaysLastID].getMonth() + 1;
      var fullMoonEndDate = fullMoonDays[fullMoonDaysLastID].getDate();
              
      if(date_period){
          app.data.fallbackCount = 0;
          var date_start = date_period.split("/")[0];
          var dtStartYear = date_start.split('-')[0];
          var dtStartMonth = date_start.split('-')[1] - 1;
          var dtStartDate = date_start.split('-')[2];
          var dtStartTime = new Date(dtStartYear,dtStartMonth,dtStartDate).getTime();
          
          var date_end = date_period.split("/")[1];
          var dtEndYear = date_end.split('-')[0];
          var dtEndMonth = date_end.split('-')[1] - 1;
          var dtEndDate = date_end.split('-')[2];
          var dtEndDay = new Date(dtEndYear,dtEndMonth,dtEndDate);
          // このままだと 0:00 分になってしまう。 1 日 足す。
          //dtEndDay = dtEndDay.setDate(dtEndDay.getDate() + 1);
          var dtEndTime = dtEndDay.getTime() + 1000*60*60*24;
          
          let flagForLoop = false;
          //知ってる期間内ではなかったら
          if(dtEndTime < fullMoonDays[0].getTime() || dtStartTime > fullMoonDays[fullMoonDaysLastID].getTime()){
              app.data.what_i_said = "今のところ"
              + fullMoonStartYear + "年から" 
              + fullMoonEndYear + "年まで" 
              + "の情報を知ってるのじゃ。その間だといつが知りたいかのう。";
              
              app.ask("すまんのう、まだその期間の情報を手に入れていないのじゃ。今のところ"
              + fullMoonStartYear + "年から" 
              + fullMoonEndYear + "年まで" 
              + "の情報を知ってるのじゃ。その間だといつが知りたいかのう。");
          }
          //知ってる期間内だったら。
          else{
              
              for(let i = 0; i < fullMoonDays.length; i++){
                  let fullMoonTime = fullMoonDays[i].getTime();
                  if(dtStartTime <= fullMoonTime && fullMoonTime <= dtEndTime){
                    //suggestedFullMoonTime を記載
                    app.data.suggestedFullMoonTimeId  = i;
                    let fullMoonYear = fullMoonDays[i].getFullYear();
                    let fullMoonMonth = fullMoonDays[i].getMonth() + 1;
                    let fullMoonDate = fullMoonDays[i].getDate();
                    var a = Math.floor( Math.random() * 11 ) ;
                    if(a < 3){
                        app.ask("なるほど。その期間じゃと、はじめは" + fullMoonMonth + "月" +fullMoonDate + "日" + "が満月じゃよ。追加の質問はあるかのう。");
                        flagForLoop = true;
                        break;
                    }
                    else if(a >= 3 && a <=6){
                        app.ask("そうじゃな。その期間じゃと、はじめは" + fullMoonMonth + "月" +fullMoonDate + "日" + "が満月じゃよ。他に聞きたいことはあるかのう？");
                        flagForLoop = true;
                        break;
                    }
                    else{
                        app.ask("その期間じゃと、はじめは" + fullMoonMonth + "月" +fullMoonDate + "日" + "が満月じゃよ。他に質問はあるかのう。");
                        flagForLoop = true;
                        break;
                    }
                  }
              }
              
              if(!flagForLoop){
                    app.ask("残念じゃが、その期間で満月の日はないのじゃ。次の満月などならおしえるぞよ？");
              }
          }
      }
      else if(date){
          app.data.fallbackCount = 0;
          userDate = date.split('-');
          dtYear = userDate[0];
          dtMonth = userDate[1];
          dtDate = userDate[2];
          var formatedDate = new Date(dtYear,dtMonth - 1,dtDate);
          var flagForLoop = false;
          if(formatedDate.getTime() < fullMoonDays[0].getTime() || formatedDate.getTime() > fullMoonDays[fullMoonDaysLastID].getTime()){
              app.data.what_i_said = "今のところ"
              + fullMoonStartYear + "年から" 
              + fullMoonEndYear + "年まで" 
              + "の情報を知ってるのじゃ。その間だといつが知りたいかのう。";
              app.ask("すまんのう、まだその期間の情報を手に入れていないのじゃ。今のところ"
              + fullMoonStartYear + "年から" 
              + fullMoonEndYear + "年まで" 
              + "の情報を知ってるのじゃ。その間だといつが知りたいかのう。");
          }
          //知ってる期間内だったら。
          else{
            for(let i = 0; i < fullMoonDays.length; i++ ){
                app.data.suggestedFullMoonTimeId = i;
                let fullMoonYear = fullMoonDays[i].getFullYear();
                let fullMoonMonth = fullMoonDays[i].getMonth() + 1;
                let fullMoonDate = fullMoonDays[i].getDate();
                let fullMoonHours = fullMoonDays[i].getHours();
                if(fullMoonYear == dtYear && fullMoonMonth == dtMonth && fullMoonDate == dtDate){
                    let randoms = Math.floor( Math.random() * 11 ) ;
                    if(randoms < 3){
                        app.ask("うむ。" + fullMoonMonth + '月' + fullMoonDate + '日は満月じゃよ。知りたいことはあるかのう？');
                        flagForLoop = true;
                        break;
                    }
                    else if(randoms <= 3 && randoms <= 6) {
                        app.ask("ふぉっふぉっふぉっふぉっふぉ。" + fullMoonMonth + '月' + fullMoonDate + '日は満月じゃよ。他に知りたいことはあるかのう？');
                        flagForLoop = true;
                        break;
                    }
                    else{
                        app.ask("素晴らしい！" + fullMoonMonth + '月' + fullMoonDate + '日は満月じゃよ。追加の質問はあるかのう？');
                        flagForLoop = true;
                        break;
                    }
                }
            }
            if(!flagForLoop){
                /*if(dtMonth != "10" && dtMonth != "11" && dtMonth != "12"){
                    dtMonth = dtMonth.slice(-1);
                }
                
                if(dtDate == "01" ||
                dtDate == "02" ||
                dtDate == "03" ||
                dtDate == "04" ||
                dtDate == "05" ||
                dtDate == "06" ||
                dtDate == "07" ||
                dtDate == "08" ||
                dtDate == "09"){
                    dtDate = dtDate.slice(-1);
                }
                */
                let randoms = Math.floor( Math.random() * 11 ) ;
                if(randoms < 3){
                    app.ask("そうじゃのう。" + dtMonth + '月' + dtDate + "日は満月ではないのじゃ。次の満月ならおしえるぞよ？");
                }
                else if(randoms <= 3  && randoms <= 6){
                    app.ask("うーん。" + dtMonth + '月' + dtDate + "日は満月ではないのじゃ。他に質問はあるかのう？");
                }
                else{
                    app.ask("残念じゃが、" + dtMonth + '月' + dtDate + "日は満月ではないのじゃ。他に知りたいことはあるかのう？");
                }
            }
          }
      }
      else{
          fallback(app);
      }
  }
  
  
  function checkNextFullMoon(app){
      let flagForLoop = false;
            let dtTime = dt.getTime();
            for(let i = 0; i < fullMoonDays.length; i++){
                let fullMoonTime = fullMoonDays[i].getTime();
                if(dtTime < fullMoonTime && i > 0){
                    //言う満月の日のIDを保存
                    app.data.suggestedFullMoonTimeId = i;
                    app.data.fallbackCount = 0;
                    
                    let fullMoonYear = fullMoonDays[i].getFullYear();
                    let fullMoonMonth = fullMoonDays[i].getMonth() + 1;
                    let fullMoonDate = fullMoonDays[i].getDate();
                    let randoms = Math.floor( Math.random() * 11 ) ;
                    if(randoms < 3){
                    app.ask("そうじゃな。次の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。追加で聞きたいことはあるかの？");
                    flagForLoop = true;
                    break;
                    }
                    else if(randoms <= 3 && randoms <= 6){
                        app.ask("次か。次の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。もっといろいろおしえるぞよ？");
                        flagForLoop = true;
                        break;
                    }
                    else{
                        app.ask("うむ。次の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。他になにか知りたいことはあるかのう？");
                        flagForLoop = true;
                        break;
                    }
                }
            }
            if(!flagForLoop){
                fallback(app);
            }
  }
  
  function checkPreviousFullMoon(app){
      app.data.fallbackCount = 0;
      let flagForLoop = false;
            let dtTime = dt.getTime();
            for(let i = 0; i < fullMoonDays.length; i++){
                let fullMoonTime = fullMoonDays[i].getTime();
                if(dtTime < fullMoonTime && i > 0){
                    app.data.suggestedFullMoonTimeId = i-1;
                    let fullMoonYear = fullMoonDays[i-1].getFullYear();
                    let fullMoonMonth = fullMoonDays[i-1].getMonth() + 1;
                    let fullMoonDate = fullMoonDays[i-1].getDate();
                    app.ask("前の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。他になにか知りたいことはあるか？");
                    flagForLoop = true;
                    break;
                }
            }
            if(!flagForLoop){
                app.ask("前の満月の日はわからんのじゃ。他になにか知りたいことはあるか？");
            }
  }
  
  function checkNextNextFullMoon(app){
      app.data.fallbackCount = 0;
      let nextFullMoonID = app.data.suggestedFullMoonTimeId + 1;
      app.data.suggestedFullMoonTimeId = nextFullMoonID;
      if(nextFullMoonID <= fullMoonDays.length - 1){
      let fullMoonYear = fullMoonDays[nextFullMoonID].getFullYear();
      let fullMoonMonth = fullMoonDays[nextFullMoonID].getMonth() + 1;
      let fullMoonDate = fullMoonDays[nextFullMoonID].getDate();
      let randoms = Math.floor( Math.random() * 11) ;
        if(randoms < 3){
            app.ask("そうじゃな。その次の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。追加で聞きたいことはあるかの？");
        }
        else if(randoms <= 3 && randoms <= 6){
            app.ask("その次の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。もっといろいろおしえるぞよ？");
        }
        else{
            app.ask("うむ。その次の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。他になにか知りたいことはあるかのう？");
        }
      }
      else{
          var fullMoonStartYear = fullMoonDays[0].getFullYear();
          var fullMoonDaysLastID = fullMoonDays.length - 1;
          var fullMoonEndYear = fullMoonDays[fullMoonDaysLastID].getFullYear();
          app.ask("すまんのう、まだその期間の情報を手に入れていないのじゃ。今のところ"
              + fullMoonStartYear + "年から" 
              + fullMoonEndYear + "年まで" 
              + "の情報を知ってるのじゃ。その間だといつが知りたいかのう。");
      }
  }
  
  function checkPreviousPreviousFullMoon(app){
      app.data.fallbackCount = 0;
      let previousFullMoonID = app.data.suggestedFullMoonTimeId - 1;
      app.data.suggestedFullMoonTimeId = previousFullMoonID;
      if(app.data.suggestedFullMoonTimeId >= 0){
      let fullMoonYear = fullMoonDays[previousFullMoonID].getFullYear();
      let fullMoonMonth = fullMoonDays[previousFullMoonID].getMonth() + 1;
      let fullMoonDate = fullMoonDays[previousFullMoonID].getDate();
      let randoms = Math.floor( Math.random() * 11) ;
        if(randoms < 3){
            app.ask("そうじゃな。その前の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。追加で聞きたいことはあるかの？");
        }
        else if(randoms <= 3 && randoms <= 6){
            app.ask("その前の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。もっといろいろおしえるぞよ？");
        }
        else{
            app.ask("うむ。その前の満月は" + fullMoonYear + "年" + fullMoonMonth +"月"+ fullMoonDate +"日じゃ。他になにか知りたいことはあるかのう？");
        }
      }
      else{
          var fullMoonStartYear = fullMoonDays[0].getFullYear();
          var fullMoonDaysLastID = fullMoonDays.length - 1;
          var fullMoonEndYear = fullMoonDays[fullMoonDaysLastID].getFullYear();
          app.ask("すまんのう、まだその期間の情報を手に入れていないのじゃ。今のところ"
              + fullMoonStartYear + "年から" 
              + fullMoonEndYear + "年まで" 
              + "の情報を知ってるのじゃ。その間だといつが知りたいかのう。");
      }
  }
  
  function whenIsFullMoonRepeat(app){
      if(app.data.what_i_said){
        app.ask("もう一度言うぞ。" + app.data.what_i_said); 
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
      return app.ask("今、なんておっしゃったかのう？");
    }
    else if(app.data.fallbackCount === 2){
        return app.ask("失礼じゃが、もう一度おねがいできんか。例えば「今日」や「次の満月」等と日付を指定してくれんかのう。");
    }
    else{
        return app.tell("すまん。勉強不足で役にたてなさそうじゃ。またよろしくじゃ。");
    }
  }
  
  function welcome(app){
      app.data.fallbackCount = 0;
      if (app.getLastSeen()) {
        app.ask("いつも聞いてくれてありがとう！満月博士じゃ。知りたいことはなんじゃ？");
      } else {
        app.ask("ようこそ！満月博士じゃ。いつの満月が知りたいんじゃ？");
  }
  }
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  //actionMap.set(CHECK_LOCATION,checkLocation);
  //actionMap.set(CHECK_MOON, checkFullMoon);
  actionMap.set(WHEN_FULL_MOON,checkWhenIsFullMoon);
  actionMap.set(CHECK_NEXT_FULL_MOON, checkNextFullMoon);
  actionMap.set(CHECK_PREVIOUS_FULL_MOON, checkPreviousFullMoon);
  actionMap.set(FALL_BACK,fallback);
  actionMap.set(WELCOME, welcome);
  actionMap.set(CHECK_NEXT_NEXT_FULL_MOON,checkNextNextFullMoon);
  actionMap.set(CHECK_PREVIOUS_PREVIOUS_FULL_MOON, checkPreviousPreviousFullMoon);
  actionMap.set(WHENISFULLMOON_REPEAT,whenIsFullMoonRepeat);
  //actionMap.set(WELCOME, checkFullMoon);
  //actionMap.set(CONFIRM_LOCATION, itemSelected);

app.handleRequest(actionMap);
});