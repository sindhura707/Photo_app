import React, { useState } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Paper } from "@mui/material";
import "./styles/main.css";

// import necessary components
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/userDetail";
import UserList from "./components/userList/userList";
import UserPhotos from "./components/userPhotos/userPhotos";
import LoginRegister from "./components/LoginRegister/loginRegister";
import Favorites from "./components/favorites/favorites";

function PhotoShare() {
  const [title, setTitle] = useState("");
  const [user, setUser] = useState("");
  const [userId, setUserId] = useState("");
  return (
    <HashRouter>
      {user ? (
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar title={title} user={user} setUser={setUser} setUserId={setUserId} />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route path="/users/:userId" render={(props) => <UserDetail setTitle={setTitle} {...props} />} />
                  <Route path="/photos/:userId" render={(props) => <UserPhotos setTitle={setTitle} {...props} userId={userId} />} />
                  <Route path="/users" component={UserList} />
                  <Route path="/favorites" component={Favorites} />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      ) : (
        <div>
          <Grid item xs={12}>
            <TopBar title={title} user={user} />
          </Grid>
          <Switch>
            <Route path="/login-register" render={(props) => <LoginRegister setUser={setUser} setUserId={setUserId} {...props} />} />
            <Redirect path="/" to="/login-register" />
          </Switch>
        </div>
      )}
    </HashRouter>
  );
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));