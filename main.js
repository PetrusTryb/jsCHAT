  window.onerror=function(){
    	M.toast({html:string_error});
  }
  var firebaseConfig = {
    apiKey: "AIzaSyBdK0boacor04eHtkpaOt-o21n-TISqBTw",
    authDomain: "jschat-official.firebaseapp.com",
    databaseURL: "https://jschat-official.firebaseio.com",
    projectId: "jschat-official",
    storageBucket: "jschat-official.appspot.com",
    messagingSenderId: "684850370153",
    appId: "1:684850370153:web:4086f7f88148148d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.usePublicVapidKey("BPDAW6zbeuUv-DLHgb8te4i3WuWATdLYxok79bIZvUL9M08gDTV4HFh_Xp-2AMs5N55xRmzNtL4n3-4mp1zhizY");
  M.AutoInit();
  var messagesRef;
  var metaRef;
  tinymce.init({ selector:'#textedit',plugins: ['media image emoticons autolink charmap code preview'],
    file_picker_types: 'file image media',
    branding: false,
  automatic_uploads: false,
  relative_urls : false,
remove_script_host : false,
  toolbar: 'undo redo | styleselect | bold italic underline | emoticons image media | code preview',
  mobile: {
    theme: 'silver',
    plugins: ['autosave autolink lists'],
  toolbar: 'undo redo | styleselect | bold italic underline | emoticons image media | code preview'
  }
        });
  function createChannel(){
    console.group(string_group_createChannel);
    firebase.database().ref("chan_count").once("value").then(function(snapshot){
      var name = $("#chan_name").val();
      var id=snapshot.val();
    if(name.length==0){
  name=string_default_name+id;
  }
  var items = $(".userSelectorCheckbox");
  var perms = {};
  $.each(items,function(item){
  	if(items[item].checked)
  		perms[items[item].id]="MEMBER";
  	if(items[item].disabled)
  		perms[items[item].id]="ADMIN";
  })  
  var chanJson = {
    name:name,
    permissions:perms,
    messages_count:0
  };
    console.log(chanJson);
    firebase.database().ref("channels/"+id).set(chanJson).then(function(){
      firebase.database().ref("chan_count").set(id+1).then(function(){
        M.toast({html:string_createChannel_success});
        openChannelSelector();
        console.log(string_createChannel_success);
        console.groupEnd(string_group_createChannel);
      })
    })
    })
  }
  function createChannelWindow(){
  	location.hash="create";
  	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/create").set(true);
  	console.group(string_group_createChannelWindow);
  	$("#userSelector").html("");
    firebase.database().ref("users").once('value').then(function(snapshot){
      snapshot.forEach(function(childSnapshot) {
      if(!childSnapshot.val().isDeleted){
      console.log(childSnapshot.val());
      var uid = childSnapshot.key;
      var nick = childSnapshot.val().actualNick;
      var avatar = childSnapshot.val().actualImage;
      if(uid!=firebase.auth().currentUser.uid)
      	$("#userSelector:last-child").append('<tr><td><label><input type="checkbox" class="userSelectorCheckbox" id="'+uid+'"/><span class="black-text"><img class="circle avatar" src="'+avatar+'">'+nick+'</span></label></td></tr>');
      else
      	$("#userSelector:last-child").append('<tr class="yellow accent-2"><td><label><input type="checkbox" checked="checked" disabled="disabled" class="userSelectorCheckbox" id="'+uid+'"/><span class="black-text"><img class="circle avatar" src="'+avatar+'">'+nick+' '+string_you+'</span></label></td></tr>');
  }
  });
      console.log(string_createChannelWindow_success);
      console.groupEnd(string_group_createChannelWindow);
  })

}
function editChannelWindow(){
	location.hash="edit";
	console.group(string_group_editChannelWindow);
	$("#chan_edit_name").val($("#title").html());
	M.updateTextFields();
	$("#userManager").html("");
	firebase.database().ref("channels/"+channelId+"/permissions").once("value").then(function(snapshot){
		console.log(snapshot.val());
		snapshot.forEach(function(user){
			firebase.database().ref("users/"+user.key).once("value").then(function(snapshot){
				var uid = user.key;
				if(uid!="EVERYONE"){
				var nick = snapshot.val().actualNick;
				var avatar = snapshot.val().actualImage;
			}
			else{
				var nick=string_everyone;
				var avatar = "logo_small.png";
			}
				$("#userManager:last-child").append('<tr class="modal-close modal-trigger" href="#userInfo" id="userInfo'+uid+'"><td><img class="circle avatar" src="'+avatar+'">'+nick+''+string_permissions[user.val()]+'</td></tr>');
        $("#userInfo"+uid).click(function(){getUserInfo(uid)});
			})
		})
		console.log(string_editChannelWindow_success);
		console.groupEnd(string_group_editChannelWindow);
	})
}
function renameChannel(){
	console.group(string_group_renameChannel+channelId);
	var newName = $("#chan_edit_name").val();
	console.log(string_new_name+newName);
	if(newName.length>0){
		firebase.database().ref("channels/"+channelId+"/name").set(newName).then(function(){
			M.toast({html:string_renameChannel_success+newName});
			console.log(string_renameChannel_success+newName);
		})
	}
	console.groupEnd(string_group_renameChannel+channelId);
}
  function openChannelSelector(){
  	location.hash="selector";
  	console.group(string_group_openChannelSelector);
    setTitle(string_selector);
    adminOptions(false);
    $("#channelWindow").hide();
    $("#channelSelector").show();
    firebase.database().ref("channels").once('value').then(function(snapshot){
      var table = $("#channelSelectorBody");
      table.html("");
      snapshot.forEach(function(childSnapshot){
        var key=childSnapshot.key;
        var childName = childSnapshot.val().name;
        var permission = childSnapshot.val().permissions[firebase.auth().currentUser.uid];
        if(permission===undefined)
          permission = childSnapshot.val().permissions["EVERYONE"];
      	console.log(key+" ("+childName+"): "+permission);
        if(permission!=undefined){
          table.append("<tr id='join"+key+"'><td>"+childName+"</td><td>"+string_permission[permission]+"</td></tr>");
          $("#join"+key).click(function(){joinChannel(key)});
        }
      })
      console.log(string_openChannelSelector_success);
      console.groupEnd(string_group_openChannelSelector);
      discovery("create");
    })
  }
  function notifyRecivers(){
  	  console.group(string_group_notifyReceivers);
	  var senderNick = $("#nickname").text();
	  var channelName = $("#title").text();
	  console.log(string_conversation+channelName);
	  console.log(string_sender+senderNick);
	  var req = new XMLHttpRequest();
req.open('POST', 'https://jschat.netlify.com/.netlify/functions/notifications', true);
req.setRequestHeader("channelName", channelName);
req.setRequestHeader("senderNick", senderNick);
req.setRequestHeader("channelId",channelId);
req.onreadystatechange = function (aEvt) {
  if (req.readyState == 4) {
     if(req.status == 200)
      console.log(req.responseText);
     else
      console.error(req.responseText);
     console.groupEnd(string_group_notifyReceivers);
      count(firebase.auth().currentUser.uid,"sent_count");
  }
};
req.send(null);	  
  }
  function sendMessage(){
  	console.group(string_group_sendMessage);
    var content = tinyMCE.activeEditor.getContent();
    if(content.length>0){
    firebase.database().ref("channels/"+channelId+"/messages_count").once("value").then(function(snapshot){
      var mId = snapshot.val()+1;
      var messageJson={
        content:content,
        author:firebase.auth().currentUser.uid,
        time:Date.now()
      };
      console.log(messageJson);
      firebase.database().ref("channels/"+channelId+"/messages/"+mId).set(messageJson).then(function(){
        firebase.database().ref("channels/"+channelId+"/messages_count/").set(mId).then(function(){
          M.toast({html:string_sendMessage_success});
          tinyMCE.activeEditor.setContent('');
          console.log(string_sendMessage_success);
          console.groupEnd(string_group_sendMessage);
          notifyRecivers();
        })
      })
    })
  }
  else{
  	console.warn(string_sendMessage_empty);
    M.toast({html:string_sendMessage_empty,classes:"yellow accent-2 red-text"});
    console.groupEnd(string_group_sendMessage);
  }
  }
  function count(uid,type,amount=1){
  	console.group(string_group_count);
    firebase.database().ref("users/"+uid).once("value").then(function(snapshot){
      var value = snapshot.val()[type];
      if(value==undefined)
        value = amount;
      else
        value+=amount;
      firebase.database().ref("users/"+uid+"/"+type).set(value).then(function(){
      	console.log(`${string_count_success} ${uid}/${type} (+ ${amount}).`);
    	console.groupEnd(string_group_count);
      })
    })
  }
  var isAdmin = false;
  function adminOptions(show){
  	console.group(string_group_adminOptions);
    if(show){
      $("#editChannelTrigger1").show();
      $("#editChannelTrigger2").show();
      isAdmin=true;
      console.log(string_adminOptions_show);
    }
    else{
      $("#editChannelTrigger1").hide();
      $("#editChannelTrigger2").hide();
      isAdmin=false;
      console.log(string_adminOptions_hide);
    }
    console.groupEnd(string_group_adminOptions);
  }
  function discovery(feature){
  	console.group(string_group_discovery);
  	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/"+feature).once('value').then(function(snapshot){
  		if(!snapshot.val()){
  			console.log(string_discovery_not_discovered+feature);
  			$(`#${feature}`).tapTarget();
  			$(`#${feature}`).tapTarget('open');
  		}
  		else
  			console.log(string_discovery_discovered);
  		console.groupEnd(string_group_discovery);
  	})
  }
  function actionSend(show){
  	console.group(string_group_actionSend);
    var sendDiv = $("#write");
    var readDiv = $("#messages");
    if(allowEditing&&show&&sendDiv.is(":hidden")){

  	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/sendPanel").set(true);
      sendDiv.show();
      readDiv.height("50vh");
      console.log(string_actionSend_show);
      location.hash="send";
      scrollToBottom();
    }
    else{
      sendDiv.hide();
      readDiv.height("100%");
      console.log(string_actionSend_hide);
      location.hash="messages";
      scrollToBottom();
    }
    console.groupEnd(string_group_actionSend);
  }
  var allowEditing = false;
  function checkPerms(snapshot){
  	console.group(string_group_checkPerms);
    var permission = snapshot[firebase.auth().currentUser.uid];
        if(permission===undefined)
          permission = snapshot["EVERYONE"];
        console.log(string_your_permissions+permission);
        switch(permission){
          case "ADMIN":
            adminOptions(true);
            allowEditing=true;
            $("#openSend").show();
            break;
          case "MEMBER":
            adminOptions(false);
            allowEditing=true;
            $("#openSend").show();
            break;
          case "GUEST":
            adminOptions(false);
            allowEditing=false;
            $("#openSend").hide();
            break;
           default:
           M.toast({html:string_access_denied});
          openChannelSelector();
          metaRef.off();
          messagesRef.off();
          break;
        }
        console.groupEnd(string_group_checkPerms);
  }
  function scrollToBottom(){
  	console.group(string_group_scrollToBottom);
    var div = $("#messages");
    console.log(string_scrollToBottom_messages+div[0].scrollHeight+" px.");
    div.scrollTop(div.scrollHeight);
    console.log(string_scrollToBottom_body+document.body.scrollHeight+ "px.");
    window.scrollTo(0,document.body.scrollHeight);
    console.groupEnd(string_group_scrollToBottom);
  }
  function timeAgo(time){
  	console.group(string_group_timeAgo);
    var output= "";
    var difference=(Date.now()-time);
        var sec = Math.floor(difference/1000);
        var min = Math.floor(sec/60);
        var hour = Math.floor(min/60);
        if(sec<60)
          output+=string_just_now;
        else if(min<60)
          output+=min+string_minutes_ago
        else if(hour<24)
          output+=hour+string_hours_ago;
        else
          output+=new Date(time).toLocaleString();
    console.log(output);
    console.groupEnd(string_group_timeAgo);
    return output;
  }
  
  function ranking(){
  	location.hash="ranking";
  	console.group(string_group_ranking);
    var table = $("#rankingBody");
    table.html("");
    firebase.database().ref("users").once("value").then(function(snapshot){
      var usersRanking = [];
      var myPosition;
      snapshot.forEach(function(user){
        usersRanking.push([user.val().actualNick,user.val().points]);
      });
      usersRanking.sort(function(a, b) {
            return b[1] - a[1];
      });
      var pos = 1;
      usersRanking.forEach(function(entry){
      	console.log(`${pos}.: ${entry[0]}`);
        if(entry[0]==firebase.auth().currentUser.displayName){
          myPosition=pos;
        }
        if(entry[0]!=undefined){
        	table.append("<tr id='rank"+pos+"'><td>"+pos+"</td><td>"+entry[0]+"</td><td>"+entry[1]+"<td/></tr>");
        	pos++;
        }
      })
      console.groupEnd(string_group_ranking);
      $("#ranking1").text(myPosition);
      $("#ranking2").text(myPosition);
      $("#rank"+myPosition).addClass("yellow accent-2");
      try{
      $("#rank1").addClass("amber");
      $("#rank2").addClass("blue-grey");
      $("#rank3").addClass("brown");
    }catch(Error){}
    })
  }
  function getUserInfo(uid,showPermissions=true){
  	console.group(string_group_getUserInfo);
  	location.hash="user";
    var nickField = $("#userInfoNick");
    var activityField = $("#userInfoActivity");
    var avatarField = $("#userInfoAvatar");
    var uidField = $("#userInfoUid");
    var reputationField = $("#userInfoReputation");
    var sentCountField = $("#userInfoSent");
    var deletedSelfCountField = $("#userInfoSelfDeleted");
    if(uid!="EVERYONE")
    firebase.database().ref("users/"+uid).once("value").then(function(snapshot){
      console.log(snapshot.val());
      nickField.html(snapshot.val().actualNick);
      avatarField.attr("src",snapshot.val().actualImage);
      reputationField.html(string_reputation+snapshot.val().points);
      uidField.html(uid);
      if(snapshot.val().sent_count)
        sentCountField.html(string_sent_count+snapshot.val().sent_count);
      else
      	sentCountField.html("");
      if(snapshot.val().deleted_count)
        deletedSelfCountField.html(string_deleted_count+snapshot.val().deleted_count);
      else
      	deletedSelfCountField.html("");
      if(snapshot.val().connections){
        activityField.html(string_user_online);
      }
      else{
        activityField.html(string_user_offline+timeAgo(snapshot.val().lastOnline));
      }
   	  console.groupEnd(string_group_getUserInfo);
    })
	else{
		console.log(uid);
		nickField.html(string_everyone);
		activityField.html(string_everyone_info);
		avatarField.attr("src","logo_small.png");
		uidField.html(uid);
		reputationField.html(string_reputation+"&infin;");
		sentCountField.html("");
		deletedSelfCountField.html("");
		console.groupEnd(string_group_getUserInfo);
	}
	if(showPermissions){
	firebase.database().ref("channels/"+channelId+"/permissions/").once("value").then(function(snapshot){
		var perm = snapshot.val()[uid];
		if(!perm)
			perm=snapshot.val()["EVERYONE"];
		nickField.append(string_permissions[perm]);
		if(isAdmin){
		$("#changeRankButton").show();
		$("#changeRankButton").click(function(){
			changeRankWindow(uid,perm);
		});
	}
	else{
		$("#changeRankButton").hide();
	}
	});
	}
  }
  var newRank;
  function changeRankWindow(uid,currentPermission){
  	console.group(string_group_changeRankWindow);
    location.hash="permissions";
  	console.log(`${uid}: ${currentPermission}`);
  	$("input[value="+currentPermission+"]").prop("checked",true);
    newRank = currentPermission;
    $("input[value='ADMIN']").click(function(){newRank="ADMIN"});
    $("input[value='MEMBER']").click(function(){newRank="MEMBER"});
    $("input[value='GUEST']").click(function(){newRank="GUEST"});
    $("#saveRank").off("click");
    $("#saveRank").click(function(){changeRank(uid)});
  	$("#changeRankNick").html($("#userInfoNick").html());
  	console.groupEnd(string_group_changeRankWindow);
  }
  function changeRank(uid){
    $("#saveRank").off("click");
    console.group(string_group_changeRank+uid);
    console.log(newRank);
    firebase.database().ref("channels/"+channelId+"/permissions/"+uid).set(newRank).then(function(){
      location.hash="user";
      console.groupEnd(string_group_changeRank+uid);
    })
  }
  function getAuthorData(msgId,message){
  	console.group(string_group_getAuthorData);
    firebase.database().ref("users/"+message.author).once("value").then(function(snapshot){
    	console.log(snapshot.val());
    	if(!snapshot.val().isDeleted){
			$("#info"+msgId).html("<a class='modal-trigger grey-text' href='#userInfo'><img class='circle avatar' src='"+snapshot.val().actualImage+"'>"+snapshot.val().actualNick+"</a> &diams; "+timeAgo(message.time));
			$("#info"+msgId).click(function(){
				getUserInfo(message.author);
			})
		}
		else
      		$("#info"+msgId).html("<a class='grey-text'>"+string_account_deleted+"</a> &diams; "+timeAgo(message.time));
      	scrollToBottom();
      	console.groupEnd(string_group_getAuthorData);
    })
  }
  function sendVote(type,id,uid){
  	console.group(string_group_sendVote);
  	$("#upvote").attr("disabled",true);
  	$("#downvote").attr("disabled",true);
  	$("#voteBack").attr("disabled",true);
  	console.log(`${string_group_sendVote} ${type}: ${uid} / ${id}`);
    if(type!=0)
      firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes/"+firebase.auth().currentUser.uid).set(type).then(function(){
        M.toast({html:string_sendVote_success});
        count(uid,"points",type*5);
        console.groupEnd(string_group_sendVote);
      });
    else
      firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes/"+firebase.auth().currentUser.uid).remove().then(function(){
        M.toast({html:string_sendVote_removed});
        console.groupEnd(string_group_sendVote);
      });
  }
  var previousMessage;
  function undo(id){
  	console.group(string_group_undo);
    M.Toast.dismissAll();
    firebase.database().ref("channels/"+channelId+"/messages/"+id).update(previousMessage);
      firebase.database().ref("users/"+previousMessage.author+"/deleted_count").once("value").then(function(snapshot){
        firebase.database().ref("users/"+previousMessage.author+"/deleted_count").set(snapshot.val()-1);
        console.log(string_undo_success);
        console.groupEnd(string_group_undo);
      })
  }
  function removeMessage(id){
  	console.group(string_group_removeMessage);
    M.Toast.dismissAll();
    firebase.database().ref("channels/"+channelId+"/messages/"+id).once("value").then(function(snapshot){
      previousMessage = snapshot.val();
      console.log(previousMessage);
        firebase.database().ref("channels/"+channelId+"/messages/"+id).remove().then(function(){
          firebase.database().ref("users/"+previousMessage.author+"/deleted_count").once("value").then(function(snapshot){
            if(snapshot.val())
              firebase.database().ref("users/"+previousMessage.author+"/deleted_count").set(snapshot.val()+1);
            else
              firebase.database().ref("users/"+previousMessage.author+"/deleted_count").set(1);
          	console.log(string_removeMessage_success+id);
          	console.groupEnd(string_group_removeMessage);
            M.toast({html:string_removeMessage_success+id+" <button class='btn-flat toast-action' id='undo"+id+"'>"+string_undo+"</button>"});
            $("#undo"+id).off("click");
            $("#undo"+id).click(function(){undo(id,false)});
          })
        })
    })
  }
  function contextMenu(id,owner){
  	console.group(string_group_contextMenu);
  	location.hash="context";
    var instance = M.Modal.getInstance($("#messageActions"));
    var votesCount = $("#votes");
    var upvoteButton = $("#upvote");
    var downvoteButton = $("#downvote");
    var myVoteStatus = $("#yourVote");
    var undoVoteButton = $("#voteBack");
    var removeButton = $("#deleteMessage");
    upvoteButton.off("click");
    upvoteButton.click(function(){sendVote(1,id,owner)});
    downvoteButton.off("click");
    downvoteButton.click(function(){sendVote(-1,id,owner)});
    upvoteButton.attr("disabled",false);
    downvoteButton.attr("disabled",false);
    myVoteStatus.html("");
    undoVoteButton.hide();
    firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes").once('value').then(function(snapshot){
    	console.log(snapshot.val());
      if(owner==firebase.auth().currentUser.uid){
          upvoteButton.attr("disabled",true);
          downvoteButton.attr("disabled",true);
          myVoteStatus.html(string_no_voting_for_self);
        }
      if(snapshot.val()){
        var votes = 0;
        snapshot.forEach(function(vote){
          votes+=vote.val();
          if(vote.key=firebase.auth().currentUser.uid){
 			upvoteButton.attr("disabled",true);
         	downvoteButton.attr("disabled",true);
            undoVoteButton.show();
            undoVoteButton.attr("disabled",false);
            if(vote.val()==1){
              myVoteStatus.html(string_reaction_positive);
              undoVoteButton.off("click");
              undoVoteButton.click(function(){sendVote(0,id,owner);count(owner,"points",-5);});
            }
            if(vote.val()==-1){
              myVoteStatus.html(string_reaction_negative);
              undoVoteButton.off("click");
              undoVoteButton.click(function(){sendVote(0,id,owner);count(owner,"points",5)});
            }
          }
        })
        votesCount.text(votes);
      }
      else{
        votesCount.text("0");
      }
      instance.open();
      console.groupEnd(string_group_contextMenu);
    })
    removeButton.click(function(){removeMessage(id)});
    if(isAdmin||owner==firebase.auth().currentUser.uid){
      removeButton.show();
    }
    else{
      removeButton.hide();
    }
    event.preventDefault();
  }
  function autoUpdate(snapshot){
  	console.group(string_group_autoUpdate);
    var messagesDiv = $("#messages");
    messagesDiv.html("");
    if(snapshot.val()!=null)
    snapshot.forEach(function(snap){
    	console.log(snap);
      var msgId = snap.key;
      var message = snap.val();
      if(message.author==firebase.auth().currentUser.uid){
        messagesDiv.append("<div class='my yellow accent-2' id='message"+msgId+"'>"+message.content+"<p class='msgInfo'><a class='modal-trigger grey-text' id='user"+message.author+"' href='#userInfo'><img class='circle avatar' src='"+firebase.auth().currentUser.photoURL+"'>"+string_you+"</a> &diams; "+timeAgo(message.time)+"</p></div>");
        $("#message"+msgId).off("contextmenu");
        $("#message"+msgId).contextmenu(function(){contextMenu(msgId,message.author)})
        $("#user"+message.author).off("click");
        $("#user"+message.author).click(function(){getUserInfo(message.author)});
      }
      else{
        messagesDiv.append("<div class='message' oncontextmenu='contextMenu("+msgId+",\""+message.author+"\")' id='message"+msgId+"'>"+message.content+"<p class='msgInfo' id='info"+msgId+"'></p></div>");
        getAuthorData(msgId,message);
      }
    })
	else
		messagesDiv.html(string_empty_conversation);
      console.groupEnd(string_group_autoUpdate);
  }
  window.onhashchange = function() {
 switch(location.hash){
 	case "#messages":
 		if(channelId!=undefined)
 			joinChannel(channelId);
 		break;
 	case "#selector":
 		setTitle(string_selector);
 		if(messagesRef){
 		messagesRef.off();
    	metaRef.off();
    	}
 		openChannelSelector();
 		break;
  case "#user":

    break;
 }
}
  var channelId;
  var refreshInterval;
  var lastSnapshot;
  function joinChannel(id){
  	console.group(string_group_joinChannel);
  	discovery("sendPanel");
  	$("#messages").html('<div class="progress"><div class="indeterminate"></div></div>');
    $("#channelWindow").show();
    $("#channelSelector").hide();
    actionSend(false);
    metaRef = firebase.database().ref('channels/' + id);
    messagesRef = firebase.database().ref('channels/'+id+'/messages');
    channelId=id;
    location.hash="#messages";
    metaRef.on('value', function(snapshot) {
      setTitle(snapshot.val().name);
      checkPerms(snapshot.val().permissions);
});
    messagesRef.on('value', function(snapshot) {
      lastSnapshot = snapshot;
       autoUpdate(snapshot);
});
    console.log(string_joinChannel_success+id);
    console.groupEnd(string_group_joinChannel);
  }
  function setTitle(title){
  	console.group(string_group_setTitle);
    document.title=title;
    $("#title").html(title);
    console.log(title);
    console.groupEnd(string_group_setTitle);
  }
  function settings(){
  	location.hash="settings";
  	console.group(string_group_settings);
  	console.log(firebase.auth().currentUser);
    $("#settingsNick").html(firebase.auth().currentUser.displayName);
    $("#settingsAvatar").attr("src",firebase.auth().currentUser.photoURL);
    $("#settingsEmail").html(firebase.auth().currentUser.email);
    console.groupEnd(string_group_settings);
  }
  function getMyInfo(){
    getUserInfo(firebase.auth().currentUser.uid);
  }
  function changeNick(){
  	console.group(string_group_changeNick);
    var newNick = $("#edit_nick").val();
    console.log(newNick);
    if(newNick.length>0){
      firebase.auth().currentUser.updateProfile({
        displayName:newNick
      }).then(function(){
        firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
          actualNick:newNick
        }).then(function(){
          M.toast({html:string_changeNick_success});
          console.log(string_changeNick_success);
          console.groupEnd(string_group_changeNick);
        })
      })
    }
  }
  function changePassword(){
  	console.group(string_group_changePassword);
  	var newPassword = $("#new_password").val();
    var password = $("#old_password").val();
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  firebase.auth().currentUser.updatePassword(newPassword).then(function() {
  	console.log(string_changePassword_success);
  	console.groupEnd(string_group_changePassword);
  M.toast({html:string_changePassword_success});
}).catch(function(error) {
	console.error(error.message);
	console.groupEnd(string_group_changePassword);
  M.toast({html:error.message});
});
}).catch(function(error) {
	console.error(error.message);
	console.groupEnd(string_group_changePassword);
  M.toast({html:error.message});
});
}
    function deleteAccount(){
    console.group(string_group_deleteAccount);
    var password = $("#delete_account_password").val();
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  var uid = firebase.auth().currentUser.uid;
  firebase.auth().currentUser.delete().then(function() {
  M.toast({html:string_account_deleted});
  firebase.database().ref("users/"+uid).remove();
  firebase.database().ref("tokens/"+uid).remove();
  console.log(":(");
  console.groupEnd(string_group_deleteAccount);
}).catch(function(error) {
  M.toast({html:error.message});
  console.error(error.message);
  console.groupEnd(string_group_deleteAccount);
});
}).catch(function(error) {
  M.toast({html:error.message});
  console.error(error.message);
  console.groupEnd(string_group_deleteAccount);
});
  }
  function changeEmail(){
  	console.group(string_group_changeEmail);
    var newEmail = $("#edit_email").val();
    var password = $("#edit_email_password").val();
    console.log(newEmail);
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  firebase.auth().currentUser.updateEmail(newEmail).then(function() {
  M.toast({html:string_changeEmail_success});
  console.log(string_changeEmail_success);
  console.groupEnd(string_group_changeEmail);
}).catch(function(error) {
  M.toast({html:error.message});
  console.error(error.message);
  console.groupEnd(string_group_changeEmail);
});
}).catch(function(error) {
	M.toast({html:error.message});
	console.error(error.message);
	console.groupEnd(string_group_changeEmail);
});
  }
  function changeAvatar(){
  	console.group(string_group_changeAvatar);
    var AvatarRef = firebase.storage().ref(firebase.auth().currentUser.uid+"/avatar"+Math.floor(Math.random()*10));
    var file = $("#upload_avatar")[0].files[0];
    var uploadTask = AvatarRef.put(file);
    var progressBar = $("#upload_avatar_progress");
    var progressText = $("#upload_avatar_state");
    progressBar.width("0%");
    uploadTask.on('state_changed', function(snapshot){
  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100 + "%";
  console.log(progress);
  progressBar.width(progress);
  console.log(snapshot.state);
  switch (snapshot.state) {
    case firebase.storage.TaskState.PAUSED:
      progressText.html(progress+", "+string_upload_paused);
      break;
    case firebase.storage.TaskState.RUNNING:
      progressText.html(progress+", "+string_upload_running);
      break;
  }
}, function(error) {
	console.error(error.message);
  M.toast({html:error.message});
  console.groupEnd(string_group_changeAvatar);
}, function() {
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    console.log(downloadURL);
    firebase.auth().currentUser.updateProfile({
      photoURL:downloadURL
    }).then(function(){
      firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
        actualImage:downloadURL
      }).then(function(){
      	progressBar.width("0%");
      	progressText.html("");
      	console.log(string_changeAvatar_success);
        M.toast({html:string_changeAvatar_success});
        console.groupEnd(string_group_changeAvatar);
      })
    })
  });
});
  }
  function resetAvatar(){
  	console.group(string_group_resetAvatar);
    firebase.auth().currentUser.updateProfile({
      photoURL:"logo_small.png"
    }).then(function(){
      firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
        actualImage:"logo_small.png"
      }).then(function(){
        M.toast({html:string_resetAvatar_success});
        console.log(string_resetAvatar_success);
        console.groupEnd(string_group_resetAvatar);
      })
    })
  }
  var userdbRef;
  function getAccountConfig(user){
  	console.group(string_group_getAccountConfig);
    if(user.displayName==null){
    	console.log(string_first_login);
    	console.log(string_group_changeNick+": "+$("#nick").val());
      user.updateProfile({
  displayName: $("#nick").val(),
  photoURL:"logo_small.png"
}).then(function() {
  firebase.database().ref("users/"+user.uid).set({
    "points":0,
    "actualNick":$("#nick").val(),
    "actualImage":"logo_small.png"
  }).then(function(){
  	console.log(string_getAccountConfig_success);
  	console.groupEnd(string_group_getAccountConfig);
    getAccountConfig(user);
  })
});
  }
  else{
  	console.log(string_second_login);
    $("#avatar").attr("src",user.photoURL);
    $("#nickname").html(user.displayName);
    $("#edit_nick").val(user.displayName);
    $("#userEmail").html(user.email);
    M.updateTextFields();
    $("#unlogged").hide();
    $("#logged").show();
    $("#loader").hide();
    console.groupEnd(string_group_getAccountConfig);
  }
}
messaging.onTokenRefresh(() => {
	console.group(string_group_onTokenRefresh);
  messaging.getToken().then((refreshedToken) => {
    console.log(refreshedToken);
  firebase.database().ref("tokens/"+firebase.auth().currentUser.uid).set(refreshedToken);
  console.groupEnd(string_group_onTokenRefresh);
  }).catch((err) => {
    console.error(err);
    console.groupEnd(string_group_onTokenRefresh);
  });
});

messaging.onMessage((payload) => {
	console.group(string_group_onMessage);
  console.log(payload);
  console.groupEnd(string_group_onMessage);
});

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    firebase.database().goOnline();
    Notification.requestPermission().then((permission) => {
    	console.log(permission);
  if (permission === 'granted') {
    messaging.getToken().then((currentToken) => {
  if (currentToken) {
    console.log(currentToken);
    M.toast({html:string_push_permission_granted,classes:"green darken-4",displayLength:200});
    M.toast({html:currentToken,classes:"blue accent-2",displayLength:200});
  firebase.database().ref("tokens/"+firebase.auth().currentUser.uid).set(currentToken);
  } else {
    console.error(string_push_token_unavaiable);
  }
}).catch((err) => {
  console.error(err);
});
  } else {
    console.error(string_push_permission_denied);
    M.toast({html:string_push_permission_denied,classes:"yellow accent-2 red-text"});
  }
});
    var myConnectionsRef = firebase.database().ref('users/'+user.uid+'/connections');
var lastOnlineRef = firebase.database().ref('users/'+user.uid+'/lastOnline');
var connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', function(snap) {
  if (snap.val() === true) {
    var con = myConnectionsRef.push();
    con.onDisconnect().remove();
    con.set(true);
    lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
  }
});
    userdbRef=firebase.database().ref("users/"+user.uid);
    userdbRef.on('value', function(snapshot) {
  getAccountConfig(user,snapshot);
});
    openChannelSelector();
  } else {
    console.log(string_not_logged_in);
    $("#logged").hide();
    $("#unlogged").show();
    $("#loader").hide();
  }
});
  function register(){
  	console.group(string_group_register);
    var nick = $("#nick").val();
    console.log(nick);
    var email = $("#email").val();
    console.log(email);
    var password = $("#password").val();
    if(nick.length>0){
    $("#loader").show();
    $("#unlogged").hide();
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
    	console.groupEnd(string_group_register);
    }).catch(function(error) {
  console.error(error.code);
  M.toast({html:error.message});
  $("#loader").hide();
  $("#unlogged").show();
  console.groupEnd(string_group_register);
});
}
  else{
    M.toast({html: string_register_empty_nick});
    console.groupEnd(string_group_register);
  }
  }
  function login(){
  	console.group(string_group_login);
    var email = $("#login_email").val();
    var password = $("#login_password").val();
    console.log(email);
    $("#loader").show();
    $("#unlogged").hide();
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
    	console.groupEnd(string_group_login);
    }).catch(function(error) {
  console.error(error.code);
  M.toast({html: error.message});
  $("#loader").hide();
  $("#unlogged").show();
  console.groupEnd(string_group_login);
});
  }
  function logOut(){
  	console.group(string_group_logOut);
    $("#loader").show();
    $("#logged").hide();
    firebase.database().goOffline();
    firebase.auth().signOut().then(function(){
    	console.groupEnd(string_group_logOut);
    });
  }
  function password_reset(){
  	console.group(string_group_password_reset);
    var email = $("#recovery_email").val();
    console.log(email);
    firebase.auth().sendPasswordResetEmail(email).then(function() {
  M.toast({html: string_password_reset_success+email});
  console.groupEnd(string_group_password_reset);
}).catch(function(error) {
  console.error(error.code);
  M.toast({html:error.message});
  console.groupEnd(string_group_password_reset);
});
  }