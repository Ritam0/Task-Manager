import React, { useEffect, useState } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const localizer = momentLocalizer(moment);

const MyCalander = () => {
  //States of variables
  const [event, setEvent] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [email] = useState(localStorage.getItem('email'));
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    url:'https://static.vecteezy.com/system/resources/previews/013/141/780/original/todo-task-list-check-time-flat-color-icon-free-vector.jpg'
  });

  //Notify Function
  const notify = (taskTitle) => toast(`Task "${taskTitle}" is starting now!`);

  //Event Setter for Calander
  const setAllEvents = (tasks) => {
    const newEvents = tasks.map(task => ({
      title: task.title,
      start: new Date(task.startDateTime),
      end: new Date(task.endDateTime),
      description: task.description,
    }));
    setEvent(newEvents);
  };

  //Delete Task
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

  //Task Status
  const handleDoneChange = async (taskId, isDone) => {
    try {
      await axios.post('https://task-manager-73jm.onrender.com/updateTask', {
        taskId,
        done: isDone
      });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  //Task fetching
  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://task-manager-73jm.onrender.com/getTasks', {
        params: { email }
      });
      setTasks(response.data.tasks || []);
      setAllEvents(response.data.tasks);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };


  //Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.endDateTime <= newTask.startDateTime) {
      setError('End time must be greater than start time');
      return;
    }
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
        url:'https://static.vecteezy.com/system/resources/previews/013/141/780/original/todo-task-list-check-time-flat-color-icon-free-vector.jpg'
      });
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleEditTask=async (task)=>{
    handleDeleteTask(task._id);
    setNewTask({
      title: task.title,
      description: task.description,
      startDateTime:task.startDateTime,
      endDateTime: task.endDateTime,
      url:task.imageUrl
    });
    if (newTask.endDateTime <= newTask.startDateTime) {
      setError('End time must be greater than start time');
      return;
    }
    try {
      await axios.post('https://task-manager-73jm.onrender.com/editTask', {
        email,
        ...newTask
      });
      fetchTasks();
      setNewTask({
        title: '',
        description: '',
        startDateTime: new Date(),
        endDateTime: new Date(),
        url:'https://static.vecteezy.com/system/resources/previews/013/141/780/original/todo-task-list-check-time-flat-color-icon-free-vector.jpg'
      });
    } catch (err) {
      setError('Failed to add task');
    }
  }

  //ImageChange
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };


  // Upload Image
  const uploadImage = async () => {
    if (!image) {
      alert('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'taskManager'); 

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/djyxyaqno/image/upload`, 
        formData
      );

      setImageUrl(response.data.secure_url); 
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    }
  };

  //Task Filtering
  const filterTasksByDate = (tasks, selectedDate) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startDateTime);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  };

//Fetching task on render
  useEffect(() => {
    fetchTasks();
  }, []);

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
          {/* {error && <p className="text-red-500">{error}</p>} */}

          {/* Task List for today */}
          {filterTasksByDate(tasks, selectedDate).length === 0 ? (
            <p>No tasks available for this date</p>
          ) : (
            <ul className="list-disc pl-4">
              {filterTasksByDate(tasks, selectedDate).map(task => (
                <li key={task._id} className="mb-2 flex justify-between items-center">
                  <div>
                    <img src={task.imgurl} alt="" />

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

        {/* Add Task Form */}

        <div className="addTasks bg-white p-4 rounded shadow-lg w-full max-w-md">
          <form onSubmit={handleAddTask} className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Task Details</h3>
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

            {/* Upload Image */}
            <div className="image-upload">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <button onClick={uploadImage}>Upload Image</button>
              {imageUrl && (
                <div>
                  <h3>Uploaded Image:</h3>
                  <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                </div>
              )}
            </div>

            {/* Select Date */}
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

              {/* Button for save Task */}
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save Task
            </button>
          </form>
        </div>
      </div>

      <div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default MyCalander;
