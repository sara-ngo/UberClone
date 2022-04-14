//import connection from './db.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'

function AuthServer(app) {

// database connection
//connection();

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
}
export default AuthServer;
