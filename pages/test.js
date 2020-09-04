import { Button } from '@material-ui/core';
import Link from 'next/link';
import axios from 'axios';
import React, { useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { Form } from 'react-bootstrap';

const initialFormData = Object.freeze({
  guess: "",
});

export default function Test() {

  // player hook
  const Player = (url) => (
    <AudioPlayer
      autoPlay
      src={url}
      onPlay={e => console.log("onPlay")}
      // other props here
    />
  );

  const [songName, setSongName] = React.useState(null);
  const [preview, setPreview] = React.useState(null);

  const [formData, updateFormData] = React.useState(initialFormData);

  const handleChange = (event) =>  {
    updateFormData({
      ...formData,
      [event.target.name]: event.target.value.trim()
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
    if (formData.guess.toLowerCase() === songName.toLowerCase()) {
      console.log("Correct!");
    }
  };

  // axios api call to update songName and preview
  React.useEffect( () => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/api/spotify/gettrack');
        const data = JSON.parse(response.data);
        console.log(data);
        setSongName(data.name);
        setPreview(data.preview);
        console.log(preview);
      } catch (err) {
        console.error(err);
      }
    } 
    fetchData();
  }, []);

  return (
    <div>
      <AudioPlayer src={ preview } />

      <Link href="/"> 
        <Button color="primary">
          { !songName ? 'Loading song name..' : `${songName}` }
        </Button>
      </Link>

      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Guess Answer:&nbsp;
            <input name="guess" onChange={handleChange} />
          </label>
          <Button color="primary" onClick={handleSubmit}>Submit</Button>
        </form>
      </div>
      
    </div>
  );
}
