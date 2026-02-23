import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemText, Box } from "@mui/material";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";
import "./userList.css";

function UserList() {
  const [userData, setUserData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    axios
      .get("http://localhost:3000/user/list/")
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <List component="nav">
        {userData.map((user, index) => (
          <Link to={"/users/" + user._id} key={index} className="main-user-list">
            <ListItem
              onClick={() => history.push("/users/" + user._id)}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent background
                borderRadius: "8px",
                marginBottom: "10px",
                transition: "all 0.3s ease-in-out", // Smooth transition
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // Lighter background on hover
                  transform: "scale(1.05)", // Slight scale-up effect
                },
              }}
            >
              <ListItemText
                primary={`${user.first_name} ${user.last_name}`}
                sx={{
                  color: "#fff", // White text color for contrast
                  fontWeight: "bold", // Make text bold
                }}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );
}

export default UserList;
