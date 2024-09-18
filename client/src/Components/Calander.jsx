import React, { useEffect, useState } from 'react';
import { NotificationManager, NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const localizer = momentLocalizer(moment);

const MyCalander = () => {
  const [event, setEvent] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [email] = useState(localStorage.getItem('email'));
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
  });

  const setAllEvents = (tasks) => {
    const newEvents = tasks.map(task => ({
      title: task.title,
      start: new Date(task.startDateTime),
      end: new Date(task.endDateTime),
      description: task.description,
    }));
    setEvent(newEvents);
  };

  const handleDeleteTask = async taskId => {
    try {
      await axios.delete('https://task-manager-73jm.onrender.com/deleteTask', {
        data: { email, taskId }
      });
      setTasks(tasks.filter(task => task._id !== taskId));
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://task-manager-73jm.onrender.com/getTasks', {
        params: { email }
      });
      setTasks(response.data.tasks || []);
      setAllEvents(response.data.tasks);
      scheduleTaskNotifications(response.data.tasks);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const scheduleTaskNotifications = (tasks) => {
    tasks.forEach(task => {
      const taskStart = new Date(task.startDateTime).getTime();
      const now = new Date().getTime();
      const timeToNotify = taskStart - now;

      if (timeToNotify > 0) {
        setTimeout(() => {
          NotificationManager.info(
            `Task "${task.title}" is starting soon!`,
            'Task Reminder',
            3000
          );
        }, timeToNotify); 
      }
    });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://task-manager-73jm.onrender.com/addTask', {
        email,
        ...newTask
      });
      fetchTasks();
      setNewTask({
        title: '',
        description: '',
        startDateTime: new Date(),
        endDateTime: new Date(),
      });
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleEditTask = (task) => {
    setNewTask({
      title: task.title,
      description: task.description,
      startDateTime: task.startDateTime,
      endDateTime: task.endDateTime,
    });
    handleDeleteTask(task._id);
  };

  
  const filterTasksByDate = (tasks, selectedDate) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startDateTime);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  };

  useEffect(() => {
    fetchTasks();
  }, [email]);

  return (
    <div className="h-[100%] flex flex-col items-center justify-center">
      <Calendar
        localizer={localizer}
        events={event}
        startAccessor="start"
        endAccessor="end"
        style={{ margin: '50px', width: '90%', height: '500px' }}
        onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)} 
        selectable
      />
      <div className="rightdiv flex justify-center items-center gap-8 flex-col border border-green">
        <p className="text-center mt-4 text-xl font-bold">Date: {selectedDate.toDateString()}</p>
        <div className="Tasks bg-white p-4 rounded shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Tasks for {selectedDate.toDateString()}</h3>
          {error && <p className="text-red-500">{error}</p>}
          {filterTasksByDate(tasks, selectedDate).length === 0 ? (
            <p>No tasks available for this date</p>
          ) : (
            <ul className="list-disc pl-4">
              {filterTasksByDate(tasks, selectedDate).map(task => (
                <li key={task._id} className="mb-2 flex justify-between items-center">
                  <div>
                    <strong>{task.title}</strong>: {task.description}
                    <br />
                    <small>
                      {new Date(task.startDateTime).toLocaleString()} - {new Date(task.endDateTime).toLocaleString()}
                    </small>
                  </div>
                  <button
                    className="text-red-500 ml-4 hover:text-red-700"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    🗑️
                  </button>
                  <button
                    className="text-red-500 ml-4 hover:text-red-700"
                    onClick={() => handleEditTask(task)}
                  >
                    ✏️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="addTasks bg-white p-4 rounded shadow-lg w-full max-w-md">
          <form onSubmit={handleAddTask} className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Add Task</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
              <DatePicker
                selected={newTask.startDateTime}
                onChange={(date) => setNewTask({ ...newTask, startDateTime: date })}
                showTimeSelect
                dateFormat="Pp"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <DatePicker
                selected={newTask.endDateTime}
                onChange={(date) => setNewTask({ ...newTask, endDateTime: date })}
                showTimeSelect
                dateFormat="Pp"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save Task
            </button>
          </form>
        </div>
      </div>

      {/* Notification container renders the notifications */}
      <NotificationContainer />
    </div>
  );
};

export default MyCalander;
