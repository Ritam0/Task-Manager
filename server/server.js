const  express =require('express');
const connect_db=require('./db') 
const user_model=require('./models/user_model')
const cors=require('cors')
const User=user_model;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.listen(PORT, async () => {
    await connect_db();
    console.log(`App is running on port ${PORT}`);
});


app.post('/addTask', async (req, res) => {
    try {
        const { email, title, description, startDateTime, endDateTime } = req.body;

        const user = await User.findOne({ email });
        if (!user){
            const newTask = {
                title,
                description,
                startDateTime: new Date(startDateTime),
                endDateTime: new Date(endDateTime),
            };
            iniuser = new User({
                email,
                tasks: [newTask]
            });
    
            await iniuser.save();
    
            res.status(201).json({ message: 'User created successfully', iniuser });
        }
        else{
            const newTask = {
                title,
                description,
                startDateTime: new Date(startDateTime),
                endDateTime: new Date(endDateTime),
            };
            user.tasks.push(newTask);
            await user.save();
            res.status(201).json({ message: 'Task added successfully', user });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to add task' });
    }
});
app.delete('/deleteTask', async (req, res) => {
    try {
        const { email, taskId } = req.body;

        if (!email || !taskId) {
            return res.status(400).json({ message: 'Email and taskId are required' });
        }

        const result = await User.updateOne(
            { email, 'tasks._id': taskId },
            { $pull: { tasks: { _id: taskId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Task not found or user does not exist' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
app.get('/getTasks', async (req, res) => {
    try {
        const { email } = req.query;
        console.log("email:",email)
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ tasks: user.tasks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});

app.post('/editTask', async (req, res) => {
    try {
        const { email, title, description, startDateTime, endDateTime } = req.body;

        const user = await User.findOne({ email });
        
        const newTask = {
            title,
            description,
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
        };
        user.tasks.push(newTask);
        await user.save();
        res.status(201).json({ message: 'Task edited successfully', user });
        
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to edit task' });
    }
});


