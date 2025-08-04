import { PORT } from './configs/envConfig';
import app from './app';

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  // Log a message once the server is successfully running
  console.log(`🚀 Server running on port ${PORT}`);
});
