import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useHistory, Link, useLocation } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "./userPhotos.css";
import axios from "axios";
import { ChatBubbleOutline } from "@mui/icons-material";
import moment from "moment";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";

function UserPhotos(props) {
  const history = useHistory();
  const [photosData, setPhotosData] = useState([]);
  const [userData, setUserData] = useState();
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    axios
      .get("http://localhost:3000/photosOfUser/" + props.match.params.userId)
      .then((res) => setPhotosData(res.data))
      .then(() => setPageLoaded(true))
      .catch((err) => console.log(err));
    axios
      .get("http://localhost:3000/user/" + props.match.params.userId)
      .then((res) => {
        setUserData(res.data);
        props.setTitle(`Photos of ${res?.data?.first_name} ${res?.data?.last_name}`);
      })
      .catch((err) => console.log(err));
  }, [props.match.params.userId]);
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

  const addComment = (event, photo) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const comment = data.get("comment");
    axios
      .post("http://localhost:3000/commentsOfPhoto/" + photo._id, { comment })
      .then((res) => {
        setPhotosData((prev) => {
          const newPhotosData = [...prev];
          const photoIndex = newPhotosData.findIndex((photoData) => photoData._id === photo._id);
          newPhotosData[photoIndex].comments.push(res.data);
          return newPhotosData;
        });
        event.target.reset();
      })
      .catch((err) => console.log(err));
  };

  const onLikeClick = (photo) => {
    axios
      .post("http://localhost:3000/photos/like/" + photo._id)
      .then((res) => {
        setPhotosData((prev) => {
          const newPhotosData = [...prev];
          const photoIndex = newPhotosData.findIndex((photoData) => photoData._id === photo._id);
          newPhotosData[photoIndex].liked_by = res.data;
          return newPhotosData;
        });
      })
      .catch((err) => console.log(err));
  };

  const onFavoriteClick = (photo) => {
    axios
      .post("http://localhost:3000/photos/favorite/" + photo._id)
      .then((res) => {
        setPhotosData((prev) => {
          const newPhotosData = [...prev];
          const photoIndex = newPhotosData.findIndex((photoData) => photoData._id === photo._id);
          newPhotosData[photoIndex].favorited_by = res.data;
          return newPhotosData;
        });
      })
      .catch((err) => console.log(err));
  };

  const location = useLocation();

  useEffect(() => {
    if (pageLoaded) {
      const queryParams = new URLSearchParams(location.search);
      const imageId = queryParams.get("imageId");
      const element = document.getElementById(imageId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.search, pageLoaded]);

  const redirectToUser = (id) => history.push("/users/" + id);
  return (
    <Box padding={2}>
      {photosData.length > 0 ? (
        photosData.map((photo, index) => (
          <Box key={index} marginTop={5}>
            <Stack direction="row" gap={1} paddingBottom={2}>
              <Avatar sx={{ bgcolor: stringToColor(`${userData?.first_name?.[0]}${userData?.last_name?.[0]}`) }}>
                {userData?.first_name?.[0]}
                {userData?.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography fontSize={18}>
                  {userData?.first_name} {userData?.last_name}
                </Typography>
                <Typography variant="body2" fontSize={12}>
                  {moment(photo?.date_time).format("MMMM Do YYYY")} at {moment(photo?.date_time).format("h:mm a")}
                </Typography>
              </Box>
            </Stack>
            <Box bgcolor="black" display="flex" justifyContent="center" borderRadius={2}>
              <div id={photo?.file_name}>
                <img src={`../../images/${photo?.file_name}`} className="main-image" />
              </div>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} marginTop={2}>
              <ChatBubbleOutline /> <Typography sx={{ marginRight: 3 }}>{photo?.comments?.length}</Typography>
              <Box onClick={() => onLikeClick(photo)} sx={{ cursor: "pointer" }}>
                {photo?.liked_by?.includes(props.userId) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </Box>{" "}
              <Typography>{photo?.liked_by?.length || 0}</Typography>
              <Box
                onClick={() => {
                  onFavoriteClick(photo);
                }}
                sx={{ cursor: "pointer", marginLeft: 3 }}
              >
                {photo?.favorited_by?.includes(props.userId) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </Box>{" "}
              <Typography>{photo?.favorited_by?.length || 0}</Typography>
            </Box>
            <Box padding={2}>
              <Box component="form" noValidate onSubmit={(event) => addComment(event, photo)} marginBottom={5}>
                <Typography fontSize={18} fontWeight={300}>
                  Add a new comment:
                </Typography>
                <TextField fullWidth variant="outlined" placeholder="Write a comment" id="comment" name="comment" autoComplete="comment" />
                <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                  Add Comment
                </Button>
              </Box>
              {photo?.comments?.length ? (
                photo?.comments?.map((comment, commentIndex) => {
                  return (
                    <Stack key={commentIndex} direction="row" gap={1} paddingY={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12, cursor: "pointer", "&:hover": { opacity: 0.8 }, transition: "0.3s", bgcolor: stringToColor(`${comment?.user?.first_name?.[0]}${comment?.user?.last_name?.[0]}`) }} onClick={() => redirectToUser(userData._id)}>
                        {comment?.user?.first_name?.[0]}
                        {comment?.user?.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={300}>
                          <Link to={"/users/" + comment.user._id} className="main-username">
                            {comment?.user?.first_name}&nbsp;
                            {comment?.user?.last_name}
                          </Link>
                          &nbsp;{comment.comment}
                        </Typography>
                        <Typography variant="body2" fontSize={11} color="GrayText">
                          {comment?.date_time}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })
              ) : (
                <Typography fontSize={12} fontWeight={300} color="gray" textAlign="center" paddingY={2}>
                  No comments found
                </Typography>
              )}
            </Box>
            {index !== (photosData?.length || 0) - 1 && <Divider />}
          </Box>
        ))
      ) : (
        <Typography variant="h6" textAlign="center">
          No photos found
        </Typography>
      )}
    </Box>
  );
}

export default UserPhotos;
