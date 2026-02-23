import React, { useEffect, useState } from "react";
import { AppBar, Box, Button, Input, Link, Modal, Toolbar, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./TopBar.css";
import axios from "axios";

/**
 * Define TopBar, a React component of project #5
 */

function TopBar(props) {
  const history = useHistory();
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [infoData, setInfoData] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState();
  const logout = () => {
    props.setUser("");
    props.setUserId("");
    axios
      .post("http://localhost:3000/admin/logout")
      .then((res) => console.log(res))
      .catch((err) => console.log(`Error + ${err}`));
  };
  useEffect(() => {
    axios
      .get("http://localhost:3000/test/info")
      .then((res) => setInfoData(res.data))
      .catch((err) => console.log(`Error + ${err}`));
  }, []);

  return (
    <AppBar
      className="topbar-appBar"
      position="absolute"
      sx={{
        backgroundImage: "url(https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Image
          </Typography>
          <Input type="file" name="image" id="image" onChange={(e) => setFile(e.target.files[0])} />

          {file && <img src={URL.createObjectURL(file)} alt="preview" className="img-preview" />}
          <Button
            onClick={() => {
              const formData = new FormData();
              formData.append("uploadedphoto", file);
              axios
                .post("http://localhost:3000/photos/new", formData)
                .then((res) => {
                  setOpenModal(false);
                  history.push("/users/" + res.data.user_id);
                })
                .catch((err) => console.log(`Error + ${err}`));
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
      <Toolbar>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Typography variant="h5" color="inherit">
            Group 7
          </Typography>
          {props.user ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography>Hi {props?.user}!</Typography>
                <Typography>{props?.title}</Typography>
              </Box>
              <Box display="flex" flexDirection="row" gap={4} alignItems="center">
                <Link href="#/favorites" color="inherit">
                  <Typography>My Favorites</Typography>
                </Link>
                <Typography>Version: {infoData?.version}</Typography>
                <Button
                  onClick={() => setOpenModal(true)}
                  variant="outlined"
                  sx={{
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "lightgray",
                    },
                  }}
                >
                  Add Image
                </Button>
                <Button
                  onClick={logout}
                  variant="outlined"
                  sx={{
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "lightgray",
                    },
                  }}
                >
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            <Button href="#/login-register" color="inherit">
              Login/Register
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
