import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/GameChat.module.css';

import { Button } from 'react-bootstrap';

export function ChatBubble({ name, isMyself, time, text }) {
  return isMyself ? (
    <div className={`${styles.msg} ${styles.rightMsg}`}>
      <div className={styles.msgBubble}>
        <div className={styles.msgInfo}>
          <div className={styles.msgInfoName}>{name}</div>
          <div className={styles.msgInfoTime}>{time}</div>
        </div>
        <div>{text}</div>
      </div>
    </div>
  ) : (
    <div className={`${styles.msg} ${styles.leftMsg}`}>
      <div className={styles.msgBubble}>
        <div className={styles.msgInfo}>
          <div className={styles.msgInfoName}>{name}</div>
          <div className={styles.msgInfoTime}>{time}</div>
        </div>
        <div>{text}</div>
      </div>
    </div>
  );
}

export default function GameChat({
  chatLog,
  socket_id,
  guess,
  handleGuessChange,
  handleGuessSubmit,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottomOfChat = () => {
    messagesEndRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  };

  useEffect(() => {
    scrollToBottomOfChat();
  }, [chatLog]);

  return (
    <div className={styles.chat}>
      <header className={styles.chatHeader}>Game Chat</header>
      <main className={styles.chatContent}>
        {chatLog.map((guess) => (
          <ChatBubble
            key={Math.random()}
            isMyself={guess.socketid == socket_id}
            name={guess.name}
            time={guess.time}
            text={guess.text}
          />
        ))}
        <div ref={messagesEndRef}></div>
      </main>
      <form className={styles.guessInputLayout} onSubmit={handleGuessSubmit}>
        <input
          type='text'
          className={styles.guessInput}
          placeholder='Take a guess!'
          onChange={handleGuessChange}
          value={guess}
        ></input>
        <Button variant='info' type='submit' className={styles.sendGuessBtn}>
          Send
        </Button>
      </form>
    </div>
  );
}
