import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

import { useRoute } from "@react-navigation/native";
import { firebase, app, firebaseConfig } from "../../firbase";
import { doc, setDoc, orderBy, limit, getFirestore } from "firebase/firestore";

import { initializeApp } from "firebase/app";

{
  /* <Text>{route.params.description}</Text> */
}

const PostsScreen = () => {
  const route = useRoute();

  const [name, setName] = useState("");
  const [registerList, setRegisterList] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const app = initializeApp(firebaseConfig);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const image = {
    uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
  };
  const [itemsLimet, setItemLimits] = useState(5);
  const userRef = firebase
    .firestore()
    .collection("Posts")
    .limit(itemsLimet)
    .orderBy("time");
  const [isRefreshing, setIsRefreshing] = useState(false); // pull to refresh entire page
  const [isLoading, setisLoading] = useState(false); //for each images
  const [ImageRealSize, setImageRealSize] = useState("");
  const [mianloadingIndicator, setmianloadingIndicator] = useState(true);
  const [loading, setLoading] = useState(false); // Set loading to true on component mount

  useEffect(() => {
    GetData();
    // async function check() {
    //   userRef.onSnapshot((querySnapshot) => {
    //     const users = [];
    //     querySnapshot.forEach((doc) => {
    //       const { URL, description, time } = doc.data();
    //       users.push({
    //         URL,
    //         description,
    //         time,
    //       });
    //     });
    //     setUsers([...users]);
    //     setmianloadingIndicator(false);
    //   });
    //   console.log(
    //     "🚀 ~ file: PostsScreen.js:41 ~ userRef.onSnapshot ~ users",
    //     users
    //   );
    // }
    // check();
  }, []);

  const ItemView = ({ item, index }) => {
    return (
      <View key={index} item={item} style={styles.mainItem}>
        <View style={styles.descriptionWrapper}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                marginHorizontal: 5,
                overflow: "hidden",
              }}
            >
              <Image
                source={image}
                resizeMode="cover"
                style={styles.image}
              ></Image>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  paddingHorizontal: 5,
                  paddingTop: 5,
                }}
              >
                {item.description}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "200",
                  paddingHorizontal: 5,
                  paddingBottom: 5,
                }}
              >
                {item.time}
              </Text>
            </View>
          </View>
          <View style={{ paddingTop: Platform.OS === "ios" ? 7 : 0 }}>
            <Text>This is a discriptions</Text>
          </View>
        </View>
        <View style={styles.imageWrapper}>
          {
            <Image
              loadingIndicatorSource={require("../../assets/icons8-spinner-24.png")}
              source={{
                uri: item.URL,
              }}
              style={{ width: 420, height: 250, zIndex: 2 }}
              resizeMode="cover"
              onLoadStart={() => setisLoading(true)}
              // onProgress={onProgress}
              onLoadEnd={() => setisLoading(false)}
            />
          }
          {isLoading &&
            // <ActivityIndicator
            //   style={{ position: "absolute", top: 125, zIndex: 1 }}
            //   size={"large"}
            //   color="black"
            // />
            null}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#32CBFF",
            height: 40,
            width: "90%",
            borderRadius: 10,
            marginTop: 5,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,

            elevation: 3,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Button</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const LoadMoreItem = () => {
    setLoading(true);
    GetData();
  };
  const OnRefresh = () => {
    setIsRefreshing(true);
    setUsers([]);
    setItemLimits(5);
    GetData();
  };
  const listHeader = () => {
    return (
      <View>
        <Text>Header</Text>
      </View>
    );
  };
  const Divider = () => {
    return <View style={styles.divider} />;
  };
  const renderLoader = () => {
    return loading ? (
      <View style={{ margin: 60 }}>
        <ActivityIndicator size="small"></ActivityIndicator>
      </View>
    ) : null;
  };
  async function GetData() {
    userRef.onSnapshot((querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        const { URL, description, time } = doc.data();
        users.push({
          URL,
          description,
          time,
        });
      });
      setUsers([...users]);
      setItemLimits(itemsLimet + 5);
      setLoading(false);
      setIsRefreshing(false);
      setmianloadingIndicator(false);
    });
  }

  if (mianloadingIndicator) {
    return (
      <ActivityIndicator
        size="large"
        color={"#32CBFF"}
        style={styles.container}
      />
    );
  } else {
    return (
      <View style={styles.container}>
        <FlatList
          style={{ width: "100%" }}
          data={users}
          renderItem={ItemView}
          // key={user.uid}
          // keyExtractor={(item, index) => console.log(item.firstName)}
          keyExtractor={(item) => item.URL}
          ListHeaderComponent={listHeader}
          ListFooterComponent={renderLoader}
          onEndReached={LoadMoreItem}
          onEndReachedThreshold={0}
          alwaysBounceVertical={false}
          // extraData={OnRefresh}
          ItemSeparatorComponent={Divider}
          flashScrollIndicators={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={OnRefresh}
              progressViewOffset={10}
              title="pull to refresh"
              tintColor="blue"
              progressBackgroundColor="white" //andriod
            ></RefreshControl>
          }
        ></FlatList>
      </View>
    );
  }
};

export default PostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  mainItem: {
    alignItems: "center",
    marginBottom: 23,
  },
  descriptionWrapper: {
    width: "100%",
    backgroundColor: "#F2F2F2",
    height: "auto",
    paddingTop: 10,
    padding: 7,
    alignItems: "flex-start",
  },
  imageWrapper: {
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    zIndex: 0,
  },
  image: {
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "black",
  },
});
