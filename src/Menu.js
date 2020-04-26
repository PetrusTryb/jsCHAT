import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChatIcon from '@material-ui/icons/Chat';
import PeopleIcon from '@material-ui/icons/People';
import GetAppIcon from '@material-ui/icons/GetApp';
import BugReportIcon from '@material-ui/icons/BugReport';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

export default function SwipeableTemporaryDrawer(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    drawer:false
  });

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, "drawer": open });
  };
  const logout=()=>{
    console.log("Closing session...");
    let sid;
    if(sessionStorage.getItem("sid"))
    sid=sessionStorage.getItem("sid")
  else
    sid=localStorage.getItem("sid")
  fetch("/.netlify/functions/logout",{method:"POST",body:JSON.stringify({"sid":sid})}).then(function(response){
    if(response.status===200){
      sessionStorage.clear();
      localStorage.clear();
      document.location.href="/";
    }
  })
  }
  const goBack=()=>{
    window.history.back();
  }
  const list = () => (
    <div
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button key={"Chats"}>
            <ListItemIcon><ChatIcon/></ListItemIcon>
            <ListItemText primary={"Chats"} />
          </ListItem>
        <ListItem button key={"People"}>
          <ListItemIcon><PeopleIcon/></ListItemIcon>
          <ListItemText primary={"People"} />
        </ListItem>
        <ListItem button key={"Install app"}>
            <ListItemIcon><GetAppIcon/></ListItemIcon>
            <ListItemText primary={"Install app"} />
        </ListItem>
        <ListItem button key={"Report a bug"}>
            <ListItemIcon><BugReportIcon/></ListItemIcon>
            <ListItemText primary={"Report a bug"} />
        </ListItem>
      </List>
      <Divider />
      <List>
      <ListItem button key={"My profile"}>
          <ListItemIcon><AccountCircleIcon/></ListItemIcon>
          <ListItemText primary={"My profile"} />
        </ListItem>
        <ListItem button key={"Settings"}>
            <ListItemIcon><SettingsIcon/></ListItemIcon>
            <ListItemText primary={"Settings"} />
        </ListItem>
        <ListItem button key={"Logout"} onClick={logout}>
            <ListItemIcon><MeetingRoomIcon/></ListItemIcon>
            <ListItemText primary={"Logout"} />
        </ListItem>
      </List>
    </div>
  );
    if(!props.back){
  return (
    <div>
      <AppBar position="static">
  <Toolbar>
    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"  onClick={toggleDrawer(true)}>
    <MenuIcon></MenuIcon>
    </IconButton>
        <React.Fragment key={"drawer"}>
          <SwipeableDrawer
            anchor={"left"}
            open={state["drawer"]}
            onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
          >
            {list()}
          </SwipeableDrawer>
        </React.Fragment>
    <Typography variant="h6" className={classes.title}>
      {props.title}
    </Typography>
  </Toolbar>
</AppBar>

    </div>
  );}
  else{
    return (
      <div>
        <AppBar position="static">
    <Toolbar>
      <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"  onClick={goBack}>
      <ArrowBackIcon/>
      </IconButton>
      <Typography variant="h6" className={classes.title}>
        {props.title}
      </Typography>
    </Toolbar>
  </AppBar>
  
      </div>
    );
  }
}
