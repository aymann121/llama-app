import { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  useLLM,
  LLAMA3_2_1B_URL,
  LLAMA3_2_1B_TOKENIZER,
} from "react-native-executorch";
// import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import * as Progress from "react-native-progress";

// import the react-native-performance package
import { Performance } from 'react-native-performance';
// import PerformanceStats from 'react-native-performance-stats';


// import the react-native-device-info package
import DeviceInfo from 'react-native-device-info';



// function to get performance metrics
// function getPerformanceMetrics() {
//   // get the memory usage
//   const memoryUsage = Performance.measure
//   // get the cpu usage
//   const cpuUsage = Performance.cpuUsage();
//   // get the network usage
//   const networkUsage = Performance.networkUsage();
//   // return tuple
//   return [memoryUsage, cpuUsage, networkUsage];
// }

// function to get battery metrics
function getBatteryMetrics() {
  // get the battery level
  const batteryLevel = DeviceInfo.getBatteryLevel();
  const isBatteryCharging = DeviceInfo.isBatteryCharging();
  // return tuple
  return [batteryLevel, isBatteryCharging];
}


const COLORS = {
  "Lavender (web)": "#eae8ff",
  Platinum: "#d8d5db",
  "French gray": "#adacb5",
  Gunmetal: "#2d3142",
  "Uranian Blue": "#b0d7ff",
};

type Message = {
  content: string;
  sender: "user" | "bot";
};



export default function Index() {
  const insets = useSafeAreaInsets();
  const [convo, setConvo] = useState<Array<Message>>([]);
  const [prompt, setPrompt] = useState("");
  // const [isDownloading, setIsDownloading] = useState(false);
  function initLLama(contextSize = 10) {
    return useLLM({
      modelSource: LLAMA3_2_1B_URL,
      tokenizerSource: LLAMA3_2_1B_TOKENIZER,
      contextWindowLength: contextSize,
    });
  }
  
  const llama = initLLama(50);

  const DIMENSIONS = useWindowDimensions();

  // useEffect(() => {
  //   // Add a listener to receive performance stats
  //   const listener = PerformanceStats.addListener((stats) => {
  //     console.log(stats);
  //   });
  
  //   // Start monitoring (pass 'true' to include CPU usage)
  //   PerformanceStats.start(true);
  
  //   // Cleanup: stop monitoring and remove the listener when the component unmounts
  //   return () => {
  //     PerformanceStats.stop();
  //     listener.remove();
  //   };
  // }, []);

  useEffect(() => {
    if (!!!!llama.response && !llama.isModelGenerating) {
      setConvo((prev) => [...prev, { content: llama.response, sender: "bot" }]);
    }
  }, [llama.response, llama.isModelGenerating]);



  async function generateResponse () {
    // get the performance metrics and battery metrics
    // console.memory();
    
    console.log("Battery Metrics", getBatteryMetrics());
    // get the prompt and check if the model is generating
    
  
    console.log("prompt", prompt);
    if (llama.isModelGenerating) {
      console.log("interrupting");
      llama.interrupt();
    } else if (prompt.trim().length !== 0) {
      console.log("generating");
      setConvo((prev) => [
        ...prev,
        { content: prompt, sender: "user" },
      ]);
      await llama.generate(prompt);
      setPrompt("");
      console.log("Battery Metrics", getBatteryMetrics());
    }

    

  }

  if (!llama.isModelReady) {
    return (
      <View style={styles.downloadViewContainer}>
        <MaterialIcons
          name="assistant"
          size={72}
          style={styles.emptyViewIcon}
          color={COLORS.Gunmetal}
        />
        <Text style={styles.downloadViewText}>
          The AI Model is not ready yet, Please wait until it gets downloaded
        </Text>

        <Progress.Bar
          width={DIMENSIONS.width * 0.75}
          color={COLORS.Gunmetal}
          progress={llama.downloadProgress / 1}
        />

        <Text style={styles.downloadViewLoadingPercentage}>
          {((llama.downloadProgress / 1) * 100).toFixed(0)}%
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      {convo.length === 0 ? (
        <View style={styles.emptyViewContainer}>
          <MaterialIcons
            name="assistant"
            size={72}
            style={styles.emptyViewIcon}
            color={COLORS.Gunmetal}
          />
          <Text style={styles.emptyViewText}>Hello, What can I help with?</Text>
        </View>
      ) : (
        <ScrollView
          style={[styles.scrollView, { marginTop: insets.top }]}
          contentContainerStyle={[
            styles.scrollContent,
            { marginTop: insets.top },
          ]}
        >
          {convo.map((msg, index) => (
            <View key={index}>
              {msg.sender === "bot" && (
                <View style={styles.botMessageContainer}>
                  <MaterialIcons
                    name="assistant"
                    size={36}
                    color={COLORS.Gunmetal}
                  />
                  <Text style={styles.messageText}>
                    {msg.content}
                  </Text>
                </View>
              )}
              {msg.sender === "user" && (
                <View style={styles.userMessageContainer}>
                  <AntDesign name="user" size={36} color={COLORS.Gunmetal} />
                  <View style={styles.userMessageBubble}>
                    <Text style={styles.messageText}>{msg.content}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
          {convo[convo.length - 1]?.sender === "user" && (
            <>
              {llama.isModelGenerating && !llama.response ? (
                <View style={styles.typingAnimationContainer}>
                  <MaterialIcons
                    name="assistant"
                    size={36}
                    color={COLORS.Gunmetal}
                  />
                </View>
              ) : (
                <View style={styles.responseContainer}>
                  <MaterialIcons
                    name="assistant"
                    size={36}
                    color={COLORS.Gunmetal}
                  />
                  <View style={styles.responseTextContainer}>
                    <Text>
                      {llama.response}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
      
      <View style={styles.inputContainer}>
        {/* <Text>{"fsdfdshi"}</Text> */}
        
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          multiline
          style={styles.textInput}
          placeholder="Enter Your Message"
        />
        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.5}
          onPress={generateResponse}
        >
          {llama.isModelGenerating ? (
            <Entypo name="controller-stop" size={36} color={COLORS.Gunmetal} />
          ) : (
            <Ionicons name="send" size={36} color={COLORS.Gunmetal} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.5}
          onPress={() => {
            // reset the convo and prompt and stop the model
            setConvo([]);
            setPrompt("");
            llama.interrupt();

          }}
        >
          <Entypo name="controller-stop" size={36} color={COLORS.Gunmetal} />
        </TouchableOpacity>
      </View>

      <View style = {styles.context}>
        {/* create buttons to call useLLM and change context size  to 50, 100, 200, 400, 800, 1600, 3200, 6400 tokens */}
        {/* <Button title = "50" onPress = {() =>initLLama(50)} />
        <Button title = "100" onPress = {() =>initLLama(100)} />
        <Button title = "200" onPress = {() =>initLLama(200)} />
        <Button title = "400" onPress = {() =>initLLama(400)} />
        <Button title = "800" onPress = {() =>initLLama(800)} />
        <Button title = "1600" onPress = {() =>initLLama(1600)} />
        <Button title = "3200" onPress = {() =>initLLama(3200)} />
        <Button title = "6400" onPress = {() =>initLLama(6400)} /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  downloadViewContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  downloadViewText: {
    color: COLORS.Gunmetal,
    textAlign: "center",
    fontSize: 18,
  },
  downloadViewLoadingPercentage: {
    fontSize: 24,
    color: COLORS.Gunmetal,
  },
  emptyViewContainer: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyViewText: {
    fontSize: 24,
    color: COLORS.Gunmetal,
  },
  emptyViewIcon: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  botMessageContainer: {
    flexDirection: "row",
    marginRight: 60,
  },
  userMessageContainer: {
    flexDirection: "row-reverse",
    marginLeft: 32,
  },
  userMessageBubble: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.Platinum,
  },
  messageText: {
    color: COLORS.Gunmetal,
    fontSize: 16,
  },
  typingAnimationContainer: {
    flexDirection: "row",
  },
  typingAnimation: {
    width: 60,
  },
  responseContainer: {
    flexDirection: "row",
    marginRight: 24,
  },
  responseTextContainer: {
    flex: 1,
  },
  inputContainer: {
    position: "absolute",
    bottom: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS["French gray"],
  },
  context: {
    position: "absolute",
    bottom: 63,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS["French gray"],
  },
  textInput: {
    flex: 1,
    minHeight: 50,
    backgroundColor: COLORS.Platinum,
    // marginVertical: 0,
    borderColor: COLORS.Gunmetal,
    borderWidth: 1,
    // marginHorizontal: 4,
    maxHeight: 180,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sendButton: {
    marginRight: 8,
  },
});

// const markdownStyles = {
//   body: { color: COLORS.Gunmetal, fontSize: 16 },
//   heading1: { color: COLORS.Gunmetal, fontSize: 24 },
//   code_block: { color: COLORS.Gunmetal, fontSize: 16 },
// };
    