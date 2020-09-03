import { Button } from '@material-ui/core';
import Link from 'next/link';
import axios from 'axios';
import React from 'react';
import AudioPlayer from 'react-h5-audio-player';

export default function Test() {

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
    </div>
  );
}
