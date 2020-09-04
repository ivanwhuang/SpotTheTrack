export default function chatBubble({ name, isMyself, time, text }) {
  return isMyself ? (
    <div className='msg right-msg'>
      <div className='msg-bubble'>
        <div className='msg-info'>
          <div className='msg-info-name'>{name}</div>
          <div className='msg-info-time'>{time}</div>
        </div>

        <div className='msg-text'>{text}</div>
      </div>
    </div>
  ) : (
    <div className='msg left-msg'>
      <div className='msg-bubble'>
        <div className='msg-info'>
          <div className='msg-info-name'>{name}</div>
          <div className='msg-info-time'>{time}</div>
        </div>

        <div className='msg-text'>{text}</div>
      </div>
    </div>
  );
}
