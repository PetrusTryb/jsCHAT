import React from 'react';
import AppMenu from "./Menu";
import StickyFooter from "./Footer";
import UsersList from './UsersList';
import { makeStyles } from '@material-ui/core/styles';
const useStyles=makeStyles((theme)=>({
    root: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    },
    main: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    fab: {
      position: 'fixed',
      bottom: theme.spacing(10),
      right: theme.spacing(2),
    }
  }))
  


export default function CreateChat(){
    let classes=useStyles();
    
    return (<div className={classes.root}>
        <AppMenu title={"New chat"} back={true}/>
        <div component="main" className={classes.main}>
          <UsersList/>
        </div>
        <StickyFooter/>
        </div>)
}