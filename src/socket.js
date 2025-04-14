// import io from 'socket.io-client';

// const socket = io('http://localhost:4000', {
//   withCredentials: true,
//   extraHeaders: {
//     'my-custom-header': 'abcd',
//   },
// });

// export default socket;

import io from 'socket.io-client';

const socket = io('http://192.168.101.12:4000', {
  withCredentials: false, // Disable credentials for now
  extraHeaders: {
    'my-custom-header': 'abcd',
  },
});

export default socket;