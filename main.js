var debugMode = true;
  (function(){
    var Log = console.log;
    console.log = function (message) {
        // DO MESSAGE HERE.
        if(debugMode)
        Log(message);
    };
})();
  // Your web app's Firebase configuration
  window.onerror=function(){
    M.toast({html:"Błąd krytyczny."});
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
  M.AutoInit();
  var messagesRef;
  var metaRef;
  tinymce.init({ selector:'#textedit',plugins: ['media image emoticons autolink charmap code preview'],
    //images_upload_url: 'upload.php',
    file_picker_types: 'file image media',
    block_formats:'Paragraf=p; Nagłówek 1=h1; Nagłówek 2=h2; Nagłówek 3=h3; Nagłówek 4=h4; Nagłówek 5=h5; Nagłówek 6=h6; Tekst preformatowany=pre',
    branding: false,

  automatic_uploads: false,
  relative_urls : false,
remove_script_host : false,
//document_base_url : "",
  //emoticons_database_url: 'emojiDBMS.js',
  toolbar: 'undo redo | styleselect | bold italic underline | emoticons image media | code preview',
  mobile: {
    theme: 'silver',
    plugins: ['media image emoticons autolink charmap code'],
  images_upload_url: 'upload.php',
  automatic_uploads: false,
  //emoticons_database_url: 'emojiDBMS.js',
  toolbar: 'undo redo | styleselect | bold italic underline | emoticons image media | code preview'
  }
        });
  //M.toast({html:"Ładowanie..."});
  var Ainstances,Minstances,Ginstances;
  function createChannel(){
    console.info("Tworzenie konwersacji...");
    firebase.database().ref("chan_count").once("value").then(function(snapshot){
      var name = document.getElementById("chan_name").value;
      var id=snapshot.val();
    if(name.length==0){
  name="Konwersacja #"+id;
  M.toast({html:"Nie podano nazwy konwersacji. Administratorzy będą mogli ją później ustawić."});
  }
  console.log("Nazwa: "+name);
  var perms={};
  perms[firebase.auth().currentUser.uid]="ADMIN";
  Ainstances[0].chipsData.forEach(function(chip){
      perms[chip.tag.slice(chip.tag.search("#")+1,-1)]="ADMIN";
    })
  Minstances[0].chipsData.forEach(function(chip){
      perms[chip.tag.slice(chip.tag.search("#")+1,-1)]="MEMBER";
    })
  Ginstances[0].chipsData.forEach(function(chip){
      perms[chip.tag.slice(chip.tag.search("#")+1,-1)]="GUEST";
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
      })
    })
    })
  }
  function createChannelWindow(){
    firebase.database().ref("users").once('value').then(function(snapshot){
      var jsonUsers = Object;
      snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      // childData will be the actual contents of the child
      var childData = childSnapshot.val().actualNick;
      jsonUsers[childData+" (#"+key+")"]=null;
  });
      jsonUsers["Wszyscy (#EVERYONE)"]=null;
      var Aelems = document.querySelectorAll('#adminsSelect');
      var Aoptions= {
        autocompleteOptions:{
      data: jsonUsers
  },
      limit: Infinity,
      minLength: 1,
      placeholder: "Administratorzy"
    }
    Ainstances = M.Chips.init(Aelems, Aoptions);

    var Melems = document.querySelectorAll('#membersSelect');
      var Moptions= {
        autocompleteOptions:{
      data: jsonUsers
  },
      limit: Infinity,
      minLength: 1,
      placeholder: "Członkowie"
    }
    Minstances = M.Chips.init(Melems, Moptions);

    var Gelems = document.querySelectorAll('#guestsSelect');
      var Goptions= {
        autocompleteOptions:{
      data: jsonUsers
  },
      limit: Infinity,
      minLength: 1,
      placeholder: "Goście"
    }
    Ginstances = M.Chips.init(Gelems, Goptions);
  })
}
function editChannelWindow(){
  console.log(channelId);
  var nameBox = document.getElementById("edit_chan_name"); 
  firebase.database().ref("users").once('value').then(function(snapshot){
      var jsonUsers = {
        "Wszyscy (#EVERYONE)": null
      };
      var uidPairs = {
        "EVERYONE":"Wszyscy"
      };
      snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      // childData will be the actual contents of the child
      var childData = childSnapshot.val().actualNick;
      jsonUsers[childData+" (#"+key+")"]=null;
      uidPairs[key]=childData;
  });
      //jsonUsers["Wszyscy (#EVERYONE)"]=null;
      var Aelems = document.querySelectorAll('#adminsSelect');
      var Aoptions= {
        autocompleteOptions:{
      data: jsonUsers
  },
      limit: Infinity,
      minLength: 1,
      placeholder: "Administratorzy"
    }
    Ainstances = M.Chips.init(Aelems, Aoptions);

    var Melems = document.querySelectorAll('#membersSelect');
      var Moptions= {
        autocompleteOptions:{
      data: jsonUsers
  },
      limit: Infinity,
      minLength: 1,
      placeholder: "Członkowie"
    }
    Minstances = M.Chips.init(Melems, Moptions);

    var Gelems = document.querySelectorAll('#guestsSelect');
      var Goptions= {
        autocompleteOptions:{
      data: jsonUsers
  },
      limit: Infinity,
      minLength: 1,
      placeholder: "Goście"
    }
    Ginstances = M.Chips.init(Gelems, Goptions);
    firebase.database().ref("channels/"+channelId).once("value").then(function(snapshot){
    nameBox.value=snapshot.val().name;
    M.updateTextFields();
    var perms = Object;
    perms=snapshot.val().permissions;
    console.log(perms);
    for(var perm in perms){
      switch(perms[perm]){
        case "ADMIN":
          Ainstances[Ainstances.length-1].addChip({tag:uidPairs[perm]+" (#"+perm+")"});
          break;
        case "MEMBER":
          Minstances[Minstances.length-1].addChip({tag:uidPairs[perm]+" (#"+perm+")"});
          break;
        case "GUEST":
          Ginstances[Ginstances.length-1].addChip({tag:uidPairs[perm]+" (#"+perm+")"});
      }
    }

  })
  })
  
}
function editChannel(){
    M.toast({html:"Zapisywanie ustawień..."});
    console.info("Stosowanie zmian...");
    var name = document.getElementById("edit_chan_name").value;
    var perms = {};
    Ainstances[Ainstances.length-1].chipsData.forEach(function(chip){
      perms[chip.tag.slice(chip.tag.search("#")+1,-1)]="ADMIN";
    })
  Minstances[Ainstances.length-1].chipsData.forEach(function(chip){
      perms[chip.tag.slice(chip.tag.search("#")+1,-1)]="MEMBER";
    })
  Ginstances[Ainstances.length-1].chipsData.forEach(function(chip){
      perms[chip.tag.slice(chip.tag.search("#")+1,-1)]="GUEST";
    })
  console.log(perms);
    firebase.database().ref("channels/"+channelId).update(
    {
      "name":name,
      "permissions":perms
    }).then(function(){
      M.toast({html:"Pomyślnie zastosowano zmiany."});
    })
  }
  function openChannelSelector(){
    setTitle("Konwersacje");
    adminOptions(false);
    document.getElementById("channelWindow").style.display="none";
    document.getElementById("channelSelector").style.display="block";
    firebase.database().ref("channels").once('value').then(function(snapshot){
      var table = document.getElementById("channelSelectorBody");
      table.innerHTML="";
      snapshot.forEach(function(childSnapshot){
        key=childSnapshot.key;
        var childName = childSnapshot.val().name;
        //console.log(key+" "+childName);
        var permission = childSnapshot.val().permissions[firebase.auth().currentUser.uid];
        if(permission===undefined)
          permission = childSnapshot.val().permissions["EVERYONE"];
        //console.log(permission);
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
          //console.log(permText);
          table.innerHTML+="<tr onclick='joinChannel("+key+")'><td>"+childName+"</td><td>"+permText+"</td></tr>";
          
        }
      })
      discoveryCreate();
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
    M.toast({html:"Nie wolno wysyłać pustych wiadomości."});
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
      if(snapshot.val()[firebase.auth().currentUser.uid]!=true){
        var elems = document.querySelectorAll('.tap-target');
        var instances = M.TapTarget.init(elems);
        instances[1].open();
        firebase.database().ref("sendDiscovery/"+firebase.auth().currentUser.uid).set(true);
      }
    })
  }
  function discoveryCreate(){
    firebase.database().ref("createDiscovery").once('value').then(function(snapshot){
      if(snapshot.val()[firebase.auth().currentUser.uid]!=true){
        var elems = document.querySelectorAll('.tap-target');
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
        table.innerHTML+="<tr id='rank"+pos+"'><td>"+pos+"</td><td>"+entry[0]+"</td><td>"+entry[1]+"<td/></tr>";
        pos++;
      })
      //M.toast({html:"Masz "+myPosition+". miejsce."});
      document.getElementById("ranking1").innerHTML=myPosition;
      document.getElementById("ranking2").innerHTML=myPosition;
      document.getElementById("rank"+myPosition).style.fontWeight="bold";
      document.getElementById("rank"+myPosition).style.color="red";
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
          document.getElementById("info"+msgId).innerHTML="<a class='modal-trigger grey-text' href='#userInfo' onclick='getUserInfo(\""+message.author+"\")'><img class='circle' style='width:24px; height:24px' src='"+snapshot.val().actualImage+"'>"+snapshot.val().actualNick+"</a> &diams; "+timeAgo(message.time);
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
        messagesDiv.innerHTML+="<div class='my' oncontextmenu='contextMenu("+msgId+",\""+message.author+"\")' id='message"+msgId+"'>"+message.content+"<p class='msgInfo'><a class='modal-trigger grey-text' href='#userInfo' onclick='getUserInfo(\""+message.author+"\")'><img class='circle' style='width:24px; height:24px' src='"+firebase.auth().currentUser.photoURL+"'>Ty</a> &diams; "+timeAgo(message.time)+"</p></div>";
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
const messaging = firebase.messaging();
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
  console.log('Message received. ', payload);
  // ...
});
  firebase.auth().onAuthStateChanged(function(user) {
      // since I can connect from multiple devices or browser tabs, we store each connection instance separately

// any time that connectionsRef's value is null (i.e. has no children) I am offline
  if (user) {
    firebase.database().goOnline();
    messaging.usePublicVapidKey("BPDAW6zbeuUv-DLHgb8te4i3WuWATdLYxok79bIZvUL9M08gDTV4HFh_Xp-2AMs5N55xRmzNtL4n3-4mp1zhizY");
    Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    console.log('Notification permission granted.');
    messaging.getToken().then((currentToken) => {
  if (currentToken) {
    console.log(currentToken);
    sendTokenToServer(currentToken);
    //updateUIForPushEnabled(currentToken);
  } else {
    // Show permission request.
    console.log('No Instance ID token available. Request permission to generate one.');
  }
}).catch((err) => {
  console.error('An error occurred while retrieving token. ', err);
  //showToken('Error retrieving Instance ID token. ', err);
  //setTokenSentToServer(false);
});

  } else {
    console.error('Unable to get permission to notify.');
    M.toast({html:"Powiadomienia są zablokowane. Nie będziesz otrzymywał informacji o nowych wiadomościach."});
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