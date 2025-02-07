import { useEffect } from 'react'
import './App.css'
import Vapi from "@vapi-ai/web"
import { useState } from 'react'
import {IMEPrompt} from "./prompt"


const VAPI_KEY = "7ef6d611-72a8-4e5a-8e59-616bddf64b35"

const myVapi = new Vapi(VAPI_KEY)

function App() {
  const [isPaused, setIsPaused] = useState(false)
  const [messages, setMessages] = useState([])
  const [isCallStarted, setIsCallStarted] = useState(false)

  useEffect(() => {
    console.log(IMEPrompt)
    myVapi.on("speech-start", () => {
      console.log("Assistant Started")
    })

    myVapi.on("call-end", () => {
      console.log("Call ended")
    })

    myVapi.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript
        };

        setMessages(prevMessages => {
          if (
            prevMessages.length === 0 || 
            prevMessages[prevMessages.length - 1].content !== newMessage.content
          ) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
    });

    myVapi.on("error", (error) => {
      console.log("error", error)
    })

  }, [])

  console.log(messages)

  async function startCall() {
    setIsCallStarted(true)

    await myVapi.start({
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: IMEPrompt,
          },
          ...messages
        ],
      },
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },
      name: "Testing Assistant",
    })
  }

  function endCall() {
    myVapi.stop()
  }

  async function pauseResume() {
    if (isPaused) {
      setIsPaused(false)
      await startCall()
    } else {
      endCall()
      setIsPaused(true)
    }
  }

  return (
    <>
      <h1>Hello World</h1>
      <div className='test'>

        <button onClick={startCall}>Start Call</button>
        {
          isCallStarted &&
          <button onClick={pauseResume}>{isPaused ? "Resume" : "Pause"}</button>
        }
        <button onClick={endCall}>End Call</button>
      </div>
      <div className='h-[200px]' style={{marginTop:"20px"}}>
        {
          messages.map((message, index) => (
            <div key={index}>{message?.role}: {message?.content}</div>
          ))
        }
      </div>
    </>
  )
}

export default App
