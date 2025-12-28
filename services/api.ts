
/**
 * Google Sheets API Service - Production Ready
 * Handles communication with the Google Apps Script Web App
 */

// Deployment ID המעודכן ביותר לגרסת הפרודקשן
export const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbx8fAupN1hi_gIbzLUFHrFXPfrGlFaisuEpKzOAKcrz9T8GbI3mHThRiOqURGlZXmOb/exec';
export const SHEETS_MASTER_DB_URL = 'https://docs.google.com/spreadsheets/d/1SXmZw6TtjCnrggu4DAnQHqFkWlt8RuIuTvogk8ZIDmM/edit';

const callSheetsApi = async (method: 'GET' | 'POST', body?: any) => {
  const options: RequestInit = {
    method,
    mode: 'cors',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    let url = SHEETS_API_URL;
    if (method === 'GET' && body) {
      const params = new URLSearchParams(body);
      url += `?${params.toString()}`;
    }
      
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`DB_ERROR: Server returned ${response.status}`);
      return null;
    }
    
    const text = await response.text();
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      }
      return JSON.parse(text);
    } catch (e) {
      return { status: 'ok', raw: text };
    }
  } catch (error) {
    console.error("CRITICAL: Database Connection Failed", error);
    return null;
  }
};

export const syncToSheets = async (action: string, payload: any) => {
  return await callSheetsApi('POST', { action, payload });
};

export const fetchFromSheets = async (institutionId: string) => {
  // מעבר של institutionId כפרמטר שאילתה כפי שנדרש
  return await callSheetsApi('GET', { action: 'getData', institutionId });
};

export const testDbConnection = async () => {
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
    const fetchCall = fetch(`${SHEETS_API_URL}?action=ping`, { 
      method: 'GET', 
      mode: 'cors',
      redirect: 'follow'
    });
    
    const response = await Promise.race([fetchCall, timeout]) as Response;
    return response.ok;
  } catch (e) {
    console.warn("Connection test failed:", e);
    return false;
  }
};
