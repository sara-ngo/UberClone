//import connection from './db.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'
import userInfoRoutes from './routes/userInfo.js'

function AuthServer(app) {

// database connection
//connection();

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/userInfo", userInfoRoutes);
}
export default AuthServer;
