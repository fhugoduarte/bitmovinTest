import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BitmovinPlayer, { RNBitmovinVideoManager } from 'react-native-bitmovin-player';
import AsyncStorage from '@react-native-community/async-storage';

export default function App() {

  const [offlineSource, setOfflineSource] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    RNBitmovinVideoManager.onDownloadCompleted(value => {
      console.log("onDownloadCompleted", value);
      AsyncStorage.setItem("source", JSON.stringify(value));
      setOfflineSource(value);
      setDownloading(false);
    });
    RNBitmovinVideoManager.onDownloadProgress(progress => {
      console.log("onDownloadProgress", progress);
      setDownloadProgress(progress)
    });
    
    RNBitmovinVideoManager.onDownloadError(value => {
      console.log("onDownloadError", value);
      setDownloading(false);
      setOfflineSource(null);
    });
    
    RNBitmovinVideoManager.onDownloadCanceled(value => {
      console.log("onDownloadCanceled", value);
      setDownloading(false);
      setOfflineSource(null);
    });

    RNBitmovinVideoManager.onDownloadSuspended(value => {
      console.log("onDownloadSuspended", value);
      setDownloading(!value);
    });

    RNBitmovinVideoManager.onState(state => {
      console.warn("onState", state);
    })

    async function getAsync() {
      const source = await AsyncStorage.getItem("source");

      if (source) {
        setOfflineSource(JSON.parse(source));
      }
    }

    getAsync();

  }, []);

  function handleStartDownlaodRocket() {
    setDownloading(true);
    RNBitmovinVideoManager.download({ url: "https://europa.rocketseat.dev/outputs/2f725f4d-208c-4945-8cd3-8ec1e3814e9a/master.m3u8", title: "Rocketseat" });
  }

  function handleDeleteVideo() {
    RNBitmovinVideoManager.delete(offlineSource);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleStartDownlaodRocket}>
        <Text style={styles.title}>Download Video</Text>
      </TouchableOpacity>

      {!!offlineSource && (<TouchableOpacity style={styles.button} onPress={handleDeleteVideo}>
        <Text style={styles.title}>Delete Video</Text>
      </TouchableOpacity>)}

      <BitmovinPlayer 
        configuration={{
          source: {
            title: 'It works',
            url: 'https://europa.rocketseat.dev/outputs/2f725f4d-208c-4945-8cd3-8ec1e3814e9a/master.m3u8',
          },
          offlineSource
        }}
        onError={(e) => console.log("error", e)}
        style={{width: 350, height: 200}}
      />

      {downloading && <Text>{`download progress: ${Math.round(downloadProgress)} %`}</Text>}

      <TouchableOpacity style={styles.button} onPress={() => RNBitmovinVideoManager.pauseDownload()}>
        <Text style={styles.title}>Pause Download</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => RNBitmovinVideoManager.resumeDownload()}>
        <Text style={styles.title}>Resume Download</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => RNBitmovinVideoManager.cancelDownload()}>
        <Text style={styles.title}>Cancel Download</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  downloadButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#FFF"
  },
  button: {
    backgroundColor: "#7159c1",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  info: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#000",
  },
})