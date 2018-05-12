import { Constants, Camera, FileSystem, Permissions } from "expo";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Slider,
  Vibration,
  Image
} from "react-native";
import GalleryScreen from "./GalleryScreen";
import isIPhoneX from "react-native-is-iphonex";

const landmarkSize = 2;

const flashModeOrder = {
  off: "on",
  on: "auto",
  auto: "torch",
  torch: "off"
};

const flashModeImages = {
  off: require("./assets/003-flash-1.png"),
  on: require("./assets/004-flash.png"),
  torch: require("./assets/002-flashlight.png")
};

const cameraImage = require("./assets/001-photo-camera.png");

const wbOrder = {
  auto: "sunny",
  sunny: "cloudy",
  cloudy: "shadow",
  shadow: "fluorescent",
  fluorescent: "incandescent",
  incandescent: "auto"
};

export default class CameraScreen extends React.Component {
  state = {
    flash: "off",
    zoom: 0,
    autoFocus: "on",
    depth: 0,
    type: "front",
    whiteBalance: "auto",
    ratio: "16:9",
    showPreview: false,
    showBlackout: false,
    permissionsGranted: false
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      permissionsGranted: status === "granted"
    });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "photos"
    ).catch(e => {
      console.log(e, "Directory exists");
    });
  }

  togglePreview() {
    this.setState({
      showPreview: !this.state.showPreview
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash]
    });
  }

  takePicture = () => {
    if (this.camera) {
      this.setState(
        {
          showBlackout: true
        },
        async () => {
          await new Promise(res => setTimeout(res, 500));
          this.camera.takePictureAsync().then(data => {
            FileSystem.moveAsync({
              from: data.uri,
              to: `${FileSystem.documentDirectory}photos/Photo_1.jpg`
            }).then(() => {
              Vibration.vibrate();
              this.setState({
                showBlackout: false,
                showPreview: true
              });
            });
          });
        }
      );
    }
  };

  renderFlashButton(state) {
    const content =
      state !== "auto" ? (
        <Image
          style={{
            width: 50,
            height: 50
          }}
          source={flashModeImages[state]}
        />
      ) : (
        <View>
          <Image
            style={{
              width: 50,
              height: 50,
              marginBottom: 5
            }}
            source={flashModeImages.on}
          />
          <Text
            style={{
              fontWeight: "bold"
            }}
          >
            AUTO
          </Text>
        </View>
      );
    return content;
  }

  renderPreview() {
    return <GalleryScreen onCancel={() => this.togglePreview()} />;
  }

  renderNoPermissions() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 10
        }}
        key="no-perms"
      >
        <Text style={{ color: "white" }}>
          Camera permissions not granted - cannot open camera preview.
        </Text>
      </View>
    );
  }

  renderBlackout() {
    return (
      <View
        style={{
          backgroundColor: "#000",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 10
        }}
        key="blackout"
      />
    );
  }

  renderCamera() {
    return (
      <Camera
        ref={ref => {
          this.camera = ref;
        }}
        key="camera"
        style={{
          flex: 1
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
      >
        <View
          style={{
            flex: 0.5,
            backgroundColor: "transparent",
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: Constants.statusBarHeight
          }}
        >
          <TouchableOpacity
            style={styles.flashButton}
            onPress={this.toggleFlash.bind(this)}
          >
            {this.renderFlashButton(this.state.flash)}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 0.3,
            paddingBottom: isIPhoneX ? 20 : 0,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto"
          }}
        >
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => this.takePicture()}
          >
            <Image
              style={[{ width: 50, height: 50 }, styles.cameraButtonImage]}
              source={cameraImage}
            />
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showPreview
      ? this.renderPreview()
      : [
          this.state.showBlackout ? this.renderBlackout() : false,
          cameraScreenContent
        ].filter(Boolean);
    return <View style={styles.container}>{content}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
  },
  navigation: {
    flex: 1
  },
  flashButton: {
    flex: 0.3,
    height: 50,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  cameraButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: "#fff",
    width: 80,
    height: 80
  },
  cameraButtonImage: {},
  flipText: {
    color: "white",
    fontSize: 15
  },
  item: {
    margin: 4,
    backgroundColor: "indianred",
    height: 35,
    width: 80,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  row: {
    flexDirection: "row"
  }
});
