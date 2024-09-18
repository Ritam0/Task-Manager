import React, { useState } from 'react';
import { NotificationManager, NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css'; 

const Notify = () => {
  const [timeToNotify] = useState(2); // Notification time is 2 seconds

  const scheduleNotification = () => {
    const timeToNotifyInMs = timeToNotify * 1000; // Convert 2 seconds to milliseconds

    setTimeout(() => {
      // Trigger the notification
      NotificationManager.info(
        'It is time for your task!', // The body of the notification
        'Task Reminder',             // The title of the notification
        3000                         // Duration the notification will be displayed (in milliseconds)
      );
    }, timeToNotifyInMs); // Notification will show after 2 seconds
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold">Schedule Browser Notification</h2>

      <p className="mt-4">Notification will be sent in: 2 seconds</p>

      <button
        onClick={scheduleNotification}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Schedule Notification
      </button>

      {/* Notification container renders the notifications */}
      <NotificationContainer />
    </div>
  );
};

export default Notify;
