import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import api from '../services/api';

import classes from './Text.module.css';

const Text = () => {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState('');
  const [text, setText] = useState('');

  const onDrop = useCallback((acceptedFiles) => setFile(acceptedFiles[0]), []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const sendFile = useCallback(() => {
    const data = new FormData();
    data.append('file', file);
    api.put('/', data)
      .then((res) => {
        localStorage.setItem('token', res.data);
        setToken(res.data);
      })
      .catch((err) => console.log(err));
  }, [file]);

  useEffect(() => {
    if(!file) return;
    sendFile();
  }, [sendFile, file]);

  useEffect(() => {
    if(token === '') return;
    api.get('/', {
      params: {
        token
      }
    })
    .then((res) => setText(res.data))
    .catch((err) => console.log(err));
  }, [token]);

  return (
    <div className={classes.container}>
      <div {...getRootProps()} style={{ height: 200, width: '100%' }}>
        <input {...getInputProps()} />
        <div onClick={(e) => e.stopPropagation()}>
          {text.split(/\n/).map((t, i) => <p key={i}>{t}</p>)}
        </div>
      </div>
    </div>
  );
}

export default Text;
