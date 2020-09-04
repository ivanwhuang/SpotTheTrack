import { Button } from 'react-bootstrap';
import React, { useState } from 'react';

import ChatBubble from './chatBubble';

export default function GameChat() {
  const [msg, setMsg] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const handleMsgChange = (e) => {
    setMsg(e.target.value);
  };

  const handleMsgSubmit = (e) => {
    e.preventDefault();
    addToChatLog(msg);
    setMsg('');
  };

  const addToChatLog = (text) => {
    var msg = {
      name: 'Ivan',
      isMyself: true,
      time: '12:47',
      text: text,
    };
    setChatLog([...chatLog, msg]);
  };

  return (
    <div className='msger'>
      <header className='msger-header'>
        <div className='msger-header-title'>
          <i className='fa fa-comment'></i> Game Chat
        </div>
        <div className='msger-header-options'>
          <span>
            <i className='fa fa-cog'></i>
          </span>
        </div>
      </header>

      <main className='msger-chat'>
        {chatLog.map((msg) => (
          <ChatBubble
            key={msg.name}
            isMyself={msg.isMyself}
            name={msg.name}
            time={msg.time}
            text={msg.text}
          />
        ))}
      </main>

      <form className='msger-inputarea' onSubmit={handleMsgSubmit}>
        <input
          type='text'
          className='msger-input'
          placeholder='Take a guess!'
          onChange={handleMsgChange}
          value={msg}
        ></input>
        <Button variant='info' type='submit' className='msger-send-btn'>
          Send
        </Button>
      </form>
    </div>
  );
}
