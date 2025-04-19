require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shree_annpurna_dhaba', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'shreeannpurna',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/shree_annpurna_dhaba' }),
  cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');
const inventoryRoutes = require('./routes/inventory');
const billRoutes = require('./routes/bill');
const reportRoutes = require('./routes/report');
const settingRoutes = require('./routes/setting');
const expenseRoutes = require('./routes/expense');
const attendanceRoutes = require('./routes/attendance');
const staffRoutes = require('./routes/staff');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/bills', billRoutes);
app.use('/report', reportRoutes);
app.use('/settings', settingRoutes);
app.use('/expenses', expenseRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/staff', staffRoutes);

app.get('/', (req, res) => {
  res.render('index', { title: 'Shree Annpurna Dhaba - ERP' });
});

// TODO: Import and use other routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
