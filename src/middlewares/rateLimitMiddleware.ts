import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, RATE_LIMIT_MESSAGE } from '../configs/envConfig';
import sendResponse from '../utils/sendResponse';

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  handler: (req, res) => {
    sendResponse(res, {
      success: false,
      statusCode: 429,
      message: RATE_LIMIT_MESSAGE,
    });
  }
});

export default apiLimiter;