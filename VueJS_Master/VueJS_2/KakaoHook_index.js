const axios = require('axios');
const db = require('./dbProc');
const convHR = require('./convHR2Kakao');


// branch_test modification
// branch_test modification_2

// let outputs = [];

const  contextSession = (sessionId, lrnerId, name, userParams) => {
    
    return {
        "values" : 
            [{
                "name" : "session",
                "lifeSpan" : 15,
                "params":{
                    "session_id":sessionId,
                    "lrnerId":lrnerId,
                    "name":name,
                    "userParams" : JSON.stringify(userParams)
                }
            }]
        };

}
 

exports.handler = async (event) => {

    // let currDate = new Date().getMilliseconds();
     
     //defulat return 설정
    let retJson = {
          "version": "2.0",
          "template": {
          "outputs": [
              {
                "simpleText": {
                  "text": "eHRD 챗봇을 이용해 주셔서 감사합니다!!... 잠시만 기다리세요"
                }
              }
            ]
          }
        }
     
     //log
    console.log(event);
     
     
    //POST 이외 return;
    if(event.httpMethod!="POST"){

        return {
            statusCode: 200,
            body: JSON.stringify(retJson),
        };
    }
    
    let body = event.body;
    
    let bodyJson = JSON.parse(body);
    
    //user 입력내용
    let userMessage = bodyJson.userRequest.utterance;

    //카카오톡 userKey
    let kakaoUserKey = bodyJson.userRequest.user.properties.plusfriendUserKey;
    //카카오톡 친구여부
    let kakaoFriendFlag = bodyJson.userRequest.user.properties.isFriend;
    
    let blockName =  bodyJson.userRequest.block.name;

    let dapPayload;
    let reqBody;
    
    let HRchatRes = {}
    let HRParameters = {}

    let pre_fix = undefined;
    let suf_fix = undefined;



    //context - sessionId 등
    let contextParam;
    let sessionId; //DAP용 session_id
    let lrnerId;  //직원번호
    let userName; //직원명
    let userParam;
    
    try {
       contextParam = bodyJson.contexts ?  bodyJson.contexts[0].params : null;
       
       sessionId = contextParam ? contextParam.session_id.value : null;
       lrnerId =  contextParam ? contextParam.lrnerId.value : null;
       userName =  contextParam ? contextParam.name.value : null;
       userParam = contextParam ? JSON.parse(contextParam.userParams.value) : null;
       
    }catch (e){
       
    }
    
    



    // retJson.context = contextSession(sessionId, lrnerId, "-");
    if (userMessage==="챗봇 다시시작하기") sessionId=null;
    
    
    if(!sessionId){
        
        // 쿼리 실행
        var sql = `
        SELECT RESNO, cu.LRNER_NM, cu.DEPT_NM, CONCAT('KBSTAR_', cu.DEPT_CD) DEPT, cu.APPEL_NM, cu.JBGD_NM, cu.JBGD_CD 
        FROM PEA_MY.COM_CHATBOTUSER cc
        INNER JOIN PEA_MY.COM_USERS cu 
        ON cc.RESNO = cu.LRNER_ID
        WHERE USED = 'Y' AND USERKEY='${kakaoUserKey}' AND CHATBOT_DIV='kakao'`;
        
        console.log("SELECT QUERY:", sql);
        
        const lrnerId_DB = await db.dbQuery(sql);
        console.log("db", lrnerId_DB.data , kakaoUserKey);
        if(lrnerId_DB.result)lrnerId = lrnerId_DB.data[0].RESNO;
        console.log("USERID", lrnerId);
        
//         db [
//   {
//     RESNO: '1533872',
//     LRNER_NM: '김귀석',
//     DEPT_NM: '인재개발부',
//     DEPT: 'KBSTAR_190450',
//     APPEL_NM: '수석차장',
//     JBGD_NM: 'L3',
//     JBGD_CD: 'L3'
//   }
// ]
        
        userParam = {
    		"C_NAME_KOR": "KB국민은행",
    		"C_COMPANY_ID": "KBSTAR",
    		"D_DEPARTMENT_KOR": lrnerId_DB.data[0].DEPT_NM,
    		"D_DEPARTMENT_NUMBER": lrnerId_DB.data[0].DEPT,
    		"JD_NAME": "",
    		"JR_RANK_ID": lrnerId_DB.data[0].JBGD_CD,
    		"JT_NAME": "",
    		"JR_NAME": lrnerId_DB.data[0].JBGD_NM,
    		"U_NAME": lrnerId_DB.data[0].LRNER_NM,
    		"U_UCMW_COMPANY_ID": "KB0",
    		"U_USER_ID": lrnerId
    	}
    }
    
    if(!sessionId){
    //sessionId가 null인 경우 welcome으로 처리하자
        dapPayload = {
            chatbot_id : process.env.DAP_CHATBOT_ID, //'81bbd96c-557c-4b6d-939f-6caa84f80a6a'
            user_id: lrnerId,
            parameters: userParam
        };
        
        reqBody = {
            url : `${process.env.DAP_CHATBOT_URL}welcome.do`,
            method : "POST",
            body : dapPayload
          };
    
        suf_fix =  
              [{
                "simpleText": {
                  "text": "카카오톡을 통한 챗봇은 외부망에서 지원되는 관계로 인재개발부 업무에 한하여 답변가능하며, 일부 답변 중 '페이지로 연결'되는 답변은 연결이 안될 수 있습니다."
                }
              }];
    

        
    }else{
    //sessionId가 존재하면 챗팅 continue...
    
          //action의 extra 정보를 확인한다.
          var extra;
          var intent_id = ""; //intent_id
          var intent_type = "";
    
          var ins_id = "";
          var chatflow_id = "";
          var node_id = "";
          var param_id = "";
    
          try{
            extra = bodyJson.action.clientExtra;
            intent_type  = extra.type;
            intent_id = extra.value;
            //intent_id = new Buffer(intent_id).toString("base64");
          }catch(e){
            extra ={type:"",
                    value:"",
                    intent_id:"",
                    chatflow_id:"",
                    node_id:"",
                    param_id:""}
            intent_type  = "";
            intent_id = "";
          }
          
          console.log("extra", JSON.stringify(extra), intent_type, intent_id);
    
    
          if(intent_type=="quick"){
            userMessage = intent_id;
            intent_id = "";
    
          
          }else if(intent_type=="link"){
            
            console.log("link process")
            //link는 내부 연결시 안내사항 후 바로가기 버튼 제시
            extra = bodyJson.action.clientExtra;
            console.log("usermsg", userMessage, intent_id)
    
            let outputs = [
                        {
                            "basicCard": {
                                "title": userMessage,
                                "description": "HR통합 챗봇은 다수의 링크제공이 행내의 WiseNet 정보를 참조하고 있습니다.\n\n카카오톡 HRD챗봇에서는 접근할 수 없는 링크가 있을 수 있습니다.\n\n연결을 원하시면 아래 \"링크 연결하기\"를 선택 해 주세요~~ ",
                                "buttons": [
                                    {
                                        "action": "webLink",
                                        "label": "링크 연결하기",
                                        "webLinkUrl": intent_id
                                    }
                                ]
                            }
                        }
                    ];
    
            retJson.template.outputs=outputs;
            retJson.context = contextSession(HRchatRes.session_id, lrnerId, "-", userParam);
            
            console.log("res:",JSON.stringify( retJson, null, 4))

            const respJson = {
                    statusCode: 200,
                    body: JSON.stringify(retJson),
                };
                
            return respJson;
            
          }else if(intent_type=="slotbtn"){
            
            console.log("slot process")
            //slotbtn은 extra의 모든정보 활용
            extra = bodyJson.action.clientExtra;
    
            userMessage = extra.value;
            console.log("usermsg", userMessage)
            intent_id = extra.intent_id;
            //param_id는 한글로 들어가있으므로 encoding
            // extra.param_id = new Buffer(extra.param_id).toString("base64")
    
          }else {
    
          }

            
        
            // DAP 호출
          dapPayload = {
                "session_id": sessionId,
                "chatbot_id": process.env.DAP_CHATBOT_ID,
                "user_id": "1533872",
                "input_sentence": userMessage,
                "ins_id": ins_id,
                "intent_id": intent_id,
                "chatflow_id": extra.chatflow_id,
                "node_id": extra.node_id,
                "param_id": extra.param_id,
                "parameters": userParam
            }
        
            console.log("DAP CALL", JSON.stringify(dapPayload));

            //DAP 
            //API 안내
            // engine.do - 실운영,
            // engineTest.do - 실운영 테스트 호출 - debug정보를 반환받아 카테고리를 확인 가능함
            //intent_id 로 정보찾기:  http://172.17.157.33:8003/intent/api/{intent_id}/?format=json GET호출
            
            //pea-o-media 서버 postman 이용
            reqBody = {
                url : `${process.env.DAP_CHATBOT_URL}engine.do`,
                method : "POST",
                body : dapPayload
            }
        
    }


    const {data} = await axios.post(
            process.env.POSTMAN_URL, 
            reqBody,
            {
              headers: {'Content-Type': 'application/json; charset=utf-8'}
            }
    );


    console.log("fin")
    // console.log("RESPONSE DAP:", data);

    HRParameters = data.responseSet.result.parameters;
    HRchatRes = data.responseSet.result;
    
    console.log("RESP DAP : ", HRchatRes, HRParameters);
    
    
    //DAP 
    //API 안내
    //intent_id 로 정보찾기:  http://172.17.157.33:8003/intent/api/{intent_id}/?format=json GET호출
    //카테고리 확인하여 category.category_name "인재"로 시작되는 내용만 표시
    // 그외는 intent_alias 와 category_name 을 표시하고 내부 챗봇 이용토록 안내
    //simple_text , image 반영
    
    if(HRchatRes.ref_intent_id){
        
        reqBody = {
                url : `http://172.17.157.33:8003/intent/api/${HRchatRes.ref_intent_id}/?format=json`,
                method : "GET",
                // body : dapPayload
            }
                
        const categoryChk = await axios.post(
                    process.env.POSTMAN_URL, 
                    reqBody,
                    {
                      headers: {'Content-Type': 'application/json; charset=utf-8'}
                    }
                );
        
        console.log("category check", categoryChk.data)    
        
        if(categoryChk.data){
            
            
            let cate =  {
                    "category_name" : categoryChk.data.category.category_name,
                    "intent_name" : categoryChk.data.intent_alias
                    };
                
                
        
            console.log("cateChk", JSON.stringify(reqBody), cate);
            
            if(cate.category_name.indexOf("HR_")>=0||cate.category_name.indexOf("직만_")>=0){
        
                    let outputs = [
                                {
                                    "basicCard": {
                                        "title": userMessage,
                                        "description": `스타런 카카오톡 채널에서 제공하는 HARI(하리)챗봇은 은행 내의 내부망이 아닌 일반 인터넷망에서 제공되는 서비스로 HR부, 직원만족부에서 제공하는 답변은 이용이 제한됩니다.
                                        \n\n요청하신 [${cate.intent_name}]은 [${cate.category_name}]영역에 해당되어 제공 할 수 없습니다. 은행내부의 챗봇을 이용 해 주세요!!`
                                    }
                                }
                            ];
            
                    retJson.template.outputs=outputs;
                    retJson.context = contextSession(HRchatRes.session_id, lrnerId, "-", userParam);
                    
                    console.log("res:",JSON.stringify( retJson, null, 4))
        
                    const respJson = {
                            statusCode: 200,
                            body: JSON.stringify(retJson),
                        };
                        
                    return respJson;
                
            }
        }
        
        
    }
    
    let conv = convHR.HR2KAKAO(HRchatRes, pre_fix, suf_fix);
    
    retJson = conv;


    if (HRchatRes.session_id)
        retJson.context = contextSession(HRchatRes.session_id, lrnerId, "-", userParam);
        
    console.log("RET", JSON.stringify(retJson));

    const respJson = {
            statusCode: 200,
            body: JSON.stringify(retJson),
        };
        
    return respJson;

    // }).catch(function(error){

    //     console.log("error", error);

    //     const respJson = {
    //         statusCode: 200,
    //         body: JSON.stringify(retJson),
    //     };
        
    //     return respJson;
        
    // });
    
    
    
    
    
};
