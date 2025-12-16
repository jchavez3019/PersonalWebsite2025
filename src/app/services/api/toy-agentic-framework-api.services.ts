// toy-agentic-framework-api.services.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// endpoint response structures
export interface TaskStartResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  final_response?: string; // Only present when status is 'Completed'
}

@Injectable({
  providedIn: 'root'
})
export class AgentApiService {

  // get the API key from the environment file
  private API_URL: string = environment.toyAgentFrameworkAPI;

  constructor(private http: HttpClient) { }

  /**
   * Sends a POST request to start a new task on the backend worker.
   * @param prompt The user's input/task description.
   * @returns Observable of the TaskStartResponse containing the task_id.
   */
  startTask(prompt: string): Observable<TaskStartResponse> {
    const body = { task: prompt };
    return this.http.post<TaskStartResponse>(`${this.API_URL}/v1/agent/execute/`, body);
  }

  /**
   * Sends a GET request to check the status of a running task.
   * @param taskId The ID of the task to check.
   * @returns Observable of the TaskStatusResponse.
   */
  getTaskStatus(taskId: string): Observable<TaskStatusResponse> {
    // add a parameters field to customize the GET request
    let params = new HttpParams();
    params = params.append('task_id', taskId);
    return this.http.get<TaskStatusResponse>(`${this.API_URL}/v1/agent/status/`, {
      params: params
    });
  }
}
