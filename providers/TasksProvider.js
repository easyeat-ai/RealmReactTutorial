import React, {useContext, useState, useEffect, useRef} from 'react';
import 'react-native-get-random-values';
import Realm, {schemaVersion} from 'realm';
import {Task} from '../schemas';
import {useAuth} from './AuthProvider';
import {ObjectId} from 'bson';
import {EditTask} from '../components/EditTask';
import {Overlay} from 'react-native-elements';
import {SubTaskView} from '../views/SubTaskView';
import {EditSubTask} from '../components/EditSubTask';

const TasksContext = React.createContext(null);

const TasksProvider = ({navigation, children}) => {
  const [tasks, setTasks] = useState([]);
  const [updatedTask, setUpdatedTask] = useState();
  const [subTaskIndexToUpdate, setSubTaskIndexToUpdate] = useState();
  const [subTaskInitalVal, setsubTaskInitalVal] = useState('');

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayVisibleForSubTask, setOverlayVisibleForSubTask] =
    useState(false);
  const {user} = useAuth();

  // Use a Ref to store the realm rather than the state because it is not
  // directly rendered, so updating it should not trigger a re-render as using
  // state would.

  const realmRef = useRef(null);

  useEffect(() => {
    // Enables offline-first: opens a local realm immediately without waiting
    // for the download of a synchronized realm to be completed.
    const OpenRealmBehaviorConfiguration = {
      type: 'openImmediately',
    };
    const config = {
      schema: [Task.schema],
      schemaVersion: 3,
      sync: {
        user: user,
        flexible: true,
        initialSubscriptions: {
          update: (subs, realm) => {
            subs.add(realm.objects(Task.schema.name).filtered('counter >= 1'));
          },
        },
        newRealmFileBehavior: OpenRealmBehaviorConfiguration,
        existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
      },
    };

    // open a realm for this particular project
    Realm.open(config).then(projectRealm => {
      realmRef.current = projectRealm;
      const syncTasks = projectRealm.objects('Task');
      const longRunningTasks = syncTasks.filtered('counter >= 1');
      let sortedTasks = longRunningTasks.sorted('name');
      setTasks([...sortedTasks]);
      sortedTasks.forEach(task => {
        console.log('id : ', task._id);
        console.log('name :', task.name);
        console.log('status :', task.status);
        console.log('subtasks :', task.subTask);
        console.log('*****************');
      });

      //  Realm.App.Sync.setLogLevel(user, 'debug');

      sortedTasks.addListener(() => {
        setTasks([...sortedTasks]);
      });

      // sortedTasks.addListener((tasks, changes) => {
      //   // console.log('inside listener tasks', tasks);
      //   // console.log('inside listener changes', changes);
      //   setTasks([...sortedTasks]);
      // });

      // //correct code
      // sortedTasks.addListener(() => {
      //   setTasks([...sortedTasks]);
      // });

      // Check subscription state
      // console.log(
      //   projectRealm.subscriptions.state,
      //   'projectRealm.subscriptions.state',
      // ); // log the subscription state
    });

    // TODO: Open the project realm with the given configuration and store
    // it in the realmRef. Once opened, fetch the Task objects in the realm,
    // sorted by name, and attach a listener to the Task collection. When the
    // listener fires, use the setTasks() function to apply the updated Tasks
    // list to the state.

    return () => {
      // cleanup function
      const projectRealm = realmRef.current;
      if (projectRealm) {
        projectRealm.close();
        realmRef.current = null;
        // TODO: close the project realm and reset the realmRef's
        // current value to null.
        setTasks([]);
      }
    };
  }, [user]);

  const createTask = newTaskName => {
    const projectRealm = realmRef.current;
    if (projectRealm) {
      projectRealm.write(() => {
        // Create a new task -- that is, in the same project.
        projectRealm.create(
          'Task',
          new Task({
            name: newTaskName || 'New Task',
            // subTask: [`   ${newTaskName} subTask1`, `   ${newTaskName} subTask2`],
            counter: 1,
          }),
        );
      });
    }
  };

  const setTaskStatus = (task, status) => {
    // One advantage of centralizing the realm functionality in this provider is
    // that we can check to make sure a valid status was passed in here.
    if (
      ![
        Task.STATUS_OPEN,
        Task.STATUS_IN_PROGRESS,
        Task.STATUS_COMPLETE,
      ].includes(status)
    ) {
      throw new Error(`Invalid status: ${status}`);
    }
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      task.status = status;
    });
  };

  // Define the function for deleting a task.
  const deleteTask = task => {
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      projectRealm.delete(task);
      setTasks([...projectRealm.objects('Task').sorted('name')]);
    });
    // TODO: In a write block, delete the Task.
  };

  // Define the function for Edit a task.
  //TODO:

  const editTask = (task, updatedName) => {
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      task.name = updatedName;
    });
    setOverlayVisible(false);
  };

  const editSubTask = (task, index, updatedSubTask) => {
    console.log('updation perform at index', index);
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      task.subTask[index] = updatedSubTask;
    });
    setOverlayVisibleForSubTask(false);
  };

  const viewSubTask = task => {
    navigation.navigate('SubTask List', {
      taskObj: task,
    });
  };

  const editTaskView = task => {
    setUpdatedTask(task);
    setOverlayVisible(true);
  };

  const editSubTaskView = (task, index, subTask) => {
    setSubTaskIndexToUpdate(index);
    setsubTaskInitalVal(subTask);
    setUpdatedTask(task);
    setOverlayVisibleForSubTask(true);
  };

  const deleteSubTaskView = (task, index) => {
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      //Option 1
      task.subTask = [
        ...task.subTask.slice(0, index),
        ...task.subTask.slice(index + 1),
      ];
    });
  };

  const increaseCounter = task => {
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      task.counter = task.counter + 1;
    });
  };

  const decreaseCounter = task => {
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      task.counter = task.counter - 1;
      if (task.counter < 0) {
        task.counter = 0;
      }
    });
  };

  const addSubTaskView = task => {
    setUpdatedTask(task);
    setsubTaskInitalVal('');
    setOverlayVisibleForSubTask(true);
  };

  const addSubTask = (task, newSubTaskVal) => {
    console.log('add SUbtask called');
    const projectRealm = realmRef.current;
    projectRealm.write(() => {
      task.subTask.push(newSubTaskVal);
    });
    setOverlayVisibleForSubTask(false);
  };

  // Render the children within the TaskContext's provider. The value contains
  // everything that should be made available to descendants that use the
  // useTasks hook.
  return (
    <>
      <TasksContext.Provider
        value={{
          createTask,
          deleteTask,
          setTaskStatus,
          editTaskView,
          editTask,
          viewSubTask,
          editSubTaskView,
          deleteSubTaskView,
          editSubTask,
          addSubTaskView,
          addSubTask,
          increaseCounter,
          decreaseCounter,
          tasks,
        }}>
        {children}
        <Overlay
          isVisible={overlayVisible}
          onBackdropPress={() => setOverlayVisible(false)}>
          <EditTask taskObj={updatedTask} />
        </Overlay>
        <Overlay
          isVisible={overlayVisibleForSubTask}
          onBackdropPress={() => setOverlayVisibleForSubTask(false)}>
          <EditSubTask
            taskObj={updatedTask}
            index={subTaskIndexToUpdate}
            subTaskVal={subTaskInitalVal}
          />
        </Overlay>
      </TasksContext.Provider>
    </>
  );
};

// The useTasks hook can be used by any descendant of the TasksProvider. It
// provides the tasks of the TasksProvider's project and various functions to
// create, update, and delete the tasks in that project.
const useTasks = () => {
  const task = useContext(TasksContext);
  if (task == null) {
    throw new Error('useTasks() called outside of a TasksProvider?'); // an alert is not placed because this is an error for the developer not the user
  }
  return task;
};

export {TasksProvider, useTasks};
