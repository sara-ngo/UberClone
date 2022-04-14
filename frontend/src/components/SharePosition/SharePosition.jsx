import { useEffect, useState } from 'react'
import { socket } from './Socket'

function Chat() {

  const [currentMessage, setCurrentMessage] = useState('')
  const [target, setTarget] = useState('')
  const [messageList, setMessageList] = useState([])

  const sendMessage = () => {
    if (currentMessage != '') {
      const messageData = {
        target: target,
        author: socket.id,
        message: currentMessage,
      }
      socket.emit('send_pm', messageData)
      setMessageList((list) => [...list, messageData])
      setCurrentMessage('')
    }
  }

  useEffect(() => {
    socket.emit('request_target')
  }, [])

  useEffect(() => {
    socket.on('receive_pm', (data) => {
      setTarget(data.author)
      setMessageList((list) => [...list, data])
    })
    socket.on('receive_target', (data) => {
      //console.log('target received:',data)
      setTarget(data)
    })
    return () => {
      socket.off('receive_pm')
      socket.off('receive_target')
    }
  }, [socket])

  //return ()
}

export default Chat;
export socket;
