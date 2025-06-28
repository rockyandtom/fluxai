const axios = require('axios');
axios.get('https://www.runninghub.cn')
  .then(res => console.log(res.data))
  .catch(console.error); 