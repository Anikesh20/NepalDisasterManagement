const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes); 