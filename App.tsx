import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Platform,
  PermissionsAndroid,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import WifiManager, {WifiEntry} from 'react-native-wifi-reborn';
import {FAKEWIFIDATA} from './vendor/bundle/ruby/2.6.0/data/FakeWifiData';

function App() {
  const [userSSID, setUserSSID] = useState<string>();
  const [userFrequency, setUserFrequency] = useState<number>();
  const [allWifi, setAllWifi] = useState<WifiEntry[]>([]);
  const showAlert = () => {
    if (userFrequency && (userFrequency < 2200 || userFrequency > 2600)) {
      Alert.alert(
        `Erreur : ${userSSID}`,
        `La fréquence de votre réseau semble être ${userFrequency}. Veuillez vous connecter à un réseau avec la fréquence en 2,4 Ghz pour réaliser un appairage correct.`,
      );
    } else {
      Alert.alert(
        `Félicitations`,
        `La fréquence de votre réseau semble être ${userFrequency}. Vous pouvez réaliser un appairage correct.`,
      );
    }
  };
  const getCurrentNetwork = () => {
    WifiManager.getCurrentWifiSSID()
      .then(ssid => {
        console.log('Vous êtes connecté sur :', ssid);
        setUserSSID(ssid);
      })
      .catch(error => {
        console.error('Cannot get User SSID', error);
      });
    WifiManager.getFrequency()
      .then(frequency => {
        console.log('Vous êtes connecté sur :', frequency);
        setUserFrequency(frequency);
      })
      .catch(error => {
        console.error('Cannot get User Frequency', error);
      });
  };
  const getWifiList = () => {
    WifiManager.reScanAndLoadWifiList()
      .then(wifiArray => {
        console.log('Raw WiFi list:', wifiArray);
        //setAllWifi(wifiArray);
        setAllWifi(FAKEWIFIDATA);
      })
      .catch(error => {
        console.error('Cannot get WiFi list', error);
      });
  };
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location to scan for wifi networks.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission denied');
        return;
      }
    }
    getCurrentNetwork();
    getWifiList();
  };
  useEffect(() => {
    requestLocationPermission();
  }, []);
  // 1. Fonction pour afficher les réseaux 2.4 GHz
  const show24GHzNetworks = () => {
    const networks24GHz = FAKEWIFIDATA.filter(
      wifi => wifi.frequency >= 2200 && wifi.frequency < 2650,
    );
    setAllWifi(networks24GHz);
  };

  // 2. Fonction pour afficher les réseaux 5.2 GHz
  const show52GHzNetworks = () => {
    const networks52GHz = FAKEWIFIDATA.filter(
      wifi => wifi.frequency >= 5000 && wifi.frequency <= 6000,
    );
    setAllWifi(networks52GHz);
  };

  // 3. Fonction pour trier les réseaux 5.2 GHz par fréquence
  const sort52GHzNetworks = () => {
    const sortedNetworks = FAKEWIFIDATA.filter(
      wifi => wifi.frequency >= 5000 && wifi.frequency <= 6000,
    ).sort((a, b) => a.frequency - b.frequency);
    setAllWifi(sortedNetworks);
  };
  //4. Reset
  const resetWifiList = () => {
    setAllWifi(FAKEWIFIDATA);
  };
  //5. DUAL-BAND
  const showDualBandNetworks = () => {
    const ssidMap = new Map();

    // Parcourir chaque réseau WiFi et enregistrer les SSID avec plusieurs fréquences
    FAKEWIFIDATA.forEach(wifi => {
      if (ssidMap.has(wifi.SSID)) {
        ssidMap.get(wifi.SSID).add(wifi.frequency);
      } else {
        ssidMap.set(wifi.SSID, new Set([wifi.frequency]));
      }
    });

    // Filtrer les réseaux qui ont plus d'une fréquence pour le même SSID
    const dualBandNetworks = FAKEWIFIDATA.filter(
      wifi => ssidMap.get(wifi.SSID).size > 1,
    );
    setAllWifi(dualBandNetworks);
  };
  // 6. NON DUAL-BAND
  const showNonDualBandNetworks = () => {
    const ssidMap = new Map();

    // Enregistrer chaque SSID avec ses fréquences uniques
    FAKEWIFIDATA.forEach(wifi => {
      if (ssidMap.has(wifi.SSID)) {
        ssidMap.get(wifi.SSID).add(wifi.frequency);
      } else {
        ssidMap.set(wifi.SSID, new Set([wifi.frequency]));
      }
    });

    // Filtrer les réseaux qui n'ont qu'une seule fréquence enregistrée pour le même SSID
    const nonDualBandNetworks = FAKEWIFIDATA.filter(
      wifi => ssidMap.get(wifi.SSID).size === 1,
    );
    setAllWifi(nonDualBandNetworks);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <Text style={{color: 'black', marginTop: 10}}>
          Vous êtes connecté sur :
        </Text>
        <Text style={{color: 'blue', marginTop: 10}}> {userSSID}</Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Text style={{color: 'black', marginTop: 10}}>
          Vous êtes sur la fréquence :
        </Text>
        <Text style={{color: 'blue', marginTop: 10}}> {userFrequency}</Text>
      </View>
      <ScrollView
        style={styles.display}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}>
        {allWifi.map((wifi, index) => (
          <View key={index} style={styles.wifis}>
            <Text style={styles.font}>{wifi.SSID}</Text>
            <Text style={styles.font}> : </Text>
            <Text style={styles.font}>{wifi.frequency}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={styles.buttonDisplay}
          onPress={show24GHzNetworks}>
          <Text style={styles.buttonFont}>Afficher les réseaux 2.4 Ghz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonDisplay}
          onPress={show52GHzNetworks}>
          <Text style={styles.buttonFont}>Afficher les réseaux 5.2 Ghz</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.buttonDisplay}
          onPress={sort52GHzNetworks}>
          <Text style={styles.buttonFont}>Trier les fréquences de 5.2 Ghz</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.buttonDisplay}
          onPress={showDualBandNetworks}>
          <Text style={styles.buttonFont}>Afficher les réseaux Dual-band</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonDisplay}
          onPress={showNonDualBandNetworks}>
          <Text style={styles.buttonFont}>
            Afficher les réseaux Non Dual-band
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonDisplay} onPress={showAlert}>
          <Text style={styles.buttonFont}>
            Vérifier la fréquence de mon réseau
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonDisplay2} onPress={resetWifiList}>
          <Text style={styles.buttonFont2}>Réinitialiser</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  display: {flex: 1, marginTop: 40},
  wifis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    marginVertical: 2,
  },
  font: {color: 'black', fontSize: 16},
  buttonDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'blue',
    borderRadius: 50,
    marginVertical: 10,
    width: 300,
    height: 45,
  },
  buttonFont: {color: 'white', fontSize: 16, fontWeight: '500'},
  buttonDisplay2: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 50,
    marginTop: 10,
    width: 300,
    height: 45,
  },
  buttonFont2: {color: 'blue', fontSize: 16, fontWeight: '500'},
});

export default App;
