import { Box, Grid, Modal, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./favorites.css";
import moment from "moment";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState();
  useEffect(() => {
    axios
      .get("http://localhost:3000/photos/favorites")
      .then((res) => setFavorites(res.data))
      .catch((err) => console.log(err));
  }, []);
  const onFavoriteRemove = (photo) => {
    axios
      .post("http://localhost:3000/photos/favorite/" + photo._id)
      .then(() => {
        axios
          .get("http://localhost:3000/photos/favorites")
          .then((res) => {
            setFavorites(res.data);
            setIsModalOpen(false);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };
  console.log(favorites, "FAVORITES");
  return (
    <div>
      <Typography variant="h4">Favorites</Typography>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" marginBottom={4}>
            Image by {selectedImage?.user_id?.first_name} {selectedImage?.user_id?.last_name}
          </Typography>
          <img src={`../../images/${selectedImage?.file_name}`} alt="preview" className="img-style" />
          <Typography variant="body2" fontSize={12}>
            Posted on: {moment(selectedImage?.date_time).format("MMMM Do YYYY")} at {moment(selectedImage?.date_time).format("h:mm a")}
          </Typography>
          <Typography onClick={() => onFavoriteRemove(selectedImage)} sx={{ textDecoration: "underline", cursor: "pointer" }}>
            Remove from favorites
          </Typography>
        </Box>
      </Modal>
      {favorites?.length > 0 ? (
        <Grid spacing={2} container sx={{ marginTop: 4 }}>
          {favorites.map((photo) => (
            <Grid
              sx={{ cursor: "pointer" }}
              item
              key={photo._id}
              xs={3}
              onClick={() => {
                setSelectedImage(photo);
                setIsModalOpen(true);
              }}
            >
              <img src={`../../images/${photo?.file_name}`} className="image-style" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No favorite photos added yet</Typography>
      )}
    </div>
  );
}

export default Favorites;
