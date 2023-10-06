// --------------------------------------------------------------
//
//	initialize
//
// --------------------------------------------------------------

let option;

function stripTag(str){
 return str.replace(/<\/?[^>]+(>|$)/g, "");
}

// MODULE
//noti_ehrd 는 추가 안내문구가 있는 경우 json형태로 넘겨준다
//==> prefix[표시전], suffix[표시후] 추가사항
module.exports.HR2KAKAO = function (sourJson_, pre_noti, suf_noti) {


  //let sourStr =  JSON.stringify(sourJson_);
  //var sourJson = JSON.parse(sourStr);

  var sourJson = sourJson_.result;



  
  //euckr --> utf8 변환

  var resJson = new Object;

  var outputs = new Array;
  var quicklist = new Array;
  


  if(pre_noti!=undefined) {
    for (var i = 0; i < pre_noti.length; i++) {  
      outputs.push(pre_noti[i]);
    }
  }

  //hr챗봇을 kakao챗봇으로 전환한다.
  for (var i = 0; i < sourJson.length; i++) {
    var outJson = new Object;

    var obj = sourJson[i];
    //console.log(i + "--" + obj.nodeType);
    let outtype = obj.nodeType;

    console.log('num:', i, 'type:', outtype);

    //node type 별 kakao의 out type 으로 변환
    if(outtype == ""){
      console.log('error process');

      //speak 모드가 image가 있거나 optionlist가 있는 경우
      //basiccard로 처리하여야 한다!!
      //기본simpleText!!

        //어떤의미인지 확인한다.
        //personalityObj.nodeMessage

        //another_result 버튼으로 제시
        if(sourJson_.personalityObj.nodeMessage ==obj.message){

            console.log('의미확인 personalityObj process');



            var optList = sourJson_.another_result;


            //var out = new Object;

            //버튼이 3개를 넘는지 확인한다.
            //3개가 넘는 경우 carousel 모드로 구현해야함..
            //buttons만 구현하는 basicCard로 처리함
            var items = new Array;

            //var itemCnt = Math.ceil(obj.optionList.length/3);
            

            var buttons = new Array;
            var item = new Object;

            for (var opt = 0; opt < optList.length; opt++) {
                
                var btn = new Object;
                var quick = new Object;

                option = optList[opt];

                //의미 되묻기는 무조건 callFlow 형식
                //callFlow 반영 --> hr통합챗봇 block호출(value를 발화로 가지고 감)

                
                console.log(option.intent_name, option.intent_id);
                btn.action = "block";
                    btn.label = option.intent_alias;
                    btn.messageText = option.intent_alias;//parameters."@message";
                    btn.extra = {"type":"callflow",
                                 "value":option.intent_id
                               };
                    //HR통합챗봇 blockid
                    btn.blockId = "5e1d9c9dffa748000195d80b";
                    buttons.push(btn);

                      //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                    if(buttons.length%3==0){
                      console.log(opt, "clear");
                      item.title = stripTag(obj.message);
                      item.description = "";
                      item.buttons = buttons;

                      items.push(item);
                      buttons = new Array;
                      item = new Object;
                    }
                
            }

            //남은 buttons push
            if(buttons.length>0){
              item = new Object;
              item.title = stripTag(obj.message);
              item.description = "";
              item.buttons = buttons;
              items.push(item);

              console.log("fin btn push")
            }


            //items이 1개 이상이면 carousel
            if(items.length>0){

              outJson.carousel = 
                {type: "basicCard",
                 items: items
                }

              //outputs.push(outJson);
              //outJson = new Object;

            }else{
              

              outJson.basicCard = {
                title : "선택하세요",
                description : "원하시는 항목을 선택하세요",
                buttons : item.buttons
              }

              //남은 outs는 최종단에서 처리됨 
              //outputs.push(outJson);

            }            

        }else{

          outJson.simpleText =  {"text": stripTag(obj.message)};

        }
        // //이미지가 있는지 확인하자
        // if(obj.imgRoute!=""){
        //   outJson.simpleImage = 
        //     {"imageUrl":obj.imgRoute,
        //      "altText":"HR통합챗봇"
        //     };
        // }


    }else if(outtype == "speak"){
      console.log('speak process');

      //speak 모드가 image가 있거나 optionlist가 있는 경우
      //basiccard로 처리하여야 한다!!
      //기본simpleText!!

      console.log('imgRoute', obj.imgRoute);

      if(obj.imgRoute!="" || obj.optionList.length>0){

        if(obj.imgRoute!=""){
          var thumb = {
            imageUrl : obj.imgRoute,
            width : 246,
            height : 13
          }
        }
        //var out = new Object;

        //버튼이 3개를 넘는지 확인한다.
        //3개가 넘는 경우 carousel 모드로 구현해야함..
        //buttons만 구현하는 basicCard로 처리함
        var items = new Array;

        //var itemCnt = Math.ceil(obj.optionList.length/3);
        var optList = obj.optionList;

        var buttons = new Array;
        var item = new Object;

        for (var opt = 0; opt < obj.optionList.length; opt++) {
            
            console.log('option list', opt)
            var btn = new Object;
            var quick = new Object;

            option = optList[opt];

            //callFlow 반영 --> hr통합챗봇 block호출(value를 발화로 가지고 감)
            if(option.type=="callFlow"){
                console.log(option.id, option.label);
                btn.action = "block";
                btn.label = option.label;
                btn.messageText = option.label;
                btn.extra = {"type":"callflow",
                             "value":option.value
                           };
                //HR통합챗봇 blockid
                btn.blockId = "5e1d9c9dffa748000195d80b";
                buttons.push(btn);

                  //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                if(buttons.length%3==0){
                  console.log(opt, "clear");
                  //item.title = "선택하세요";
                  item.description = "원하시는 항목을 선택하세요";
                  //img가 있다면 섬네일 표시
                  if(obj.imgRoute!=""){
                    item.thumbnail = thumb;
                  }

                  item.buttons = buttons;

                  items.push(item);
                  buttons = new Array;
                  item = new Object;
                }


            }else if(option.type=="btn"){
                
                console.log(option.id, option.label);
                btn.action = "message";
                btn.label = option.label;
                btn.messageText = option.label;
                btn.extra = {"type":"message",
                             "value":option.value
                           };
                //HR통합챗봇 blockid
                btn.blockId = "5e1d9c9dffa748000195d80b";
                buttons.push(btn);

            }else if(option.type=="quick"){
                

                console.log(option.id, option.label);
                quick.action = "block";
                quick.label = option.label;
                quick.messageText = option.label;
                quick.extra = 
                          {
                            "type":"quick",
                            "value":option.value
                           };
                //HR통합챗봇 blockid
                quick.blockId = "5e1d9c9dffa748000195d80b";

                quicklist.push(quick);

            }else if(option.type=="link"){
                console.log(option.id, option.label);
                btn.action = "block";
                btn.label = option.label;
                btn.messageText = option.label;
                btn.extra = 
                          {"type":"link",
                             "value":option.value
                           };
                //HR통합챗봇 blockid
                btn.blockId = "5e1d9c9dffa748000195d80b";
                buttons.push(btn);

                  //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                if(buttons.length%3==0){
                  console.log(opt, "clear");
                  //item.title = "선택하세요";
                  item.description = "원하시는 항목을 선택하세요";
                  if(obj.imgRoute!=""){
                    item.thumbnail = thumb;
                  }
                  item.buttons = buttons;

                  items.push(item);
                  buttons = new Array;
                  item = new Object;
                }

            }else{
              console.log('option type error', option.id, option.type)
            }
            
            
        }

        console.log('buttons length', buttons.length);

        //남은 buttons push
        if(buttons.length>0){
          item = new Object;
          //item.title = "선택하세요";
          item.description = "원하시는 항목을 선택하세요";
          if(obj.imgRoute!=""){
                    item.thumbnail = thumb;
          }
          item.buttons = buttons;
          items.push(item);
          console.log('left btn push');
        }



        //items이 1개 이상이면 carousel

        console.log('items check ', items.length);
        if(items.length>0){



          outJson.simpleText =  {"text": stripTag(obj.message)};

          //텍스트가 들어가고 outJson을 초기화
          outputs.push(outJson);
          outJson = new Object;

          outJson.carousel = 
            {type: "basicCard",
             items: items
            }

          //outputs.push(outJson);
          //outJson = new Object;

        }else if(item.buttons != undefined ){
         

          outJson.simpleText =  {"text": stripTag(obj.message)};

          //텍스트가 들어가고 outJson을 초기화
          outputs.push(outJson);
          outJson = new Object;
         
          outJson.basicCard = {
            //title : "선택하세요",
            description : "원하시는 항목을 선택하세요",
            buttons : item.buttons
          }

          //남은 outs는 최종단에서 처리됨 
          //outputs.push(outJson);

        }else{
            outJson.simpleText =  {"text": stripTag(obj.message)};

        }

        // //이미지가 있는지 확인하자
        // if(obj.imgRoute!=""){
        //   outJson.simpleImage = 
        //     {"imageUrl":obj.imgRoute,
        //      "altText":"HR통합챗봇"
        //     };
        // }


      }else{
     
        //직전블럭이 simpleText인 경우 합치자!!

        var msg = stripTag(obj.message);

        if(i>0){
          console.log("before txt:", JSON.stringify(outputs[outputs.length-1],null,4));
          var bef_msg = outputs[outputs.length-1].simpleText.text;
          var msglen = bef_msg.length;

          console.log ("bef_msg:", msglen , bef_msg)

          if (msglen>0){
            msg = bef_msg + "\n\n" + msg;
            outputs.pop();

          }
        }
        outJson.simpleText =  {"text": msg }; // stripTag(obj.message)};
      }

    }else if(outtype == "slot"){
      console.log('slot process');

      //speak 모드가 image가 있거나 optionlist가 있는 경우
      //basiccard로 처리하여야 한다!!
      //기본simpleText!!

      console.log(obj.optionList.length);

      if(obj.imgRoute!="" || obj.optionList.length>0){


        //var out = new Object;

        //버튼이 3개를 넘는지 확인한다.
        //3개가 넘는 경우 carousel 모드로 구현해야함..
        //buttons만 구현하는 basicCard로 처리함
        var items = new Array;

        //var itemCnt = Math.ceil(obj.optionList.length/3);
        var optList = obj.optionList;

        var buttons = new Array;
        var item = new Object;

        for (var opt = 0; opt < obj.optionList.length; opt++) {
            
    
            var btn = new Object;
            var quick = new Object;

            option = optList[opt];

            //callFlow 반영 --> hr통합챗봇 block호출(value를 발화로 가지고 감)
            if(option.type=="btn"){
                console.log(option.id, option.label);
                btn.action = "block";
                btn.label = option.label;
                btn.messageText = option.value;
                btn.extra = {"type":"slotbtn",
                             "value":option.value,
                             "intent_id" : sourJson_.intent_id,
                             "chatflow_id" : sourJson_.chatflow_id,
                             "node_id": sourJson_.node_id,
                             "param_id": sourJson_.param_id
                           };
                //HR통합챗봇 blockid
                btn.blockId = "5e1d9c9dffa748000195d80b";
                buttons.push(btn);

                  //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                if(buttons.length%3==0){
                  console.log(opt, "clear");
                  item.title = "선택하세요";
                  item.description = "원하시는 항목을 선택하세요";
                  item.buttons = buttons;

                  items.push(item);
                  buttons = new Array;
                  item = new Object;
                }


            }else if(option.type=="quick"){
                

                console.log(option.id, option.label);
                quick.action = "block";
                quick.label = option.label;
                quick.messageText = option.label;
                quick.extra = {"type":"quick",
                             "value":option.value
                           };
                //HR통합챗봇 blockid
                quick.blockId = "5e1d9c9dffa748000195d80b";

                quicklist.push(quick);

            }else if(option.type=="link"){
                

                console.log(option.id, option.label);
                
                //http://h.kb.do [hrd]link인 경우 바로가기 연결
                let linkurl = option.value;

                if(linkurl.indexOf("h.kb.do")>0){
                  btn.action = "webLink";
                  btn.label = option.label;
                  btn.messageText = option.label;
                  btn.webLinkUrl = option.value;

                }else{
                  btn.action = "block";
                  btn.label = option.label+"[@]";
                  btn.messageText = option.label;
                  btn.extra = {"type":"link",
                               "value":option.value
                             };
                  //HR통합챗봇 blockid
                  btn.blockId = "5e1d9c9dffa748000195d80b";
                }

                buttons.push(btn);

                  //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                if(buttons.length%3==0){
                  console.log(opt, "clear");
                  item.title = "선택하세요";
                  item.description = "원하시는 항목을 선택하세요";
                  item.buttons = buttons;

                  items.push(item);
                  buttons = new Array;
                  item = new Object;
                }

            }
            
            
        }

        //남은 buttons push
        if(buttons.length>0){
          item = new Object;
          item.title = "선택하세요";
          item.description = "원하시는 항목을 선택하세요";
          item.buttons = buttons;
          items.push(item);          
        }


        outJson.simpleText =  {"text": stripTag(obj.message)};

        //텍스트가 들어가고 outJson을 초기화
        outputs.push(outJson);
        outJson = new Object;

        //items이 1개 이상이면 carousel
        if(items.length>0){

          outJson.carousel = 
            {type: "basicCard",
             items: items
            }

          //outputs.push(outJson);
          //outJson = new Object;

        }else{
          outJson.basicCard = {
            title : "선택하세요",
            description : "원하시는 항목을 선택하세요",
            buttons : item.buttons
          }

          //남은 outs는 최종단에서 처리됨 
          //outputs.push(outJson);

        }

        // //이미지가 있는지 확인하자
        // if(obj.imgRoute!=""){
        //   outJson.simpleImage = 
        //     {"imageUrl":obj.imgRoute,
        //      "altText":"HR통합챗봇"
        //     };
        // }


      }else{
        outJson.simpleText =  {"text": stripTag(obj.message)};
      }

    }else if(outtype == "carousel"){

      var items = new Array;
      var item = new Object;

      //캐로셀 타입은 list를 가지고 있다.
      //3개 초과되는 경우 추가 items으로 처리하자!!
      for (var caro = 0; caro < obj.carouselList.length; caro++) {

            var buttons = new Array;
            item = new Object;
            var Thumbnail = new Object;

            //var sou_item = obj.carouselList[caro];
            //console.log(caro);
            //console.log(sou_item);

            var sou_item = obj.carouselList[caro];
            //캐로셀 card 마다 title, optionlist 가 있다
            var des_item = new Object;

            //3개초과시 추가 용
            var des_item_sec = new Object;
            var buttons_sec = new Array;

            item.title = sou_item.cardTitle;
            console.log(caro, sou_item.cardTitle);
            item.description = sou_item.subCardTitle;

            let imgproc = false;

            if(sou_item.imgRoute!=undefined) imgproc = true;
            if(sou_item.imgRoute=="") imgproc = false;
            if(imgproc){

              console.log("img process", sou_item.imgRoute);
              Thumbnail =
              {
                imageUrl : sou_item.imgRoute,
                width: 500,
                height: 500,
                fixedRatio:true
              }
              item.thumbnail = Thumbnail
            }
            //console.log(des_item.title);

            //optionlist 변환
            for (var opt = 0; opt < sou_item.optionList.length; opt++) {
                var btn = new Object;
                var quick = new Object;
                option = sou_item.optionList[opt];

                  //console.log(opt, option.type);

                //callFlow 반영 --> hr통합챗봇 block호출(value를 발화로 가지고 감)
                if(option.type=="callFlow"){
                  console.log(caro, opt, option.label);
                  btn.action = "block";
                  btn.label = option.label;
                  btn.messageText = option.label;
                  btn.extra = {"type":"callflow",
                               "value": option.value
                             };
                  //HR통합챗봇 blockid
                  btn.blockId = "5e1d9c9dffa748000195d80b";
                  buttons.push(btn);


                  // //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                  // if(opt>2){
                  //   buttons_sec.push(btn);
                  // }
                  //3개 초과시
                      //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                  if(buttons.length%3==0){
                    console.log(opt, "clear");
                    item.title = sou_item.cardTitle + "[계속]";
                    console.log(caro, sou_item.cardTitle);
                    item.description = sou_item.subCardTitle;
                    item.thumbnail = Thumbnail;

                    item.buttons = buttons;

                    items.push(item);
                    buttons = new Array;
                    item = new Object;
                  }


                }else if(option.type=="link"){
                  

                  console.log(option.id, option.label);
                  
                  //http://h.kb.do [hrd]link인 경우 바로가기 연결
                  let linkurl = option.value;

                  if(linkurl.indexOf("h.kb.do")>0){
                    btn.action = "webLink";
                    btn.label = option.label;
                    btn.messageText = option.label;
                    btn.webLinkUrl = option.value;

                  }else{
                    btn.action = "block";
                    btn.label = option.label+"[@]";
                    btn.messageText = option.label;
                    btn.extra = {"type":"link",
                                 "value":option.value
                               };
                    //HR통합챗봇 blockid
                    btn.blockId = "5e1d9c9dffa748000195d80b";
                  }

                  buttons.push(btn);

                    //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
                  if(buttons.length%3==0){
                    
                    console.log(opt, "clear");
                    item.title = sou_item.cardTitle + "[계속]";
                    item.description = "원하시는 항목을 선택하세요";
                    item.thumbnail = Thumbnail;
                    item.buttons = buttons;

                    items.push(item);
                    buttons = new Array;
                    item = new Object;
                  }
              
                }else if(option.type=="quick"){
                  
                  console.log(option.id, option.label);
                  quick.action = "block";
                  quick.label = option.label;
                  quick.messageText = option.label;
                  quick.extra = {"type":"quick",
                               "value":option.value
                             };
                  //HR통합챗봇 blockid
                  quick.blockId = "5e1d9c9dffa748000195d80b";

                  quicklist.push(quick);

                }              
            }

            //남은 buttons push
            if(buttons.length>0){
              item = new Object;
              item.title = sou_item.cardTitle ;
              item.description = sou_item.subCardTitle;
              item.thumbnail = Thumbnail;
              item.buttons = buttons;
              items.push(item);
              item = new Object;
            }

            if(item.title != undefined){
              console.log('item 남음'  )
              items.push(item);
              item = new Object;

            }

            // des_item.buttons = buttons;
            // items.push(des_item);

            // if(sou_item.optionList.length>3){

            //   des_item_sec.title = des_item.title +"[계속]";
            //   des_item_sec.description = "[계속]"+des_item.description;
            //   des_item_sec.buttons = buttons_sec;
            //   items.push(des_item_sec);

            // }


      }

      outJson.carousel = 
        {type: "basicCard",
         items: items
        }
    }else if(outtype == "carousel2222"){

      var items = new Array;

      //캐로셀 타입은 list를 가지고 있다.
      //3개 초과되는 경우 추가 items으로 처리하자!!
      for (var caro = 0; caro < obj.carouselList.length; caro++) {

          var buttons = new Array;
          var sou_item = obj.carouselList[caro];
          //console.log(caro);
          //console.log(sou_item);

            var sou_item = obj.carouselList[caro];
            //캐로셀 card 마다 title, optionlist 가 있다
            var des_item = new Object;

            //3개초과시 추가 용
            var des_item_sec = new Object;
            var buttons_sec = new Array;

            des_item.title = sou_item.cardTitle;
            console.log(caro, sou_item.cardTitle);
            des_item.description = sou_item.subCardTitle;
            //console.log(des_item.title);

            //optionlist 변환
            for (var opt = 0; opt < sou_item.optionList.length; opt++) {
              var btn = new Object;
              option = sou_item.optionList[opt];

                //console.log(opt, option.type);

              //callFlow 반영 --> hr통합챗봇 block호출(value를 발화로 가지고 감)
              if(option.type=="callFlow"){
                console.log(caro, opt, option.label);
                btn.action = "block";
                btn.label = option.label;
                btn.messageText = option.label;
                btn.extra = {"type":"callflow",
                             "value":option.value
                           };
                //HR통합챗봇 blockid
                btn.blockId = "5e1d9c9dffa748000195d80b";
              }
              buttons.push(btn);
              //3개이상 (0,1,2,3,4이므로 2보다 큰 경우)
              if(opt>2){
                buttons_sec.push(btn);
              }
              
            }

            des_item.buttons = buttons;
            items.push(des_item);

            if(sou_item.optionList.length>3){

              des_item_sec.title = des_item.title +"[계속]";
              des_item_sec.description = "[계속]"+des_item.description;
              des_item_sec.buttons = buttons_sec;
              items.push(des_item_sec);

            }


      }

      outJson.carousel = 
        {type: "basicCard",
         items: items
        }
    }


    outputs.push(outJson);
    //console.log(i, JSON.stringify(outJson, null, 3))

  }


  // if(suf_noti!=undefined) outputs.push(suf_noti);

  if(suf_noti!=undefined) {
    for (var i = 0; i < suf_noti.length; i++) {  
      outputs.push(suf_noti[i]);
    }
  }


  
  //kakao v2 로 전환
 resJson.version = "2.0";
 resJson.template = {"outputs" : outputs}
 
 if(quicklist.length>0) resJson.template.quickReplies = quicklist;
 

  //console.log(JSON.stringify(resJson, null, 3));
  return resJson;
}


// MODULE
module.exports.KAKAO2HR = function (sourJson) {

  var resJson = {};
  
  return resJson;


}
