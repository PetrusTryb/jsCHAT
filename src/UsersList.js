import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import { makeStyles } from '@material-ui/core/styles';
export default class UsersList extends React.Component{
        
    constructor(props){
        super(props);
        this.state={classes:null,users:[],checked:[]}
    }
    componentDidMount(){
        fetch("/.netlify/functions/users",{method:"POST",body:JSON.stringify()}).then(response=>{
            if(response.status===200)
              response.json().then(resp=>{
                this.setState({users:resp});
              })
            })
    }
    render(){
    let classes=makeStyles((theme)=>({
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
      let checked=this.state.checked;
      const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
    
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
    
        this.setState({checked:newChecked})
      };
    return (
      <List className={classes.root}>
        {this.state.users.map((value) => {
          const labelId = `checkbox-list-label-${value.username}`;
          console.log(value)
          console.log(this.state.checked[value.username])
          return (
            <ListItem key={value.username} dense button onClick={handleToggle(value.username)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={this.state.checked[value.username]}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.username} />
            </ListItem>
          );
        })}
      </List>
    );
    }
}