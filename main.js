  window.onerror=function(){
    M.toast({html:"<i class='material-icons'>error</i> Błąd!"});
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
  //M.toast({html:"Logowanie...",displayLength:500});
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
    plugins: ['media image emoticons autolink charmap code'],
  images_upload_url: 'upload.php',
  automatic_uploads: false,
  toolbar: 'undo redo | styleselect | bold italic underline | emoticons image media | code preview'
  }
        });
  function createChannel(){
    console.group("Tworzenie konwersacji");
    firebase.database().ref("chan_count").once("value").then(function(snapshot){
      var name = $("#chan_name").val();
      var id=snapshot.val();
    if(name.length==0){
  name="Konwersacja #"+id;
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
        M.toast({html:"Konwersacja została utworzona."});
        openChannelSelector();
        console.info("Zakończono powodzeniem.");
        console.groupEnd("Tworzenie konwersacji");
      })
    })
    })
  }
  function createChannelWindow(){
  	console.group("Okno tworzenia konwersacji");
  	$("#userSelector").html("");
    firebase.database().ref("users").once('value').then(function(snapshot){
      snapshot.forEach(function(childSnapshot) {
      console.log(childSnapshot.val());
      var uid = childSnapshot.key;
      var nick = childSnapshot.val().actualNick;
      var avatar = childSnapshot.val().actualImage;
      if(uid!=firebase.auth().currentUser.uid)
      	$("#userSelector:last-child").append('<tr><td><label><input type="checkbox" class="userSelectorCheckbox" id="'+uid+'"/><span class="black-text"><img class="circle avatar" src="'+avatar+'">'+nick+'</span></label></td></tr>');
      else
      	$("#userSelector:last-child").append('<tr class="yellow accent-2"><td><label><input type="checkbox" checked="checked" disabled="disabled" class="userSelectorCheckbox" id="'+uid+'"/><span class="black-text"><img class="circle avatar" src="'+avatar+'">'+nick+' (Ty)</span></label></td></tr>');
  });
      console.info("Zakończono ładowanie listy użytkowników.");
      console.groupEnd("Okno tworzenia konwersacji");
  })

}
function editChannelWindow(){
	console.group("Okno właściwości konwersacji");
	$("#chan_edit_name").val($("#title").html());
	M.updateTextFields();
	$("#userManager").html("");
	firebase.database().ref("channels/"+channelId+"/permissions").once("value").then(function(snapshot){
		console.log(snapshot.val());
		snapshot.forEach(function(user){
			//if(user.key!="EVERYONE")
			firebase.database().ref("users/"+user.key).once("value").then(function(snapshot){
				var uid = user.key;
				if(uid!="EVERYONE"){
				var nick = snapshot.val().actualNick;
				var avatar = snapshot.val().actualImage;
			}
			else{
				var nick="<i>Wszyscy</i>";
				var avatar = "logo_small.png";
			}
				switch(user.val()){
					case "ADMIN":
						$("#userManager:last-child").append('<tr onclick="getUserInfo(\''+uid+'\')" class="modal-trigger" href="#userInfo"><td><img class="circle avatar" src="'+avatar+'">'+nick+'</td><td><i class="material-icons">star</i> Administrator</td></tr>');
						break;
					case "MEMBER":
						$("#userManager:last-child").append('<tr onclick="getUserInfo(\''+uid+'\')" class="modal-trigger" href="#userInfo"><td><img class="circle avatar" src="'+avatar+'">'+nick+'</td><td><i class="material-icons">message</i> Członek</td></tr>');
						break;
					case "GUEST":
						$("#userManager:last-child").append('<tr onclick="getUserInfo(\''+uid+'\')" class="modal-trigger" href="#userInfo"><td><img class="circle avatar" src="'+avatar+'">'+nick+'</td><td><i class="material-icons">block</i> Wyciszony</td></tr>');
						break;
				}
				
			})
		})
		console.info("Załadowano informacje o uprawnieniach.");
		console.groupEnd("Okno właściwości konwersacji");
	})
}
function renameChannel(){
	console.group("Zmiana nazwy kanału #"+channelId);
	var newName = $("#chan_edit_name").val();
	console.log("Nowa nazwa: "+newName);
	if(newName.length>0){
		firebase.database().ref("channels/"+channelId+"/name").set(newName).then(function(){
			M.toast({html:"Zmieniono nazwę kanału na: "+newName});
			console.info("Zakończono powodzeniem.");
		})
	}
	console.groupEnd("Zmiana nazwy kanału #"+channelId);
}
  function openChannelSelector(){
  	console.group("Selektor konwersacji");
    setTitle("Konwersacje");
    adminOptions(false);
    $("#channelWindow").hide();
    $("#channelSelector").show();
    firebase.database().ref("channels").once('value').then(function(snapshot){
      var table = $("#channelSelectorBody");
      table.html("");
      snapshot.forEach(function(childSnapshot){
        key=childSnapshot.key;
        var childName = childSnapshot.val().name;
        var permission = childSnapshot.val().permissions[firebase.auth().currentUser.uid];
        if(permission===undefined)
          permission = childSnapshot.val().permissions["EVERYONE"];
      	console.log(key+" ("+childName+"): "+permission);
        if(permission!=undefined){
          var permText;
          switch(permission){
            case "ADMIN":
              permText='<i class="small material-icons" style="width:25px">star_rate</i> Administrator';
              break;
            case "MEMBER":
              permText='<i class="small material-icons" style="width:25px">message</i> Członek';
              break;
            case "GUEST":
              permText='<i class="small material-icons" style="width:25px">remove_red_eyes</i> Gość';
              break;
          }
          table.append("<tr onclick='joinChannel("+key+")'><td>"+childName+"</td><td>"+permText+"</td></tr>");
          
        }
      })
      discoveryCreate();

      console.info("Wczytywanie dostępnych kanałów czatu powiodło się.");
      console.groupEnd("Selektor konwersacji");
    })
  }
  function notifyRecivers(){
  	  console.group("Wysyłanie powiadomień");
	  var senderNick = $("#nickname").text();
	  var channelName = $("#title").text();
	  console.log("Kanał: "+channelName);
	  console.log("Nadawca: "+senderNick);
	  var receivers = "";
	  firebase.database().ref("channels/"+channelId+"/permissions").once("value").then(function(snapshot){
	  	snapshot.forEach(function(child){
	  		receivers+=child.key+";";
	  	})
	  	console.log("Odbiorcy: "+receivers);
	  	var req = new XMLHttpRequest();
req.open('POST', 'https://jschat.netlify.com/.netlify/functions/notifications', true);
req.setRequestHeader("channel", channelName);
req.setRequestHeader("sender", senderNick);
req.setRequestHeader("receivers",receivers);
req.onreadystatechange = function (aEvt) {
  if (req.readyState == 4) {
     if(req.status == 200)
      console.info(req.responseText);
     else
      console.error(req.responseText);
  	console.groupEnd("Wysyłanie powiadomień");
  }
};
req.send(null);
	  })
	  
  }
  function sendMessage(){
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
          M.toast({html:"Wiadomość została wysłana."});
          tinyMCE.activeEditor.setContent('');
          countMessage(firebase.auth().currentUser.uid,"SENT");
        })
      })
    })
  }
  else{
    M.toast({html:"Nie wolno wysyłać pustych wiadomości.",classes:"yellow accent-2 red-text"});
  }
  }
  function countMessage(uid,type){
    firebase.database().ref("users/"+uid).once("value").then(function(snapshot){
      switch(type){
      case "SENT":
      var sent = snapshot.val().sent_count;
      if(sent==undefined)
        sent = 1;
      else
        sent++;
      firebase.database().ref("users/"+uid).update({
        sent_count:sent
      })
        break;
    }
    })
    
  }
  var isAdmin = false;
  function adminOptions(show){
    if(show){
      document.getElementById("editChannelTrigger1").style.display="block";
      document.getElementById("editChannelTrigger2").style.display="block";
      isAdmin=true;
    }
    else{
      document.getElementById("editChannelTrigger1").style.display="none";
      document.getElementById("editChannelTrigger2").style.display="none";
      isAdmin=false;
    }
  }

  function discoverySend(){
    firebase.database().ref("sendDiscovery").once('value').then(function(snapshot){
    	var alreadyDiscovered = true;
    	try{
      if(snapshot.val()[firebase.auth().currentUser.uid]!=true){
        alreadyDiscovered=false;
      }
  }catch(Error){
  	alreadyDiscovered=false;
  }
  if(!alreadyDiscovered){
  	var elems = document.querySelectorAll('#tapToWrite');
        var instances = M.TapTarget.init(elems);
        instances[0].open();
        firebase.database().ref("sendDiscovery/"+firebase.auth().currentUser.uid).set(true);
  }
    })
  }
  function discoveryCreate(){
    firebase.database().ref("createDiscovery").once('value').then(function(snapshot){
    	var alreadyDiscovered = true;
    	try{
      if(snapshot.val()[firebase.auth().currentUser.uid]!=true){
        alreadyDiscovered=false;
      }
}catch(Error){
	alreadyDiscovered=false;
}
if(!alreadyDiscovered){
	var elems = document.querySelectorAll('#tapToCreate');
        var instances = M.TapTarget.init(elems);
        instances[0].open();
        firebase.database().ref("createDiscovery/"+firebase.auth().currentUser.uid).set(true);
}
    })
  }
  function actionSend(show){
    var sendDiv = document.getElementById("write");
    var readDiv = document.getElementById("messages");
    if(allowEditing&&show&&sendDiv.style.display!="block"){
      sendDiv.style.display="block";
      readDiv.style.height="50vh";
      scrollToBottom();
    }
    else{
      sendDiv.style.display="none";
      readDiv.style.height="100%";
      scrollToBottom();
    }
  }
  var allowEditing = false;
  function checkPerms(snapshot){
    var permission = snapshot[firebase.auth().currentUser.uid];
        if(permission===undefined)
          permission = snapshot["EVERYONE"];
        if(permission===undefined){
          M.toast({html:"Nie masz dostępu do tej konwersacji."});
          openChannelSelector();
          metaRef.off();
          messagesRef.off();
          return;
        }
        
        switch(permission){
          case "ADMIN":
            adminOptions(true);
            allowEditing=true;
            discoverySend();
            break;
          case "MEMBER":
            adminOptions(false);
            allowEditing=true;
            discoverySend();
            break;
          case "GUEST":
            adminOptions(false);
            allowEditing=false;
            break;
        }
  }
  function scrollToBottom(){
    var div = document.getElementById("messages");
    div.scrollTop=div.scrollHeight;
    window.scrollTo(0,document.body.scrollHeight);
    M.AutoInit();
  }
  function timeAgo(time){
    var output= "";
    var difference=(Date.now()-time);
        var sec = Math.floor(difference/1000)//+" sekund temu.";
        var min = Math.floor(sec/60)//+" minut temu.";
        var hour = Math.floor(min/60)//+" godzin temu.";
        if(sec<60)
          output+="przed chwilą";
        else if(min<60)
          output+=min+" minut(y) temu";
        else if(hour<24)
          output+=hour+" godzin(y) temu";
        else
          output+=new Date(time).toLocaleString();
    return output;
  }
  
  function ranking(){
    var table = document.getElementById("rankingBody");
    table.innerHTML="";
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
        if(entry[0]==firebase.auth().currentUser.displayName){
          myPosition=pos;
        }
        if(entry[0]!=undefined){
        	table.innerHTML+="<tr id='rank"+pos+"'><td>"+pos+"</td><td>"+entry[0]+"</td><td>"+entry[1]+"<td/></tr>";
        	pos++;
        }
      })
      //M.toast({html:"Masz "+myPosition+". miejsce."});
      document.getElementById("ranking1").innerHTML=myPosition;
      document.getElementById("ranking2").innerHTML=myPosition;
      document.getElementById("rank"+myPosition).style.fontWeight="bold";
      document.getElementById("rank"+myPosition).className="yellow accent-2";
      try{
      document.getElementById("rank1").className="amber";
      document.getElementById("rank2").className="blue-grey";
      document.getElementById("rank3").className="brown";
    }catch(Error){}
    })
  }
  function getUserInfo(uid){
    var nickField = document.getElementById("userInfoNick");
    var activityField = document.getElementById("userInfoActivity");
    var avatarField = document.getElementById("userInfoAvatar");
    var uidField = document.getElementById("userInfoUid");
    var reputationField = document.getElementById("userInfoReputation");
    var sentCountField = document.getElementById("userInfoSent");
    var deletedSelfCountField = document.getElementById("userInfoSelfDeleted");
    var deletedByAdminCountField = document.getElementById("userInfoAdminDeleted");

    firebase.database().ref("users/"+uid).once("value").then(function(snapshot){
      nickField.innerHTML=snapshot.val().actualNick;
      avatarField.src=snapshot.val().actualImage;
      reputationField.innerHTML="Reputacja: "+snapshot.val().points;
      uidField.innerHTML=uid;
      if(snapshot.val().sent_count)
        sentCountField.innerHTML="Wysłanych wiadomości: "+snapshot.val().sent_count;
      if(snapshot.val().selfDeleted_count)
        deletedSelfCountField.innerHTML="Usuniętych samodzielnie: "+snapshot.val().selfDeleted_count;
      if(snapshot.val().adminDeleted_count)
        deletedByAdminCountField.innerHTML="Usuniętych przez administratorów: "+snapshot.val().adminDeleted_count;
      if(snapshot.val().connections){
        activityField.innerHTML="<span style='color:green'>Aktywny teraz</span>";
      }
      else{
        //new Date(snapshot.val().lastOnline).toLocaleString()
        activityField.innerHTML="Ostatnio był aktywny: ";
        //printTimeAgo(snapshot.val().lastOnline,activityField);
        activityField.innerHTML+=timeAgo(snapshot.val().lastOnline);
      }
    })
  }
  function getAuthorData(msgId,message){
    firebase.database().ref("users/"+message.author).once("value").then(function(snapshot){
    	try{
    	  if(snapshot.val().actualNick)
          	document.getElementById("info"+msgId).innerHTML="<a class='modal-trigger grey-text' href='#userInfo' onclick='getUserInfo(\""+message.author+"\")'><img class='circle' style='width:24px; height:24px' src='"+snapshot.val().actualImage+"'>"+snapshot.val().actualNick+"</a> &diams; "+timeAgo(message.time);
          else
          	document.getElementById("info"+msgId).innerHTML="<a class='grey-text'>"+"<i>Konto usunięte "+timeAgo(snapshot.val().lastOnline)+"</i>"+"</a> &diams; "+timeAgo(message.time);
      }catch(Error){
      	document.getElementById("info"+msgId).innerHTML="<a class='grey-text'>"+"<i>Konto usunięte</i>"+"</a> &diams; "+timeAgo(message.time);
      }
      scrollToBottom();
        })
  }
  function givePoints(uid,amount){
    firebase.database().ref("users/"+uid+"/points").once("value").then(function(snapshot){
      var newBalance = snapshot.val()+amount;
      //console.log(newBalance);
      firebase.database().ref("users/"+uid+"/points").set(newBalance);
    })
  }
  function sendVote(type,id,uid){
    //console.log("vote type "+type+" id: "+id);
    if(type!=0)
      firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes/"+firebase.auth().currentUser.uid).set(type).then(function(){
        M.toast({html:"Twój głos został przesłany."});
        givePoints(uid,type*5);
      });
    else
      firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes/"+firebase.auth().currentUser.uid).remove().then(function(){
        M.toast({html:"Twój głos został usunięty."});
      });
  }
  var previousMessage;
  function undo(id,penalty){
    M.Toast.dismissAll();
    firebase.database().ref("channels/"+channelId+"/messages/"+id).update(previousMessage);
    if(!penalty){
      firebase.database().ref("users/"+previousMessage.author+"/selfDeleted_count").once("value").then(function(snapshot){
        firebase.database().ref("users/"+previousMessage.author+"/selfDeleted_count").set(snapshot.val()-1);
      })
    }
    else{
      firebase.database().ref("users/"+previousMessage.author+"/adminDeleted_count").once("value").then(function(snapshot){
        firebase.database().ref("users/"+previousMessage.author+"/adminDeleted_count").set(snapshot.val()-1);
      })
    }
  }
  function removeMessage(id){
    M.Toast.dismissAll();
    firebase.database().ref("channels/"+channelId+"/messages/"+id).once("value").then(function(snapshot){
      previousMessage = snapshot.val();
      
        firebase.database().ref("channels/"+channelId+"/messages/"+id).remove().then(function(){
          
          if(previousMessage.author==firebase.auth().currentUser.uid)
          firebase.database().ref("users/"+previousMessage.author+"/selfDeleted_count").once("value").then(function(snapshot){
            if(snapshot.val())
              firebase.database().ref("users/"+previousMessage.author+"/selfDeleted_count").set(snapshot.val()+1);
            else
              firebase.database().ref("users/"+previousMessage.author+"/selfDeleted_count").set(1);
            M.toast({html:"Usunięto wiadomość. <button class='btn-flat toast-action' onclick='undo("+id+",false)'>Cofnij</button>"});
          })
          else if(isAdmin)
          firebase.database().ref("users/"+previousMessage.author+"/adminDeleted_count").once("value").then(function(snapshot){
            if(snapshot.val())
              firebase.database().ref("users/"+previousMessage.author+"/adminDeleted_count").set(snapshot.val()+1);
            else
              firebase.database().ref("users/"+previousMessage.author+"/adminDeleted_count").set(1);
            M.toast({html:"Usunięto wiadomość. <button class='btn-flat toast-action' onclick='undo("+id+",true)'>Cofnij</button>"});
          })
        })
      

      
    })
  }
  function contextMenu(id,owner){
    var instance = M.Modal.getInstance(document.getElementById("messageActions"));
    var votesCount = document.getElementById("votes");
    var upvoteButton = document.getElementById("upvote");
    var downvoteButton = document.getElementById("downvote");
    var myVoteStatus = document.getElementById("yourVote");
    var undoVoteButton = document.getElementById("voteBack");
    var removeButton = document.getElementById("deleteMessage");
    
    upvoteButton.onclick=function(){sendVote(1,id,owner)};
    downvoteButton.onclick=function(){sendVote(-1,id,owner)};
    upvoteButton.disabled=false;
    downvoteButton.disabled=false;
    myVoteStatus.innerHTML="";
    undoVoteButton.style.display="none";
    firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes").once('value').then(function(snapshot){
      if(owner==firebase.auth().currentUser.uid){
          upvoteButton.disabled=true;
          downvoteButton.disabled=true;
          myVoteStatus.innerHTML="Nie możesz reagować na własne wiadomości.";
        }
      if(snapshot.val()){
        var votes = 0;
        
        snapshot.forEach(function(vote){
          votes+=vote.val();
          if(vote.key=firebase.auth().currentUser.uid){
            upvoteButton.disabled=true;
            downvoteButton.disabled=true;
            undoVoteButton.style.display="initial";
            
            if(vote.val()==1){
              myVoteStatus.innerHTML="Zareagowałeś pozytywnie.";
              undoVoteButton.onclick=function(){sendVote(0,id,owner);givePoints(owner,-5);};
            }
            if(vote.val()==-1){
              myVoteStatus.innerHTML="Zareagowałeś negatywnie.";
              undoVoteButton.onclick=function(){sendVote(0,id,owner);givePoints(owner,5);};
            }
          }
        })
        votesCount.innerHTML=votes;
      }
      else{
        votesCount.innerHTML="0";
      }
      instance.open();
    })
    removeButton.onclick=function(){removeMessage(id);};
    if(isAdmin||owner==firebase.auth().currentUser.uid){
      removeButton.style.display="block";
    }
    else{
      removeButton.style.display="none";
    }
    event.preventDefault();
  }
  function autoUpdate(snapshot){
    //console.log(snapshot.val());
    
    //console.log(permission);
    
    var messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML="";
    if(snapshot!=undefined)
    snapshot.forEach(function(snap){
      var msgId = snap.key;
      var message = snap.val();
      if(message.author==firebase.auth().currentUser.uid){
        messagesDiv.innerHTML+="<div class='my yellow accent-2' oncontextmenu='contextMenu("+msgId+",\""+message.author+"\")' id='message"+msgId+"'>"+message.content+"<p class='msgInfo'><a class='modal-trigger grey-text' href='#userInfo' onclick='getUserInfo(\""+message.author+"\")'><img class='circle' style='width:24px; height:24px' src='"+firebase.auth().currentUser.photoURL+"'>Ty</a> &diams; "+timeAgo(message.time)+"</p></div>";
      }
      else{
        messagesDiv.innerHTML+="<div class='message' oncontextmenu='contextMenu("+msgId+",\""+message.author+"\")' id='message"+msgId+"'>"+message.content+"<p class='msgInfo' id='info"+msgId+"'></p></div>";
        getAuthorData(msgId,message);
      	
      }
    })
	else
		messagesDiv.innerHTML="<p class='center'>Ta konwersacja jest pusta. Napisz coś...</p>"
  }
  window.onhashchange = function() {
 switch(location.hash){
 	case "#messages":
 		if(channelId!=undefined)
 			joinChannel(channelId);
 		break;
 	default:
 		setTitle("Konwersacje");
 		messagesRef.off();
    metaRef.off();
    clearInterval(refreshInterval);
 		openChannelSelector();
 		break;
 }
}
  var channelId;
  var refreshInterval;
  var lastSnapshot;
  function joinChannel(id){
  	document.getElementById("messages").innerHTML='<div class="progress"><div class="indeterminate"></div></div>';
    document.getElementById("channelWindow").style.display="block";
    document.getElementById("channelSelector").style.display="none";
    actionSend(false);
    metaRef = firebase.database().ref('channels/' + id);
    messagesRef = firebase.database().ref('channels/'+id+'/messages');
    channelId=id;
    location.hash="#messages";
    metaRef.on('value', function(snapshot) {
      setTitle(snapshot.val().name);
      checkPerms(snapshot.val().permissions);
       //autoUpdate(snapshot.val().messages);
});
    messagesRef.on('value', function(snapshot) {
      lastSnapshot = snapshot;
       autoUpdate(snapshot);
});
    refreshInterval = setInterval(autoUpdate(lastSnapshot),60000);
  }
  function setTitle(title){
    document.title=title;
    document.getElementById("title").innerHTML=title;
  }
  function settings(){
      document.getElementById("settingsNick").innerHTML=firebase.auth().currentUser.displayName;
      document.getElementById("settingsAvatar").src=firebase.auth().currentUser.photoURL;
      document.getElementById("settingsEmail").innerHTML=firebase.auth().currentUser.email;
  }
  function getMyInfo(){
    getUserInfo(firebase.auth().currentUser.uid);
  }
  function changeNick(){
    var newNick = document.getElementById("edit_nick").value;
    if(newNick.length>0){
      firebase.auth().currentUser.updateProfile({
        displayName:newNick
      }).then(function(){
        firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
          actualNick:newNick
        }).then(function(){
          M.toast({html:"Gotowe!"});
        })
      })
    }
  }
  function changePassword(){
  	var newPassword = document.getElementById("new_password").value;
    var password = document.getElementById("old_password").value;
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
    if(newPassword.length>0){
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  // User re-authenticated.
  firebase.auth().currentUser.updatePassword(newPassword).then(function() {
  // Update successful.
  M.toast({html:"Twoje hasło zostało zmienione."})
}).catch(function(error) {
  M.toast({html:error.message});
});
}).catch(function(error) {
  M.toast({html:error.message})
});
      
    }
}
    function deleteAccount(){
    var password = document.getElementById("delete_account_password").value;
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  // User re-authenticated.
  var uid = firebase.auth().currentUser.uid;
  firebase.auth().currentUser.delete().then(function() {
  // Update successful.
  M.toast({html:"Twoje konto zostało usunięte."});
  firebase.database().ref("users/"+uid).remove();
  firebase.database().ref("tokens/"+uid).remove();
  firebase.database().ref("createDiscovery/"+uid).remove();
  firebase.database().ref("sendDiscovery/"+uid).remove();
}).catch(function(error) {
  M.toast({html:error.message});
});
}).catch(function(error) {
  M.toast({html:error.message})
});
  }
  function changeEmail(){
    var newEmail = document.getElementById("edit_email").value;
    var password = document.getElementById("edit_email_password").value;
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
    if(newEmail.length>0){
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  // User re-authenticated.
  firebase.auth().currentUser.updateEmail(newEmail).then(function() {
  // Update successful.
  M.toast({html:"Gotowe. Sprawdź skrzynkę odbiorczą."})
}).catch(function(error) {
  M.toast({html:error.message});
});
}).catch(function(error) {
  M.toast({html:error.message})
});
      
    }
  }
  function changeAvatar(){
    var AvatarRef = firebase.storage().ref(firebase.auth().currentUser.uid+"/avatar"+Math.floor(Math.random()*10));
    var file = document.getElementById("upload_avatar").files[0];
    var uploadTask = AvatarRef.put(file);
    var progressBar = document.getElementById("upload_avatar_progress");
    var progressText = document.getElementById("upload_avatar_state");
    progressBar.style.width="0%";
    uploadTask.on('state_changed', function(snapshot){
  // Observe state change events such as progress, pause, and resume
  // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  console.log('Upload is ' + progress + '% done');
  progressBar.style.width=progress+"%";
  switch (snapshot.state) {
    case firebase.storage.TaskState.PAUSED: // or 'paused'
      console.log('Upload is paused');
      progressText.innerHTML="Przesyłanie wstrzymane. Sprawdź połączenie.";
      break;
    case firebase.storage.TaskState.RUNNING: // or 'running'
      console.log('Upload is running');
      progressText.innerHTML="Przesyłanie zdjęcia...";
      break;
  }
}, function(error) {
  // Handle unsuccessful uploads
  M.toast({html:"Przesyłanie nie powiodło się."});
}, function() {
  // Handle successful uploads on complete
  // For instance, get the download URL: https://firebasestorage.googleapis.com/...
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    console.log('File available at: '+ downloadURL);
    firebase.auth().currentUser.updateProfile({
      photoURL:downloadURL
    }).then(function(){
      firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
        actualImage:downloadURL
      }).then(function(){
        M.toast({html:"Twój awatar został przesłany."});
      })
    })
  });
});
  }
  function resetAvatar(){
    firebase.auth().currentUser.updateProfile({
      photoURL:"logo_small.png"
    }).then(function(){
      firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
        actualImage:"logo_small.png"
      }).then(function(){
        M.toast({html:"Twój dotychczasowy awatar został zastąpiony domyślnym."});
      })
    })
  }
  var userdbRef;
  function getAccountConfig(user){
    if(user.displayName==null){
      
      user.updateProfile({
  displayName: document.getElementById("nick").value,
  photoURL:"logo_small.png"
}).then(function() {

  firebase.database().ref("users/"+user.uid).set({
    "points":0,
    "actualNick":document.getElementById("nick").value,
    "actualImage":"logo_small.png"
  }).then(function(){
    location.reload();
  })
}).catch(function(error) {
  // An error happened.
});
  }
  else{
    


    document.getElementById("avatar").src=user.photoURL;
    document.getElementById("nickname").innerHTML=user.displayName;
    document.getElementById("edit_nick").value=user.displayName;
    document.getElementById("userEmail").innerHTML=user.email;
    M.updateTextFields();
    document.getElementById("unlogged").style.display="none";
    document.getElementById("logged").style.display="block";
    document.getElementById("loader").style.display="none";
  }
  M.AutoInit();
  ranking();
}
function sendTokenToServer(token){
  firebase.database().ref("tokens/"+firebase.auth().currentUser.uid).set(token);
}
messaging.onTokenRefresh(() => {
  messaging.getToken().then((refreshedToken) => {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    //setTokenSentToServer(false);
    // Send Instance ID token to app server.
    sendTokenToServer(refreshedToken);
    // ...
  }).catch((err) => {
    console.log('Unable to retrieve refreshed token ', err);
    showToken('Unable to retrieve refreshed token ', err);
  });
});
messaging.onMessage((payload) => {
  console.log('Message received. '+ payload);
  // ...
});
  firebase.auth().onAuthStateChanged(function(user) {
      // since I can connect from multiple devices or browser tabs, we store each connection instance separately

// any time that connectionsRef's value is null (i.e. has no children) I am offline
  if (user) {
    firebase.database().goOnline();
    Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    messaging.getToken().then((currentToken) => {
  if (currentToken) {
    console.log(currentToken);
    M.toast({html:"Usługa powiadomień uruchomiona.",classes:"green darken-4"});
    M.toast({html:currentToken,classes:"blue accent-2"});
    sendTokenToServer(currentToken);
    //updateUIForPushEnabled(currentToken);
  } else {
    console.log('No Instance ID token available.');
  }
}).catch((err) => {
  console.error('An error occurred while retrieving token. ', err);
  //showToken('Error retrieving Instance ID token. ', err);
  //setTokenSentToServer(false);
});

  } else {
    console.error('Unable to get permission to notify.');
    M.toast({html:"Powiadomienia są zablokowane. Nie będziesz otrzymywał informacji o nowych wiadomościach.",classes:"yellow accent-2 red-text"});
  }
});

    M.toast({html:"Witaj, "+user.displayName});
    var myConnectionsRef = firebase.database().ref('users/'+user.uid+'/connections');

// stores the timestamp of my last disconnect (the last time I was seen online)
var lastOnlineRef = firebase.database().ref('users/'+user.uid+'/lastOnline');

var connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', function(snap) {
  if (snap.val() === true) {
    // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
    var con = myConnectionsRef.push();

    // When I disconnect, remove this device
    con.onDisconnect().remove();

    // Add this device to my connections list
    // this value could contain info about the device or a timestamp too
    con.set(true);

    // When I disconnect, update the last time I was seen online
    lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
  }
});
    // User is signed in.
    //M.toast({html:"Uwierzytelnianie..."});
    userdbRef=firebase.database().ref("users/"+user.uid);
    userdbRef.on('value', function(snapshot) {
  getAccountConfig(user,snapshot);
});
    openChannelSelector();
  } else {
    // User is signed out.
    console.info("Użytkownik nie jest zalogowany.");
    document.getElementById("logged").style.display="none";
    document.getElementById("unlogged").style.display="block";
    document.getElementById("loader").style.display="none";
  }
});
  function register(){
    var nick = document.getElementById("nick").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    document.getElementById("loader").style.display="flex";
    document.getElementById("unlogged").style.display="none";
    if(nick.length>0)
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  console.error(error.code);
  var errorMessage = error.message;
  M.toast({html: 'Błąd podczas tworzenia konta: '+error.message});
  document.getElementById("loader").style.display="none";
  document.getElementById("unlogged").style.display="block";
  // ...
});
  else{
    M.toast({html: 'Musisz podać nazwę użytkownika.'});
    document.getElementById("loader").style.display="none";
    document.getElementById("unlogged").style.display="block";
  }
  }
  function login(){
    var email = document.getElementById("login_email").value;
    var password = document.getElementById("login_password").value;
    document.getElementById("loader").style.display="flex";
    document.getElementById("unlogged").style.display="none";
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  console.error(error.code);
  var errorMessage = error.message;
  M.toast({html: 'Błąd podczas logowania: '+error.message});
  document.getElementById("loader").style.display="none";
  document.getElementById("unlogged").style.display="block";
  // ...
});
  }
  function logOut(){
    document.getElementById("loader").style.display="flex";
    document.getElementById("logged").style.display="none";
    firebase.database().goOffline();
    firebase.auth().signOut();
  }
  function password_reset(){
    var email = document.getElementById("recovery_email").value;
    firebase.auth().sendPasswordResetEmail(email).then(function() {
  // Email sent.
  M.toast({html: 'Wysłano instrukcje odzyskiwania na adres: '+email})
}).catch(function(error) {
  // An error happened.
  var errorCode = error.code;
  console.error(error.code);
  var errorMessage = error.message;
  M.toast({html: 'Błąd: '+error.message})
});
  }
