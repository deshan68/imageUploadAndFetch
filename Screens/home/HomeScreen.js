import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  AsyncStorage,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { Camera, CameraType } from "expo-camera";
import uuid from "uuid";
import { doc, setDoc, orderBy, limit, getFirestore } from "firebase/firestore";
import "firebase/compat/storage";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
  uploadString,
  listAll,
  deleteObject,
} from "firebase/storage";
import { getApps, initializeApp } from "firebase/app";
import { firebase, app } from "../../firbase";
import * as Permissions from "expo-permissions";

const HomeScreen = ({ navigation }) => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [HandleuploadTask, setHandleuploadTask] = useState();
  const [downloadURL, setDownloadURL] = useState("");
  const d = new Date();
  const db = getFirestore(app);
  let text = d.toISOString();

  useEffect(() => {
    componentDidMount();
  }, []);

  //check permissions
  async function componentDidMount() {
    const permission = await Camera.getCameraPermissionsAsync();
    if (permission.status !== "granted") {
      const newPermission = await Camera.requestCameraPermissionsAsync();
      if (newPermission.status === "granted") {
        console.log("granted");
      } else {
        console.log("No access to camera");
      }
    } else {
    }
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      //   aspect: [4, 3],
      quality: 0.4,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log("🚀 ~ file: HomeScreen.js:44 ~ pickImage ~ image", image);
    }
  };

  const takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      //   allowsEditing: true,
      //   aspect: [4, 3],
      quality: 0.4,
    });
    if (!pickerResult.canceled) {
      setImage(pickerResult.assets[0].uri);
      console.log("🚀 ~ file: HomeScreen.js:44 ~ pickImage ~ image", image);
    }
  };
  async function uploadImageAsync(uri) {
    console.log(isUploading);
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const fileRef = ref(getStorage(), "images1/images2/" + uuid.v4());
    const imagesRef = fileRef.parent.parent;
    console.log("🚀  fileRef", fileRef.name);
    // console.log("🚀  imagesRef", imagesRef.name);

    //navigate to root folder
    const rootRef = fileRef.root;
    // console.log("🚀 rootRef", rootRef.name);

    // const result = await uploadBytes(fileRef, blob);
    const uploadTask = uploadBytesResumable(fileRef, blob);
    setHandleuploadTask(uploadTask);
    // uploadTask.resume();
    // uploadTask.cancel();

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            setIsUploading(false);
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case "storage/unauthorized":
            alert("User doesn't have permission to access the object");
            console.log("File Uploading Fail, try again");
            setIsUploading(false);
            // User doesn't have permission to access the object
            break;
          case "storage/canceled":
            // User canceled the upload
            alert(" User canceled the upload");
            console.log("File Uploading Fail, try again");
            setIsUploading(false);
            break;
          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            console.log("Unknown error occurred, inspect error.serverResponse");
            alert("File Uploading Fail, try again");
            setIsUploading(false);
            break;
        }
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // alert("Succesfully Uploaded");
          setIsUploading(false);
          setDownloadURL(downloadURL);
          console.log("File available at", downloadURL);
          setDoc(doc(db, "Posts", fileRef.name), {
            URL: downloadURL,
            description: description,
            time: text.substr(0, 10),
          })
            .then(() => {
              // setDescription("");
            })
            .catch((error) => {
              alert(error);
            });
        });
      }
    );

    // // We're done with the blob, close and release it
    // // blob.close();

    // return await getDownloadURL(fileRef);
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, "images1");

    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          console.log("260", folderRef.name);
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
        });
        res.items.forEach((itemRef) => {
          // All the items under listRef.
          console.log(itemRef.name);
        });
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
        console.log(error);
      });
  }

  return (
    <View style={styles.container}>
      <View style={{ width: "90%" }}>
        <TextInput
          placeholder="Description "
          onChangeText={setDescription}
          value={description}
          style={{
            backgroundColor: "white",
            height: 50,
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
          }}
        ></TextInput>
      </View>
      <View style={{ width: "90%", margin: 10 }}>
        <TouchableOpacity
          onPress={() => pickImage()}
          style={{
            backgroundColor: "lightblue",
            height: 50,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>Choose A photo</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: "90%", margin: 10 }}>
        <TouchableOpacity
          onPress={
            () => takePhoto()
            // HandleuploadTask.pause()
          }
          style={{
            backgroundColor: "lightblue",
            height: 50,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>Take A Photo</Text>
        </TouchableOpacity>
      </View>
      <View>
        {image && (
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
        )}
      </View>
      <View style={{ width: "90%", margin: 10 }}>
        <TouchableOpacity
          onPress={() => {
            uploadImageAsync(image);
            setIsUploading(true);
          }}
          style={{
            backgroundColor: "lightblue",
            height: 50,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          {isUploading == true ? (
            <View>
              <ActivityIndicator color={"black"} size="small" />
            </View>
          ) : (
            <Text>Upload Posts</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={{ width: "90%", margin: 10 }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PostList", { description: description })
          }
          style={{
            backgroundColor: "lightblue",
            height: 50,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>See Posts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
