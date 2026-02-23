import { Button, Typography, Box, Avatar } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./userDetail.css";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import React, { useEffect, useState } from "react";
import axios from "axios";

function UserDetail(props) {
  function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    return color;
  }

  const [userData, setUserData] = useState();
  const [recentPhoto, setRecentPhoto] = useState();
  const [mostComments, setMostComments] = useState();
  const history = useHistory();

  useEffect(() => {
    axios
      .get("http://localhost:3000/user/" + props.match.params.userId)
      .then((res) => {
        setUserData(res.data);
        props.setTitle(`${res?.data?.first_name} ${res?.data?.last_name}`);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:3000/photos/latest/" + props.match.params.userId)
      .then((res) => {
        setRecentPhoto(res.data);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://localhost:3000/photos/most-comments/" + props.match.params.userId)
      .then((res) => {
        setMostComments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.match.params.userId]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1439792675105-701e6a4ab6f0?q=80&w=1773&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        color: "#fff",
      }}
    >
      <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", backgroundColor: "rgba(0, 0, 0, 0.6)", borderRadius: "10px" }}>
        {/* User Profile */}
        <Box sx={{ textAlign: "center", marginBottom: "30px" }}>
          <Avatar
            sx={{
              bgcolor: stringToColor(`${userData?.first_name?.[0]}${userData?.last_name?.[0]}`),
              width: 120,
              height: 120,
              fontSize: 50,
              margin: "0 auto",
            }}
          >
            {userData?.first_name?.[0]}
            {userData?.last_name?.[0]}
          </Avatar>
          <Typography variant="h4" sx={{ marginTop: "20px" }}>
            {userData?.first_name}&apos;s Profile
          </Typography>
          <Typography variant="h6">{userData?.first_name} {userData?.last_name}</Typography>
          <Typography>{userData?.occupation}</Typography>
          <Typography>{userData?.location}</Typography>
          <Typography>{userData?.description}</Typography>

          {userData?._id && (
            <Button
              variant="contained"
              sx={{
                marginTop: "20px",
                backgroundColor: "#007bff",
                "&:hover": { backgroundColor: "#0056b3" },
              }}
              onClick={() => history.push("/photos/" + userData._id)}
            >
              See {userData?.first_name} {userData?.last_name}&apos;s Photos
            </Button>
          )}
        </Box>

        {/* Recent and Most Commented Photos */}
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "20px", marginTop: "40px" }}>
          {recentPhoto && (
            <Box
              sx={{
                width: "48%",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                padding: "10px",
                borderRadius: "8px",
              }}
              onClick={() => history.push("/photos/" + props.match.params.userId + "?imageId=" + (recentPhoto?.file_name || ""))}
            >
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                Recent Photo
              </Typography>
              <Box sx={{ width: "100%", height: "200px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
                <img
                  src={`../../images/${recentPhoto?.file_name}`}
                  alt="Recent"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", borderRadius: "8px" }}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ChatBubbleOutlineIcon sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff" }}>{recentPhoto?.comments?.length}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FavoriteBorderIcon sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff" }}>{recentPhoto?.liked_by?.length || 0}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {mostComments && (
            <Box
              sx={{
                width: "48%",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                padding: "10px",
                borderRadius: "8px",
              }}
              onClick={() => history.push("/photos/" + props.match.params.userId + "?imageId=" + (mostComments?.file_name || ""))}
            >
              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                Most Comments
              </Typography>
              <Box sx={{ width: "100%", height: "200px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
                <img
                  src={`../../images/${mostComments?.file_name}`}
                  alt="Most Comments"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", borderRadius: "8px" }}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ChatBubbleOutlineIcon sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff" }}>{mostComments?.comments?.length}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FavoriteBorderIcon sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff" }}>{mostComments?.liked_by?.length || 0}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default UserDetail;
