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
  // States of variables
  const [event, setEvent] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [email] = useState(localStorage.getItem('email') || null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    imgurl: 'https://static.vecteezy.com/system/resources/previews/013/141/780/original/todo-task-list-check-time-flat-color-icon-free-vector.jpg'
  });

  // Notify Function
  const notify = (taskTitle) => toast(`Task "${taskTitle}" is starting now!`);

  const checkTaskStart = (task) => {
    const now = new Date();
    const taskStartTime = new Date(task.startDateTime);
    const timeDifference = taskStartTime - now;
    if (timeDifference > 0 && !notifiedTasks.has(task._id)) {
      
      setTimeout(() => {
        notify(task.title);
        setNotifiedTasks((prev) => new Set(prev).add(task._id)); // Mark task as notified
      }, timeDifference);
    }
  };

  // Event Setter for Calendar
  const setAllEvents = (tasks) => {
    const newEvents = tasks.map(task => ({
      title: task.title,
      start: new Date(task.startDateTime),
      end: new Date(task.endDateTime),
      description: task.description,
    }));
    setEvent(newEvents);
  };

  // Delete Task
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

  // Task Status
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

  // Task fetching
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

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.endDateTime < newTask.startDateTime) {
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
        imgurl: 'https://static.vecteezy.com/system/resources/previews/013/141/780/original/todo-task-list-check-time-flat-color-icon-free-vector.jpg'
      });
      setImageUrl('');
    } catch (err) {
      setError('Failed to add task');
    }
  };

  // Edit Task
  const handleEditTask = async (task, e) => {
    e.preventDefault();
    setNewTask({
      title: task.title,
      description: task.description,
      startDateTime: new Date(task.startDateTime),
      endDateTime: new Date(task.endDateTime),
      imgurl: task.imgurl
    });
    handleDeleteTask(task._id);
    // No need to call handleAddTask here, just set the form data
  };

  // Image Change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Upload Image
  const uploadImage = async (e) => {
    e.preventDefault();
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
      setNewTask(prevTask => ({ ...prevTask, imgurl: response.data.secure_url }));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    }
  };

  // Task Filtering
  const filterTasksByDate = (tasks, selectedDate) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startDateTime);
      return taskDate.toDateString() === selectedDate.toDateString();
    });
  };

  // Fetching task on render
  useEffect(() => {
    fetchTasks();
  }, []);
  useEffect(() => {
    tasks.forEach(task => checkTaskStart(task));
  }, [tasks]);

  return (
    <div className="h-[100%] w-[90%] flex flex-col gap-8 items-center justify-center">
      <Calendar
        localizer={localizer}
        events={event}
        startAccessor="start"
        endAccessor="end"
        style={{ margin: '50px', width: '90%', height: '500px' }}
        onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)} 
        selectable
        className='bg-[#c3c4aa11] p-4 border border-[2px] rounded-md'
      />

      <div className={`rightdiv flex justify-center items-center gap-8 flex-col  w-[90%]  ${!email?'hidden':'block'}`}>
        <div className="Tasks bg-[#c3c4aa11] p-4 rounded shadow-lg w-full">
          <h3 className="text-lg font-semibold mb-2">Tasks for {selectedDate.toDateString()}</h3>
          {filterTasksByDate(tasks, selectedDate).length === 0 ? (
            <p>No tasks available for this date</p>
          ) : (
            <ul className="list-disc p-2 w-[100%] flex flex-col justify-center items-center gap-6">
              {filterTasksByDate(tasks, selectedDate).map(task => (
                <li key={task._id} className="w-[90%] mb-2 flex justify-center items-center gap-8 transform hover:scale-[1.07] transition-transform duration-300 border border-[3px] rounded-[25px]">
                  <div className='flex items-center justify-center'>
                    <img src={task.imgurl} alt="" className='w-[200px] h-[200px] p-4 rounded-[10px] m-auto left-0' />
                    <div className="details">
                      <strong>{task.title}</strong>: {task.description}
                      <br />
                      <small>
                        {new Date(task.startDateTime).toLocaleString()} - {new Date(task.endDateTime).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <button
                    className="text-red-500 ml-4 hover:text-red-700"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    🗑️
                  </button>
                  <button
                    className="text-red-500 ml-4 hover:text-red-700"
                    onClick={(e) => handleEditTask(task, e)}
                  >
                    ✏️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="addTasks bg-[#c3c4aa11] p-4 rounded shadow-lg w-full max-w-md">
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

            <div className="image-upload flex flex-col gap-6 items-center justify-center p-6">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <button onClick={uploadImage} className='p-4 rounded-[5px] w-[150px] bg-[#51d422db]'>Upload Image</button>
              {imageUrl && (
                <div>
                  <h3>Image Uploaded Successfully</h3>
                </div>
              )}
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
              className="px-4 py-2 bg-[#51d422db] text-black hover:bg-green-500 rounded"
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
