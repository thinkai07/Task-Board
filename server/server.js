//server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const { type } = require('os');

// Initialize the Express app
const port = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://meenakumarimaligeli:Meena%40123@cluster0.ba469xs.mongodb.net/taskBoard', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const Schema = mongoose.Schema;

const usedTokenSchema = new Schema({
  token: String,
  createdAt: { type: Date, expires: '1h', default: Date.now } // Token expires after 1 hour
});
const UsedToken = mongoose.model('UsedToken', usedTokenSchema);

// Organization schema
const organizationSchema = new Schema({
  id: String,
  name: String,
  email: String,

  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
});

// // Project schema
// const projectSchema = new Schema({
//   id: String,
//   name: String,
//   teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
//   tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
// });

const projectSchema = new Schema({
  id: String,
  name: String,
  description: String,
  projectManager: String,
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' } // Reference to Organization
});


// Team schema
const teamSchema = new Schema({
  id: String,
  name: String,
  users: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, role: String }]
});

//cards shema
const cardSchema = new Schema({
  name: String,
  description: String,
  assignedTo: { type: String }, // Store email as a string
  status: { type: String, enum: ['inprogress', 'completed'], default: 'inprogress' }
});

// Task schema
const taskSchema = new Schema({
  id: String,
  name: String,
  card:[{ type: Schema.Types.ObjectId, ref: 'Card' }]
});

// User schema
const userSchema = new Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: { type: String },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Creating models
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Team = mongoose.model('Team', teamSchema);
const Project = mongoose.model('Project', projectSchema);
const Organization = mongoose.model('Organization', organizationSchema);
const Card = mongoose.model('Card', cardSchema);

module.exports = {
  User,
  Task,
  Team,
  Project,
  Organization,
  Card
};

const tempOrganizationSchema = new Schema({
  name: String,
  email: String,
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
});

const TempOrganization = mongoose.model('TempOrganization', tempOrganizationSchema);

const tempUserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String },
  organization: { type: Schema.Types.ObjectId, ref: 'TempOrganization' }
});
const TempUser = mongoose.model('TempUser', tempUserSchema);
 


// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'thinkailabs111@gmail.com',
    pass: 'zwvu hhtq cavs zkmr'
  }
});



// Send Registration Email with Token Function
const sendRegistrationEmail = (email, name, token) => {
  const link = `http://3.109.132.100/success?token=${token}`;
  const mailOptions = {
    from: 'thinkailabs111@gmail.com',
    to: email,
    subject: 'Registration Successful',
    text: `Dear ${name},\n\nYour registration was successful. Please click the following link to complete your registration and login: ${link}\n\nBest Regards,\nTeam`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending registration email:', error);
    } else {
      console.log('Registration email sent:', info.response);
    }
  });
};


app.post('/register', async (req, res) => {
  const { organizationName, organizationEmail, userName, userEmail, userPassword } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await TempUser.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the organization first
    const newOrganization = new TempOrganization({
      name: organizationName,
      email: organizationEmail,
      projects: []
    });

    await newOrganization.save();

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create the user with the organization reference and role 'admin'
    const newUser = new TempUser({
      name: userName,
      email: userEmail,
      password: hashedPassword, // Save the hashed password
      organization: newOrganization._id,
      role: 'ADMIN'
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { email: userEmail, role: 'ADMIN', userId: newUser._id },
      secretKey,
      { expiresIn: '3d' }
    );

    // Store the token in UsedToken collection
    const usedToken = new UsedToken({ token });
    await usedToken.save();

    // Send registration email with token
    sendRegistrationEmail(userEmail, userName, token);

    res.status(201).json({ message: 'Organization and user registered successfully', organization: newOrganization, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering organization and user' });
  }
});


// // Organization register
// app.post('/register', async (req, res) => {
//   const { organizationName, organizationEmail, userName, userEmail, userPassword } = req.body;

//   try {
//     // Create the organization first
//     const newOrganization = new TempOrganization({
//       name: organizationName,
//       email: organizationEmail,
//       projects: []
//     });

//     await newOrganization.save();

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(userPassword, 10);

//     // Create the user with the organization reference and role 'admin'
//     const newUser = new TempUser({
//       name: userName,
//       email: userEmail,
//       password: hashedPassword, // Save the hashed password
//       organization: newOrganization._id,
//       role: 'ADMIN'
//     });

//     await newUser.save();

//     // Generate token
//     const token = jwt.sign(
//       { email: userEmail, role: 'ADMIN', userId: newUser._id },
//       secretKey,
//       { expiresIn: '1h' }
//     );

//     // Send registration email with token
//     sendRegistrationEmail(userEmail, userName, token);

//     res.status(201).json({ message: 'Organization and user registered successfully', organization: newOrganization, user: newUser });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error registering organization and user' });
//   }
// });

// Validate email token and store data permanently
app.get('/validate-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, secretKey);
    const { email, userId } = decoded;

    const tempUser = await TempUser.findOne({ _id: userId, email });
    const tempOrganization = await TempOrganization.findOne({ _id: tempUser.organization });

    if (tempUser && tempOrganization) {
      const newOrganization = new Organization({
        name: tempOrganization.name,
        email: tempOrganization.email,
        projects: tempOrganization.projects
      });

      await newOrganization.save();

      const newUser = new User({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        organization: newOrganization._id,
        role: tempUser.role
      });

      await newUser.save();

      await TempUser.deleteOne({ _id: userId });
      await TempOrganization.deleteOne({ _id: tempOrganization._id });

      res.status(200).json({ message: 'Email validated successfully' });
    } else {
      res.status(400).json({ message: 'Invalid token or user does not exist' });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

//mail search
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      organization: req.user.organizationId
    }).select('email');

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});




// Fetch users for an organization
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organizationId });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// User data name route
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('username email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });

    }
    console.log(user.email)
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user
app.delete('/api/deleteUser/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});



// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('organization');
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign(
          { email: user.email, role: user.role, organizationId: user.organization._id },
          secretKey,
          { expiresIn: '1h' } // Token expires in 1 hour
        );
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Secret Key for JWT
const secretKey = crypto.randomBytes(32).toString('hex');

// Middleware for authenticating token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware for authorizing based on role
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Get user role route
app.get('/api/role', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('role organization');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, role: user.role, organizationId: user.organization });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




// Send Email Function
const sendResetEmail = (email, link) => {
  const mailOptions = {
    from: 'thinkailabs111@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Please click on the following link to reset your password: ${link}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
// Add user
app.post('/api/addUser', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  const { name, email, role } = req.body;

  try {
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newUser = new User({
      name,
      email,
      role: "USER",
      organization: req.user.organizationId
    });

    await newUser.save();

    const token = jwt.sign({ email, role, userId: newUser._id }, secretKey, { expiresIn: '3d' });
    const resetLink = `http://3.109.132.100/reset-password?token=${token}`;

    sendResetEmail(email, resetLink);

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error adding user' });
  }
});
//reset password
app.post('/resetPassword', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Check if the token has already been used
    const usedToken = await UsedToken.findOne({ token });
    if (usedToken) {
      return res.status(401).json({ message: 'This reset link has already been used or expired' });
    }

    // Verify the token
    const decoded = jwt.verify(token, secretKey);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const user = await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark the token as used by saving it to the database
    const newUsedToken = new UsedToken({ token });
    await newUsedToken.save();

    res.status(200).json({ message: 'Password reset successfully', user });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token has expired' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  }
});




// // Create a new project

// Function to send emails
const sendEmail = (email, subject, text) => {
  const mailOptions = {
    from: 'thinkailabs111@gmail.com',
    to: email,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};
// Endpoint to create a project
app.post('/api/projects', async (req, res) => {
  const { organizationId, name, description, projectManager } = req.body;
  console.log(projectManager)

  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newProject = new Project({
      name,
      description,
      projectManager, // Save the project manager email
      organization: organization._id,
      teams: [],
      tasks: []
    });

    await newProject.save();

    organization.projects.push(newProject._id);
    await organization.save();

    const token = jwt.sign(
      { projectId: newProject._id, name: newProject.name, description: newProject.description, projectManager: newProject.projectManager },
      secretKey,
      { expiresIn: '1h' }
    );

    const link = `http:/3.109.132.100/project?token=${token}`;
    const emailText = `Dear Project Manager,\n\nA new project has been created.\n\nProject Name: ${name}\nDescription: ${description}\n\nPlease click the following link to view the project details: ${link}\n\nBest Regards,\nTeam`;
    sendEmail(projectManager, 'New Project Created', emailText);

    res.status(201).json({ message: 'Project created and email sent to project manager', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// // Endpoint to display projects based on organization ID
app.get('/api/projects/:organizationId', authenticateToken, async (req, res) => {
  const { organizationId } = req.params;
  const userEmail = req.user.email;
  const userRole = req.user.role;

  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    let projects;
    if (userRole === 'ADMIN') {
      // Admins can see all projects
      projects = await Project.find({ organization: organizationId });
    } else {
      // Find the user
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find projects where the user is either the project manager or part of a team
      projects = await Project.find({
        organization: organizationId,
        $or: [
          { projectManager: userEmail },
          { teams: { $in: await Team.find({ 'users.user': user._id }) } }
        ]
      });
    }

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ message: 'Error retrieving projects' });
  }
});


// Delete a project
app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Find the project and remove it
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove the project reference from the organization
    await Organization.updateOne(
      { _id: deletedProject.organization },
      { $pull: { projects: projectId } }
    );

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Update (rename) a project
app.put('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name, description } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { name, description },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});



app.put('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const projectId = req.params.projectId;

    // Fetch the authenticated user's document and users where their email is in activePeople
    const [user, users] = await Promise.all([
      User.findOne({ email: userEmail }),
      User.find({ 'projects.activePeople': userEmail })
    ]);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check user's own projects
    let project = user.projects.id(projectId);

    if (!project) {
      // Check projects from activePeople
      for (let activeUser of users) {
        project = activeUser.projects.id(projectId);
        if (project) {
          activeUser.projects.id(projectId).set(req.body);
          await activeUser.save();
          return res.json(project);
        }
      }
    } else {
      project.set(req.body);
      await user.save();
      return res.json(project);
    }

    if (!project) return res.status(404).json({ message: 'Project not found' });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const projectId = req.params.projectId;

    // Fetch the authenticated user's document
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the project exists in user's own projects
    let projectIndex = user.projects.findIndex(proj => proj._id.toString() === projectId);

    if (projectIndex === -1) {
      // If not found, check projects from activePeople
      const users = await User.find({ 'projects.activePeople': userEmail });

      for (let activeUser of users) {
        projectIndex = activeUser.projects.findIndex(proj => proj._id.toString() === projectId);
        if (projectIndex !== -1) {
          // Remove the project from activeUser's projects array
          activeUser.projects.splice(projectIndex, 1);
          await activeUser.save();
          return res.json({ message: 'Project deleted successfully' });
        }
      }
    } else {
      // Remove the project from user's projects array
      user.projects.splice(projectIndex, 1);
      await user.save();
      return res.json({ message: 'Project deleted successfully' });
    }

    // If project is still not found, return 404
    return res.status(404).json({ message: 'Project not found' });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



app.get('/api/projects/:projectId/teams', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate({
      path: 'teams',
      populate: {
        path: 'users.user',
        select: 'email role' // Select only email and role fields
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Transform the data to match the frontend requirements
    const teams = project.teams.map(team => ({
      name: team.name,
      members: team.users.map(user => ({
        email: user.user.email,
        role: user.role
      }))
    }));

    res.status(200).json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
});







//tasks 
//add task
app.post('/api/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newTask = new Task({
      name,
      project: projectId
    });

    await newTask.save();

    project.tasks.push(newTask._id);
    await project.save();

    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

//get tasks
app.get('/api/projects/:projectId/tasks', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate('tasks');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = project.tasks.map(task => ({
      id: task._id,
      name: task.name,
      cards: task.cards || []
    }));

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Move column (task)
app.put('/api/projects/:projectId/tasks/:taskId/move', authenticateToken, async (req, res) => {
  const { projectId, taskId } = req.params;
  const { newIndex } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const taskIndex = project.tasks.indexOf(taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found in project' });
    }

    // Remove task from current position and insert at new position
    project.tasks.splice(taskIndex, 1);
    project.tasks.splice(newIndex, 0, taskId);

    await project.save();

    res.status(200).json({ message: 'Task moved successfully' });
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ message: 'Error moving task' });
  }
});

// Delete task
app.delete('/api/projects/:projectId/tasks/:taskId', authenticateToken, async (req, res) => {
  const { projectId, taskId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const taskIndex = project.tasks.indexOf(taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found in project' });
    }

    project.tasks.splice(taskIndex, 1);
    await project.save();

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Update (rename) task
app.put('/api/projects/:projectId/tasks/:taskId', authenticateToken, async (req, res) => {
  const { projectId, taskId } = req.params;
  const { name } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.name = name;
    await task.save();

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});




app.post('/api/tasks/:taskId/cards', authenticateToken, async (req, res) => {
  const { taskId } = req.params;
  const { name, description, assignedTo } = req.body; // Accept assignedTo in request body

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newCard = new Card({
      name,
      description,
      assignedTo,
      status: 'inprogress', // Default status
      task: taskId
    });

    await newCard.save();

    task.card.push(newCard._id);
    await task.save();

    res.status(201).json({ message: 'Card created successfully', card: newCard });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Error creating card' });
  }
});


app.get('/api/tasks/:taskId/cards', authenticateToken, async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId).populate('card');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const cards = task.card.map(card => ({
      id: card._id,
      name: card.name,
      description: card.description,
      assignedTo: card.assignedTo,
      status: card.status
    }));

    res.status(200).json({ cards });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Error fetching cards' });
  }
});
// Delete a card
app.delete('/api/tasks/:taskId/cards/:cardId', authenticateToken, async (req, res) => {
  const { taskId, cardId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const cardIndex = task.card.indexOf(cardId);
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Card not found in task' });
    }

    task.card.splice(cardIndex, 1);
    await task.save();

    await Card.findByIdAndDelete(cardId);

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Error deleting card' });
  }
});

// Update a card
app.put('/api/tasks/:taskId/cards/:cardId', authenticateToken, async (req, res) => {
  const { taskId, cardId } = req.params;
  const { name, description } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.name = name;
    card.description = description;
    await card.save();

    res.status(200).json({ message: 'Card updated successfully', card });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ message: 'Error updating card' });
  }
});
// Update card status
app.put('/api/cards/:cardId/status', authenticateToken, async (req, res) => {
  const { cardId } = req.params;
  const { status } = req.body;

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.status = status;
    await card.save();

    res.status(200).json({ message: 'Card status updated successfully', card });
  } catch (error) {
    console.error('Error updating card status:', error);
    res.status(500).json({ message: 'Error updating card status' });
  }
});

// Move a card to a different task
app.put('/api/cards/:cardId/move', authenticateToken, async (req, res) => {
  const { cardId } = req.params;
  const { sourceTaskId, destinationTaskId } = req.body;

  try {
    // Find the card
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Find the source task
    const sourceTask = await Task.findById(sourceTaskId);
    if (!sourceTask) {
      return res.status(404).json({ message: 'Source task not found' });
    }

    // Find the destination task
    const destinationTask = await Task.findById(destinationTaskId);
    if (!destinationTask) {
      return res.status(404).json({ message: 'Destination task not found' });
    }

    // Remove the card from the source task
    const cardIndex = sourceTask.card.indexOf(cardId);
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Card not found in source task' });
    }
    sourceTask.card.splice(cardIndex, 1);
    await sourceTask.save();

    // Add the card to the destination task
    destinationTask.card.push(cardId);
    await destinationTask.save();

    // Update the card's task reference
    card.task = destinationTaskId;
    await card.save();

    res.status(200).json({ message: 'Card moved successfully', card });
  } catch (error) {
    console.error('Error moving card:', error);
    res.status(500).json({ message: 'Error moving card' });
  }
});



//teams related apis

// Endpoint to add a user to a team based on project ID
app.post('/api/projects/:projectId/teams/addUser', authenticateToken,async (req, res) => {
  const { projectId } = req.params;
  const { email, teamName } = req.body;

  try {
    const project = await Project.findById(projectId).populate('teams');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let team = project.teams.find(team => team.name === teamName);
    if (!team) {
      team = new Team({
        name: teamName,
        users: []
      });
      await team.save();

      project.teams.push(team._id);
      await project.save();
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userInTeam = team.users.find(u => u.user.toString() === user._id.toString());
    if (userInTeam) {
      return res.status(400).json({ message: 'User is already in the team' });
    }

    team.users.push({ user: user._id, role: 'USER' });
    await team.save();

    res.status(200).json({ message: 'User added to team successfully', team });
  } catch (error) {
    console.error('Error adding user to team:', error);
    res.status(500).json({ message: 'Error adding user to team' });
  }
});

// Endpoint to get all users under all teams based on project ID
app.get('/api/projects/:projectId/teams/users', authenticateToken,  async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate({
      path: 'teams',
      populate: {
        path: 'users.user',
        model: 'User'
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const users = [];
    project.teams.forEach(team => {
      team.users.forEach(user => {
        users.push({
          name: user.user.name,
          email: user.user.email,
          role: user.role,
          team: team.name
        });
      });
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching team users:', error);
    res.status(500).json({ message: 'Error fetching team users' });
  }
});

// Endpoint to get users under a specific team based on project ID and team name
app.get('/api/projects/:projectId/teams/:teamName/users', authenticateToken, async (req, res) => {
  const { projectId, teamName } = req.params;

  try {
    const project = await Project.findById(projectId).populate({
      path: 'teams',
      match: { name: teamName },
      populate: {
        path: 'users.user',
        model: 'User'
      }
    });

    if (!project || project.teams.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const team = project.teams[0];
    const users = team.users.map(user => ({
      name: user.user.name,
      email: user.user.email,
      role: user.role,
      team: team.name
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching team users:', error);
    res.status(500).json({ message: 'Error fetching team users' });
  }
});

// Delete user from team
// Endpoint to delete a user from a team
app.delete('/api/projects/:projectId/teams/:teamName/users', authenticateToken, async (req, res) => {
  const { projectId, teamName } = req.params;
  const { email } = req.body;

  try {
    const project = await Project.findById(projectId).populate('teams');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const team = project.teams.find(t => t.name === teamName);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userIndex = team.users.findIndex(u => u.user.toString() === user._id.toString());
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found in the team' });
    }

    team.users.splice(userIndex, 1);
    await team.save();

    res.status(200).json({ message: 'User removed from team successfully' });
  } catch (error) {
    console.error('Error removing user from team:', error);
    res.status(500).json({ message: 'Error removing user from team' });
  }
});


// New endpoint to search for users within the project's teams
app.get('/api/projects/:projectId/users/search', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  try {
    const project = await Project.findById(projectId).populate({
      path: 'teams',
      populate: {
        path: 'users.user',
        model: 'User'
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const matchingUsers = [];
    project.teams.forEach(team => {
      team.users.forEach(user => {
        if (user.user.email.toLowerCase().includes(email.toLowerCase())) {
          matchingUsers.push({
            name: user.user.name,
            email: user.user.email,
            role: user.role,
            team: team.name
          });
        }
      });
    });

    if (matchingUsers.length === 0) {
      return res.status(404).json({ message: 'No users found within the project teams with the given email' });
    }

    res.status(200).json({ users: matchingUsers });
  } catch (error) {
    console.error('Error searching project team users:', error);
    res.status(500).json({ message: 'Error searching project team users' });
  }
});









// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected endpoint!', user: req.user });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
























