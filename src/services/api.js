import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://athena-improver.herokuapp.com';

export default axios.create({
  baseURL,
});
