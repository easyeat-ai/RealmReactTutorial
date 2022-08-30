import Realm from 'realm';

// Invokes the shared instance of the Realm app.
// TODO: Create a Realm App instance with your Realm app ID.
const app = new Realm.App({id: 'tasktracker-cmjyp'}); // Set Realm app ID here.
Realm.App.Sync.setLogLevel(app, 'debug');
Realm.App.Sync.setLogger(app, (level, message) =>
  console.log(`[${level}] ${message}`),
);
export default app;
