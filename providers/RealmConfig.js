import app from '../realmApp';
import {Task, SubTaskRef} from '../schemas';

const OpenRealmBehaviorConfiguration = {
  type: 'openImmediately',
};
const realmConfig = {
  schema: [Task, SubTaskRef],
  schemaVersion: 29,
  sync: {
    user: app.currentUser,
    flexible: true,
    initialSubscriptions: {
      update: (subs, realm) => {
        subs.add(realm.objects(Task.name));
      },
    },
    newRealmFileBehavior: OpenRealmBehaviorConfiguration,
    existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
  },
};

export {realmConfig};
