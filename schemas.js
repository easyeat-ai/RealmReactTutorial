import 'react-native-get-random-values';
import {ObjectId} from 'bson';

class Task {
  /**
   *
   * @param {string} name The name of the task
   * @param {string status The status of the task. Default value is "Open"
   * @param {ObjectId} id The ObjectId to create this task with
   */
  constructor({
    name,
    status = Task.STATUS_OPEN,
    id = new ObjectId(),
    subTask,
    counter,
  }) {
    this._id = id;
    this.name = name;
    this.status = status;
    this.subTask = subTask;
    this.counter = counter;
  }

  static STATUS_OPEN = 'Open';
  static STATUS_IN_PROGRESS = 'InProgress';
  static STATUS_COMPLETE = 'Complete';

  static schema = {
    name: 'Task',
    properties: {
      _id: 'objectId',
      name: 'string',
      status: 'string',
      subTask: 'string[]',
      counter: 'int',
    },
    primaryKey: '_id',
  };
}

export {Task};
