import React from 'react';
import AppMenu from "./Menu";
import StickyFooter from "./Footer";
import List from './List';
import { makeStyles } from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
const useStyles=makeStyles((theme)=>({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(10),
    right: theme.spacing(2),
  }
}))
/*function getUser(){
  if(sessionStorage.getItem("sid"))
    var sid=sessionStorage.getItem("sid")
  else
    var sid=localStorage.getItem("sid")
  fetch("/.netlify/functions/user",{method:"POST",body:JSON.stringify({"sid":sid})}).then(function(response){
    if(response.status===200)
      response.json().then(function(resp) {
        console.log(resp);
      })
    else
      response.text().then(function(err) {
        Toastify({
          text: "Error: "+err,
          duration: 3000, 
          close: true,
          gravity: "top", // `top` or `bottom`
          position: 'right', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, #ffb09b, #ffc93d)",
          stopOnFocus: true, // Prevents dismissing of toast on hover
          onClick: function(){} // Callback after click
        }).showToast();
      })
  })
}*/
function openNewChatWindow(){
  document.location.href="/chat/new";
}
export default function Chat(){
  const classes=useStyles();
  return(
    <div className={classes.root}>
    <AppMenu title={"Chats"}/>
    <div component="main" className={classes.main}>
      <List/>
    </div>
    <Fab color="primary" aria-label="Start new chat" className={classes.fab} onClick={openNewChatWindow}>
    <AddIcon/>
  </Fab>
    <StickyFooter/>
    </div>);
}