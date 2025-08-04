import {
  SMS_API_KEY,
  SMS_API_SECRET,
  SMS_SENDER_ID,
} from '../configs/envConfig';
import { base64Encode } from '../utils/common';
import apiClient from '../api-client';

const encodedToken = base64Encode(`${SMS_API_KEY}:${SMS_API_SECRET}`);

export const sendSMS = async (phones: string, message: string) => {
  return apiClient.post(
    'https://v3.smspoh.com/api/rest/send/bulk',
    {
      messages: [
        {
          to: phones,
          message,
          from: SMS_SENDER_ID,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${encodedToken}`,
      },
    }
  );
};

export const sendBulkSMS = async (phones: string[], message: string) => {
  return apiClient.post(
    'https://v3.smspoh.com/api/rest/send/bulk',
    {
      messages: [
        {
          to: phones,
          message,
          from: SMS_SENDER_ID,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${encodedToken}`,
      },
    }
  );
};
