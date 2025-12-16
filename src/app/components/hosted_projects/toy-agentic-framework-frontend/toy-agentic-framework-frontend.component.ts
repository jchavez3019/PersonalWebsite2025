// toy-agentic-framework-frontend.component.ts
import {Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {catchError, interval, Observable, of, Subscription, switchMap, takeWhile} from 'rxjs';
import {AgentApiService} from '../../../services/api/toy-agentic-framework-api.services';
import { TaskStatusResponse } from '../../../services/api/toy-agentic-framework-api.services';

// Define a simple structure for a message
interface ChatMessage {
  type: 'user' | 'agent' | 'system';
  content: string;
}

@Component({
  selector: 'app-toy-agentic-framework-frontend',
  imports: [CommonModule, FormsModule, MatIcon], // Ensure FormsModule is imported
  templateUrl: './toy-agentic-framework-frontend.component.html',
  styleUrl: './toy-agentic-framework-frontend.component.css'
})
export class ToyAgenticFrameworkFrontendComponent implements OnDestroy {
  // Access the chat display area to enable auto-scrolling
  @ViewChild('chatDisplay') private chatDisplayRef!: ElementRef;

  currentPrompt: string = '';
  isTaskRunning: boolean = false;
  pollingSubscription: Subscription | null = null;
  // TODO: Perhaps in the future, I will add WebSocket support. For now, naively poll the server.
  private POLLING_INTERVAL = 200;

  // API service to the backend for this project
  private readonly apiService: AgentApiService  = inject(AgentApiService);

  messages: ChatMessage[] = [
    { type: 'system', content: "Hello! I'm the Toy Agentic Framework. Ask me to perform a task (e.g., 'Summarize the global economy')." }
  ];

  constructor() { }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      // unsubscribe to observables to prevent memory leaks
      this.pollingSubscription.unsubscribe();
    }
  }

  /**
   * Starts the agent task and initiates polling for status updates.
   * @param prompt The user's prompt to the LLM.
   */
  private startAgentTask(prompt: string): void {

    if (this.isTaskRunning) {
      // Allow the previous task to finish first
      this.messages.push({ type: 'system', content: 'A task is already running. Please wait for it to complete.' });
      this.scrollToBottom();
      return;
    }

    this.isTaskRunning = true;
    this.messages.push({ type: 'system', content: 'Sending task to agent...' });
    this.scrollToBottom();

    this.apiService.startTask(prompt).subscribe({
      next: (response) => {
        const taskId = response.task_id;

        // 1. Display the initial RUNNING message
        this.messages.push({
          type: 'agent',
          content: `**Task ID:** \`${taskId}\`<br>**Status:** \`RUNNING\`<br>Agent started work on your request. Polling status every ${this.POLLING_INTERVAL}ms...`
        });
        this.scrollToBottom();

        // 2. Start Polling
        this.startPolling(taskId);
      },
      error: (err) => {
        this.messages.push({ type: 'system', content: `ERROR: Could not start task. Check API endpoint and console logs. Details: ${err.message}` });
        this.isTaskRunning = false;
        this.scrollToBottom();
      }
    });
  }

  /**
   * Initiates the polling mechanism using RxJS interval.
   * @param taskId The ID of the task to poll.
   */
  private startPolling(taskId: string): void {
    // If a subscription exists, clean it up before starting a new one
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    // Use RxJS interval to fire requests every POLLING_INTERVAL
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        // SwitchMap ensures that if a new interval fires, the previous HTTP request is cancelled.
        switchMap((): Observable<TaskStatusResponse | null> => this.apiService.getTaskStatus(taskId).pipe(
          // Handle errors during polling gracefully without stopping the stream
          catchError(error => {
            console.error('Polling error:', error);
            return of(null); // Return null to continue polling on HTTP error
          })
        )),
        // TakeWhile continues the observable stream as long as the condition is TRUE
        // Stop polling when status is COMPLETE or FAILED
        // TODO: Put the template for TaskStatusResponse | null elsewhere for better typing, this is not clean
        takeWhile((response: TaskStatusResponse | null) =>
            response === null || (response.status !== 'Completed' && response.status !== 'Failed'),
          true // Inclusive: ensures the final COMPLETE/FAILED result is processed
        )
      )
      .subscribe({
        next: (response: TaskStatusResponse | null) => {
          if (!response) {
            // Null response means an HTTP error occurred, logging is done in catchError, just ignore here
            return;
          }

          // Check if the task is finished
          if (response.status === 'Completed') {
            const finalResult: string = response.final_response || "Task completed successfully, but no result was returned.";
            this.messages.push({ type: 'agent', content: `**Task Complete!**\n\n${finalResult}` });
            this.stopTask(taskId);
          } else if (response.status === 'Failed') {
            this.messages.push({ type: 'system', content: `Task FAILED. Task ID: ${taskId}` });
            this.stopTask(taskId);
          }
        },
        complete: () => {
          // This fires when takeWhile condition finally fails (i.e., status is COMPLETE/FAILED)
          // The final message is already pushed in the 'next' handler.
          this.isTaskRunning = false;
          this.scrollToBottom();
        },
        error: (err) => {
          // This block handles errors that stop the entire polling stream (e.g., critical error in initial interval setup)
          this.messages.push({ type: 'system', content: `Critical polling error: ${err.message}` });
          this.stopTask(taskId);
        }
      });
  }

  private stopTask(taskId: string): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    this.isTaskRunning = false;
    this.scrollToBottom();
  }

  /**
   * Handles sending the message when the button is clicked or Enter is pressed.
   * @param event Optional keyboard event to prevent default behavior (like form submission).
   */
  sendMessage(event?: Event): void {
    if (event) {
      // Prevent newline from being inserted when hitting Enter
      event.preventDefault();
    }

    const trimmedPrompt: string = this.currentPrompt.trim();

    if (trimmedPrompt) {
      // 1. Add the user's message to the display
      this.messages.push({ type: 'user', content: trimmedPrompt });

      // 2. Clear the input field
      this.currentPrompt = '';

      // 3. Start the API process
      this.startAgentTask(trimmedPrompt);
    }
  }

  private scrollToBottom(): void {
    try {
      // Use setTimeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        const element = this.chatDisplayRef.nativeElement;
        element.scrollTop = element.scrollHeight;
      }, 0);
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
