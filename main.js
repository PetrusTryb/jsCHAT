  window.onerror=function(){
    M.toast({html:"<i class='material-icons'>error</i> Napotkano nieoczekiwany problem. Sprawdź logi konsoli."});
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
  	location.hash="create";
  	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/create").set(true);
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
	location.hash="edit";
	console.group("Okno właściwości konwersacji");
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
  	location.hash="selector";
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
              permText='<i class="small material-icons">star</i> Administrator';
              break;
            case "MEMBER":
              permText='<i class="small material-icons">message</i> Członek';
              break;
            case "GUEST":
              permText='<i class="small material-icons">block</i> Wyciszony';
              break;
          }
          table.append("<tr onclick='joinChannel("+key+")'><td>"+childName+"</td><td>"+permText+"</td></tr>");
        }
      })
      console.info("Wczytywanie dostępnych kanałów czatu powiodło się.");
      console.groupEnd("Selektor konwersacji");
      discovery("create");
    })
  }
  function notifyRecivers(){
  	  console.group("Wysyłanie powiadomień");
	  var senderNick = $("#nickname").text();
	  var channelName = $("#title").text();
	  console.log("Kanał: "+channelName);
	  console.log("Nadawca: "+senderNick);
	  var req = new XMLHttpRequest();
req.open('POST', 'https://jschat.netlify.com/.netlify/functions/notifications', true);
req.setRequestHeader("channelName", channelName);
req.setRequestHeader("senderNick", senderNick);
req.setRequestHeader("channelId",channelId);
req.onreadystatechange = function (aEvt) {
  if (req.readyState == 4) {
     if(req.status == 200)
      console.info(req.responseText);
     else
      console.error(req.responseText);
     console.groupEnd("Wysyłanie powiadomień");
      count(firebase.auth().currentUser.uid,"sent_count");
  }
};
req.send(null);	  
  }
  function sendMessage(){
  	console.group("Wysyłanie wiadomości");
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
          console.log("Wysłano pomyślnie.");
          console.groupEnd("Wysyłanie wiadomości");
          notifyRecivers();
        })
      })
    })
  }
  else{
  	console.log("Próba wysłania pustej wiadomości została zablokowana.");
    M.toast({html:"Nie wolno wysyłać pustych wiadomości.",classes:"yellow accent-2 red-text"});
    console.groupEnd("Wysyłanie wiadomości");
  }
  }
  function count(uid,type){
  	console.group("Aktualizacja statystyk");
    firebase.database().ref("users/"+uid).once("value").then(function(snapshot){
      var value = snapshot.val()[type];
      if(value==undefined)
        value = 1;
      else
        value++;
      firebase.database().ref("users/"+uid+"/"+type).set(value).then(function(){
      	console.log(`Zmieniono statystykę ${type} o 1 dla: ${uid}.`);
    	console.groupEnd("Aktualizacja statystyk");
      })
    })
    
  }
  var isAdmin = false;
  function adminOptions(show){
  	console.group("Opcje administracyjne");
    if(show){
      $("#editChannelTrigger1").show();
      $("#editChannelTrigger2").show();
      isAdmin=true;
      console.log("Pokazano opcje administracyjne");
    }
    else{
      $("#editChannelTrigger1").hide();
      $("#editChannelTrigger2").hide();
      isAdmin=false;
      console.log("Ukryto opcje administracyjne");
    }
    console.groupEnd("Opcje administracyjne");
  }
  function discovery(feature){
  	console.group("Samouczek");
  	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/"+feature).once('value').then(function(snapshot){
  		if(!snapshot.val()){
  			console.log(`Funkcja ${feature} nie została odkryta.`);
  			$(`#${feature}`).tapTarget();
  			$(`#${feature}`).tapTarget('open');
  		}
  		else
  			console.log(`Funkcja ${feature} została odkryta przez użytkownika.`);
  		console.groupEnd("Samouczek");
  	})
  }
  function actionSend(show){
  	console.group("Panel wysyłania wiadomości");
    var sendDiv = $("#write");
    var readDiv = $("#messages");
    if(allowEditing&&show&&sendDiv.is(":hidden")){

  	firebase.database().ref("users/"+firebase.auth().currentUser.uid+"/sendPanel").set(true);
      sendDiv.show();
      readDiv.height("50vh");
      console.log("Pokazano panel wysyłania wiadomości.");
      location.hash="send";
      scrollToBottom();
    }
    else{
      sendDiv.hide();
      readDiv.height("100%");
      console.log("Ukryto panel wysyłania wiadomości.");
      location.hash="messages";
      scrollToBottom();
    }
    console.groupEnd("Panel wysyłania wiadomości");
  }
  var allowEditing = false;
  function checkPerms(snapshot){
  	console.group("Sprawdzanie uprawnień");
    var permission = snapshot[firebase.auth().currentUser.uid];
        if(permission===undefined)
          permission = snapshot["EVERYONE"];
        console.log("Twoje uprawnienia: "+permission);
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
           M.toast({html:"Nie masz dostępu do tej konwersacji."});
          openChannelSelector();
          metaRef.off();
          messagesRef.off();
          break;
        }
        console.groupEnd("Sprawdzanie uprawnień");
  }
  function scrollToBottom(){
  	console.group("Przewijanie");
    var div = $("#messages");
    console.log("Wysokość do przewijania: "+div[0].scrollHeight);
    div.scrollTop(div.scrollHeight);
    console.log("Wysokość do przewijania okna: "+document.body.scrollHeight);
    window.scrollTo(0,document.body.scrollHeight);
    console.groupEnd("Przewijanie");
  }
  function timeAgo(time){
  	console.group("jsCHAT time check");
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
    console.log(output);
    console.groupEnd("jsCHAT time check");
    return output;
  }
  
  function ranking(){
  	location.hash="ranking";
  	console.group("Ranking");
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
      	console.log(`${pos}.: ${entry[0]}`)
        if(entry[0]==firebase.auth().currentUser.displayName){
          myPosition=pos;
        }
        if(entry[0]!=undefined){
        	table.append("<tr id='rank"+pos+"'><td>"+pos+"</td><td>"+entry[0]+"</td><td>"+entry[1]+"<td/></tr>");
        	pos++;
        }
      })
      console.groupEnd("Ranking");
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
  function getUserInfo(uid){
  	console.group("Profil użytkownika");
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
      reputationField.html("Reputacja: "+snapshot.val().points);
      uidField.html(uid);
      if(snapshot.val().sent_count)
        sentCountField.html("Wysłanych wiadomości: "+snapshot.val().sent_count);
      else
      	sentCountField.html("Wysłanych wiadomości: 0");
      if(snapshot.val().deleted_count)
        deletedSelfCountField.html("Usuniętych: "+snapshot.val().deleted_count);
      else
      	deletedSelfCountField.html("Usuniętych: 0");
      if(snapshot.val().connections){
        activityField.html("<span class='green-text'>Aktywny teraz</span>");
      }
      else{
        activityField.html("Ostatnio był aktywny: ");
        activityField.html(timeAgo(snapshot.val().lastOnline));
      }
   	  console.groupEnd("Profil użytkownika");
    })
	else{
		console.log("WSZYSCY");
		nickField.html("<i>Wszyscy</i>");
		activityField.html("(obecni i nowi)");
		avatarField.attr("src","logo_small.png");
		uidField.html("EVERYONE");
		reputationField.html("Reputacja: &infin;");
		sentCountField.html("");
		deletedSelfCountField.html("");
		console.groupEnd("Profil użytkownika")
	}
  }
  function getAuthorData(msgId,message){
  	console.group("Informacje o wiadomości");
    firebase.database().ref("users/"+message.author).once("value").then(function(snapshot){
    	console.log(snapshot.val());
    	try{
    		if(!snapshot.val().actualNick)
    			throw Error;
			$("#info"+msgId).html("<a class='modal-trigger grey-text' href='#userInfo'><img class='circle avatar' src='"+snapshot.val().actualImage+"'>"+snapshot.val().actualNick+"</a> &diams; "+timeAgo(message.time));
			$("#info"+msgId).click(function(){
				getUserInfo(message.author);
			})
		}catch(Error){
      		$("#info"+msgId).html("<a class='grey-text'>"+"<i>Konto usunięte</i>"+"</a> &diams; "+timeAgo(message.time));
      	}
      	scrollToBottom();
      	console.groupEnd("Informacje o wiadomości");
    })
  }
  function givePoints(uid,amount){
  	console.group("Reputacja");
    firebase.database().ref("users/"+uid+"/points").once("value").then(function(snapshot){
    	if(snapshot.val()!=undefined){
    	console.log(`Użytkownik ${uid} miał ${snapshot.val()} punktów.`);
      	var newBalance = snapshot.val()+amount;
      	firebase.database().ref("users/"+uid+"/points").set(newBalance).then(function(snapshot){
      		console.log(`Przyznano ${amount} punktów użytkownikowi ${uid}. Ma teraz ${newBalance} punktów.`);
      	})
      }
      else
      	console.log(`Użytkownik ${uid} nie istnieje.`);
    })
    console.groupEnd("Reputacja");
  }
  function sendVote(type,id,uid){
  	console.group("Reakcje");
  	$("#upvote").attr("disabled",true);
  	$("#downvote").attr("disabled",true);
  	$("#voteBack").attr("disabled",true);
  	console.log(`Reakcja ${type} na wiadomość ${id} użytkownika ${uid}.`);
    if(type!=0)
      firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes/"+firebase.auth().currentUser.uid).set(type).then(function(){
        M.toast({html:"Twój głos został przesłany."});
        givePoints(uid,type*5);
        contextMenu(id,uid);
        console.groupEnd("Reakcje");
      });
    else
      firebase.database().ref("channels/"+channelId+"/messages/"+id+"/votes/"+firebase.auth().currentUser.uid).remove().then(function(){
        M.toast({html:"Twój głos został usunięty."});
        contextMenu(id,uid);
        console.groupEnd("Reakcje");
      });
  }
  var previousMessage;
  function undo(id){
  	console.group("Cofanie usuwania wiadomości");
    M.Toast.dismissAll();
    firebase.database().ref("channels/"+channelId+"/messages/"+id).update(previousMessage);
      firebase.database().ref("users/"+previousMessage.author+"/deleted_count").once("value").then(function(snapshot){
        firebase.database().ref("users/"+previousMessage.author+"/deleted_count").set(snapshot.val()-1);
        console.log(`Wiadomość #${id} wróciła na swoje miejsce.`);
        console.groupEnd("Cofanie usuwania wiadomości");
      })
  }
  function removeMessage(id){
  	console.group("Usuwanie wiadomości");
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
          	console.log("Usunięto wiadomość #"+id);
          	console.groupEnd("Usuwanie wiadomości");
            M.toast({html:"Usunięto wiadomość. <button class='btn-flat toast-action' onclick='undo("+id+",false)'>Cofnij</button>"});
          })
        })
    })
  }
  function contextMenu(id,owner){
  	console.group("Opcje wiadomości");
  	location.hash="context";
    var instance = M.Modal.getInstance($("#messageActions"));
    var votesCount = $("#votes");
    var upvoteButton = $("#upvote");
    var downvoteButton = $("#downvote");
    var myVoteStatus = $("#yourVote");
    var undoVoteButton = $("#voteBack");
    var removeButton = $("#deleteMessage");
    upvoteButton.click(function(){sendVote(1,id,owner)});
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
          myVoteStatus.html("Nie możesz reagować na własne wiadomości.");
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
              myVoteStatus.html("Zareagowałeś pozytywnie.");
              undoVoteButton.click(function(){sendVote(0,id,owner);givePoints(owner,-5);});
            }
            if(vote.val()==-1){
              myVoteStatus.html("Zareagowałeś negatywnie");
              undoVoteButton.click(function(){sendVote(0,id,owner);givePoints(owner,5);});
            }
          }
        })
        votesCount.text(votes);
      }
      else{
        votesCount.text("0");
      }
      instance.open();
      console.groupEnd("Opcje wiadomości");
    })
    removeButton.onclick=function(){removeMessage(id);};
    if(isAdmin||owner==firebase.auth().currentUser.uid){
      removeButton.show();
    }
    else{
      removeButton.hide();
    }
    event.preventDefault();
  }
  function autoUpdate(snapshot){
  	console.group("Aktualizacja wiadomości");
    var messagesDiv = $("#messages");
    messagesDiv.html("");
    if(snapshot.val()!=null)
    snapshot.forEach(function(snap){
    	console.log(snap);
      var msgId = snap.key;
      var message = snap.val();
      if(message.author==firebase.auth().currentUser.uid){
        messagesDiv.append("<div class='my yellow accent-2' oncontextmenu='contextMenu("+msgId+",\""+message.author+"\")' id='message"+msgId+"'>"+message.content+"<p class='msgInfo'><a class='modal-trigger grey-text' href='#userInfo' onclick='getUserInfo(\""+message.author+"\")'><img class='circle avatar' src='"+firebase.auth().currentUser.photoURL+"'>Ty</a> &diams; "+timeAgo(message.time)+"</p></div>");
      }
      else{
        messagesDiv.append("<div class='message' oncontextmenu='contextMenu("+msgId+",\""+message.author+"\")' id='message"+msgId+"'>"+message.content+"<p class='msgInfo' id='info"+msgId+"'></p></div>");
        getAuthorData(msgId,message);
      }
    })
	else
		messagesDiv.html("<p class='center'>Ta konwersacja jest pusta...</p>");
      console.groupEnd("Aktualizacja wiadomości");
  }
  window.onhashchange = function() {
 switch(location.hash){
 	case "#messages":
 		if(channelId!=undefined)
 			joinChannel(channelId);
 		break;
 	case "#selector":
 		setTitle("Konwersacje");
 		if(messagesRef){
 		messagesRef.off();
    	metaRef.off();
    	}
    //clearInterval(refreshInterval);
 		openChannelSelector();
 		break;
 }
}
  var channelId;
  var refreshInterval;
  var lastSnapshot;
  function joinChannel(id){
  	console.group("Dołączanie do konwersacji");
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
       //autoUpdate(snapshot.val().messages);
});
    messagesRef.on('value', function(snapshot) {
      lastSnapshot = snapshot;
       autoUpdate(snapshot);
});
    console.log("Dołączono do konwersacji: "+id);
    //refreshInterval = setInterval(autoUpdate(lastSnapshot),60000);
    console.groupEnd("Dołączanie do konwersacji");
  }
  function setTitle(title){
  	console.group("Zmiana tytułu okna");
    document.title=title;
    $("#title").html(title);
    console.log("Ustawiono tytuł okna na: "+title);
    console.groupEnd("Zmiana tytułu okna");
  }
  function settings(){
  	location.hash="settings";
  	console.group("Ustawienia aplikacji");
  	console.log(firebase.auth().currentUser);
    $("#settingsNick").html(firebase.auth().currentUser.displayName);
    $("#settingsAvatar").attr("src",firebase.auth().currentUser.photoURL);
    $("#settingsEmail").html(firebase.auth().currentUser.email);
    console.groupEnd("Ustawienia aplikacji");
  }
  function getMyInfo(){
    getUserInfo(firebase.auth().currentUser.uid);
  }
  function changeNick(){
  	console.group("Zmiana nicku");
    var newNick = $("#edit_nick").val();
    console.log("Nowy nick: "+newNick);
    if(newNick.length>0){
      firebase.auth().currentUser.updateProfile({
        displayName:newNick
      }).then(function(){
        firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
          actualNick:newNick
        }).then(function(){
          M.toast({html:"Gotowe!"});
          console.log("Nick został pomyślnie zmieniony.");
          console.groupEnd("Zmiana nicku");
        })
      })
    }
  }
  function changePassword(){
  	console.group("Zmiana hasła");
  	var newPassword = $("#new_password").val();
    var password = $("#old_password").val();
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  firebase.auth().currentUser.updatePassword(newPassword).then(function() {
  	console.log("Hasło zostało pomyślnie zmienione.");
  	console.groupEnd("Zmiana hasła");
  M.toast({html:"Twoje hasło zostało pomyślnie zmienione."});
}).catch(function(error) {
	console.error("Błąd zmiany hasła: "+error.message);
	console.groupEnd("Zmiana hasła");
  M.toast({html:error.message});
});
}).catch(function(error) {
	console.error("Błąd ponownego uwierzytelniania: "+error.message);
	console.groupEnd("Zmiana hasła");
  M.toast({html:error.message});
});
}
    function deleteAccount(){
    console.group("Usuwanie konta");
    var password = $("#delete_account_password").val();
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  var uid = firebase.auth().currentUser.uid;
  firebase.auth().currentUser.delete().then(function() {
  M.toast({html:"Twoje konto zostało usunięte."});
  firebase.database().ref("users/"+uid).remove();
  firebase.database().ref("tokens/"+uid).remove();
  console.log("Konto zostało usunięte");
  console.groupEnd("Usuwanie konta");
}).catch(function(error) {
  M.toast({html:error.message});
  console.error("Błąd usuwania konta: "+error.message);
  console.groupEnd("Usuwanie konta");
});
}).catch(function(error) {
  M.toast({html:error.message});
  console.error("Błąd ponownego uwierzytelniania: "+error.message);
  console.groupEnd("Usuwanie konta");
});
  }
  function changeEmail(){
  	console.group("Zmiana adresu e-mail");
    var newEmail = $("#edit_email").val();
    var password = $("#edit_email_password").val();
    console.log("Nowy adres: "+newEmail);
    var credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, password);
      firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
  firebase.auth().currentUser.updateEmail(newEmail).then(function() {
  M.toast({html:"Gotowe."});
  console.log("Adres e-mail został pomyślnie zmieniony.");
  console.groupEnd("Zmiana adresu e-mail");
}).catch(function(error) {
  M.toast({html:error.message});
  console.error("Błąd zmiany adresu e-mail: "+error.message);
  console.groupEnd("Zmiana adresu e-mail");
});
}).catch(function(error) {
	M.toast({html:error.message});
	console.error("Błąd ponownego uwierzytelniania: "+error.message);
	console.groupEnd("Zmiana adresu e-mail");
});
  }
  function changeAvatar(){
  	console.group("Zmiana zdjęcia profilowego");
    var AvatarRef = firebase.storage().ref(firebase.auth().currentUser.uid+"/avatar"+Math.floor(Math.random()*10));
    var file = $("#upload_avatar")[0].files[0];
    var uploadTask = AvatarRef.put(file);
    var progressBar = $("#upload_avatar_progress");
    var progressText = $("#upload_avatar_state");
    progressBar.width("0%");
    uploadTask.on('state_changed', function(snapshot){
  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  console.log(`Postęp przesyłania: ${progress}%`);
  progressBar.width(progress+"%");
  switch (snapshot.state) {
    case firebase.storage.TaskState.PAUSED:
      console.log('Przesyłanie wstrzymane');
      progressText.html(`${progress}%, przesyłanie wstrzymane. Sprawdź połączenie.`);
      break;
    case firebase.storage.TaskState.RUNNING:
      console.log('Przesyłanie w toku');
      progressText.html(`${progress}%, przesyłanie w toku...`);
      break;
  }
}, function(error) {
	console.error(error.message);
  M.toast({html:"Przesyłanie nie powiodło się."});
  console.groupEnd("Zmiana zdjęcia profilowego");
}, function() {
  uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    console.log('Przesłano plik: '+ downloadURL);
    firebase.auth().currentUser.updateProfile({
      photoURL:downloadURL
    }).then(function(){
      firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
        actualImage:downloadURL
      }).then(function(){
      	console.log("Przesyłanie zakończone powodzeniem.");
        M.toast({html:"Twój awatar został przesłany."});
        console.groupEnd("Zmiana zdjęcia profilowego");
      })
    })
  });
});
  }
  function resetAvatar(){
  	console.group("Resetowanie zdjęcia profilowego");
    firebase.auth().currentUser.updateProfile({
      photoURL:"logo_small.png"
    }).then(function(){
      firebase.database().ref("users/"+firebase.auth().currentUser.uid).update({
        actualImage:"logo_small.png"
      }).then(function(){
        M.toast({html:"Twój dotychczasowy awatar został zastąpiony domyślnym."});
        console.log("Przywrócono domyślny awatar.");
        console.groupEnd("Resetowanie zdjęcia profilowego");
      })
    })
  }
  var userdbRef;
  function getAccountConfig(user){
  	console.group("Konfiguracja konta");
    if(user.displayName==null){
    	console.log("To jest pierwsze logowanie.");
    	console.log("Ustawianie nicku na: "+$("#nick").val());
      user.updateProfile({
  displayName: $("#nick").val(),
  photoURL:"logo_small.png"
}).then(function() {
  firebase.database().ref("users/"+user.uid).set({
    "points":0,
    "actualNick":$("#nick").val(),
    "actualImage":"logo_small.png"
  }).then(function(){
  	console.log("Ukończono podstawową konfigurację konta");
  	console.groupEnd("Konfiguracja konta");
    getAccountConfig(user);
  })
});
  }
  else{
  	console.log("Konto jest już skonfigurowane.");
    $("#avatar").attr("src",user.photoURL);
    $("#nickname").html(user.displayName);
    $("#edit_nick").val(user.displayName);
    $("#userEmail").html(user.email);
    M.updateTextFields();
    $("#unlogged").hide();
    $("#logged").show();
    $("#loader").hide();
    console.groupEnd("Konfiguracja konta");
  }
}
messaging.onTokenRefresh(() => {
	console.group("Odświeżanie tokenu");
  messaging.getToken().then((refreshedToken) => {
    console.log('Nowy token WebPush: '+refreshedToken);
  firebase.database().ref("tokens/"+firebase.auth().currentUser.uid).set(refreshedToken);
  console.group("Odświeżanie tokenu");
  }).catch((err) => {
    console.error('Nie udało się odświeżyć tokenu WebPush: ', err);
    showToken('Nie udało się odświeżyć tokenu WebPush: ', err);
  });
});

messaging.onMessage((payload) => {
  console.log('Nowa wiadomość: '+ payload);
});

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    firebase.database().goOnline();
    Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Przyznano uprawnienia do powiadomień');
    messaging.getToken().then((currentToken) => {
  if (currentToken) {
    console.log(currentToken);
    M.toast({html:"Usługa powiadomień uruchomiona.",classes:"green darken-4",displayLength:200});
    M.toast({html:currentToken,classes:"blue accent-2",displayLength:200});
  firebase.database().ref("tokens/"+firebase.auth().currentUser.uid).set(currentToken);
  } else {
    console.log('Token WebPush jest niedostępny.');
  }
}).catch((err) => {
  console.error('Nie udało się uzyskać tokenu', err);
});
  } else {
    console.error('Nie zezwolono na powiadomienia.');
    M.toast({html:"Powiadomienia są zablokowane. Nie będziesz otrzymywał informacji o nowych wiadomościach.",classes:"yellow accent-2 red-text"});
  }
});
    M.toast({html:"Witaj, "+user.displayName});
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
    console.log("Użytkownik nie jest zalogowany.");
    $("#logged").hide();
    $("#unlogged").show();
    $("#loader").hide();
  }
});
  function register(){
    var nick = $("#nick").val();
    var email = $("#email").val();
    var password = $("#password").val();
    if(nick.length>0){
    $("#loader").show();
    $("#unlogged").hide();
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
  console.error(error.code);
  M.toast({html: 'Błąd podczas tworzenia konta: '+error.message});
  $("#loader").hide();
  $("#unlogged").show();
});
}
  else{
    M.toast({html: 'Musisz podać nazwę użytkownika.'});
  }
  }
  function login(){
    var email = $("#login_email").val();
    var password = $("#login_password").val();
    $("#loader").show();
    $("#unlogged").hide();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  console.error(error.code);
  M.toast({html: 'Błąd podczas logowania: '+error.message});
  $("#loader").hide();
  $("#unlogged").show();
});
  }
  function logOut(){
    $("#loader").show();
    $("#logged").hide();
    firebase.database().goOffline();
    firebase.auth().signOut();
  }
  function password_reset(){
    var email = $("#recovery_email").val();
    firebase.auth().sendPasswordResetEmail(email).then(function() {
  M.toast({html: 'Wysłano instrukcje odzyskiwania na adres: '+email})
}).catch(function(error) {
  console.error(error.code);
  M.toast({html: 'Błąd: '+error.message})
});
  }
