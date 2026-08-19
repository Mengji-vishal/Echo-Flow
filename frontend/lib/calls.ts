import { API_BASE_URL, formatErrorMessage } from './auth';
import { EmployeeItem, CallSummary, CallDetail } from '@/types/call';

export async function fetchEmployeesApi(token: string): Promise<EmployeeItem[]> {
  const res = await fetch(`${API_BASE_URL}/employees`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = [];
  try {
    data = await res.json();
  } catch {
    data = [];
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to fetch employees.'));
  }

  return data as EmployeeItem[];
}

export async function createCallApi(
  token: string,
  employeeId: string,
  questions: string[]
): Promise<CallDetail> {
  const res = await fetch(`${API_BASE_URL}/calls`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      employee_id: employeeId,
      questions,
    }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to create assessment call.'));
  }

  return data as CallDetail;
}

export async function fetchManagerCallsApi(token: string): Promise<CallSummary[]> {
  const res = await fetch(`${API_BASE_URL}/calls`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = [];
  try {
    data = await res.json();
  } catch {
    data = [];
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to fetch manager calls.'));
  }

  return data as CallSummary[];
}

export async function fetchCallDetailApi(token: string, callId: string): Promise<CallDetail> {
  const res = await fetch(`${API_BASE_URL}/calls/${callId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, `Failed to fetch call details for ${callId}.`));
  }

  return data as CallDetail;
}

export async function completeCallApi(token: string, callId: string): Promise<CallDetail> {
  const res = await fetch(`${API_BASE_URL}/calls/${callId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, `Failed to complete call ${callId}.`));
  }

  return data as CallDetail;
}
