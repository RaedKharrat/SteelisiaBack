// // import { initializeApp, cert } from 'firebase-admin/app';
// // import { getStorage } from 'firebase-admin/storage';
// // import serviceAccount from './steelisia-a5d5d-firebase-adminsdk-3lzyo-3cb3dfe377.json' assert { type: 'json' };

// // initializeApp({
// //     credential: cert(serviceAccount),
// //     storageBucket: 'steelisia-a5d5d.appspot.com', // Your Firebase project ID
// // });

// // const bucket = getStorage().bucket();

// // if (!bucket) {
// //     console.error('Firebase Storage bucket initialization failed. Check your configuration.');
// //     throw new Error('Firebase Storage bucket initialization failed.');
// // }

// // export default bucket;
// import { initializeApp, cert } from 'firebase-admin/app';
// import { getStorage } from 'firebase-admin/storage';
// import serviceAccount from './steelisia-a5d5d-firebase-adminsdk-3lzyo-3cb3dfe377.json' assert { type: 'json' };

// const app = initializeApp({
//     credential: cert(serviceAccount),
//     storageBucket: 'steelisia-a5d5d.appspot.com',
// });

// export const bucket = getStorage().bucket();

// export default bucket; // This is the default export
