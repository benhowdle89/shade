import React from "react";
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  CameraRoll
} from "react-native";
import { FileSystem, FaceDetector, MediaLibrary, Permissions } from "expo";

export default class GalleryScreen extends React.Component {
  state = {
    photos: []
  };
  _mounted = false;

  componentDidMount() {
    this._mounted = true;
    FileSystem.readDirectoryAsync(FileSystem.documentDirectory + "photos").then(
      photos => {
        if (this._mounted) {
          this.setState({
            photos: [photos[0]]
          });
        }
      }
    );
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  saveToGallery = async () => {
    const { photos } = this.state;

    if (photos.length > 0) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status !== "granted") {
        throw new Error("Denied CAMERA_ROLL permissions!");
      }

      try {
        await CameraRoll.saveToCameraRoll(
          `${FileSystem.documentDirectory}photos/${photos[0]}`,
          "photo"
        );
      } catch (error) {
        console.error(error);
      }

      alert("Photo saved to your camera roll");
      this.props.onCancel();
    } else {
      alert("No photo to save!");
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.button} onPress={this.props.onCancel}>
            <Image
              source={require("./assets/error.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.saveToGallery}>
            <Image
              source={require("./assets/download-button.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.pictures}>
          {this.state.photos.map(photoUri => (
            <Image
              key={photoUri}
              style={styles.picture}
              source={{
                uri: `${FileSystem.documentDirectory}photos/${photoUri}`
              }}
            />
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff"
  },
  pictures: {
    flex: 1
  },
  picture: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    resizeMode: "cover"
  },
  button: {
    padding: 20
  }
});
