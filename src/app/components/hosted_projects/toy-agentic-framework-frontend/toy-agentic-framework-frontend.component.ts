// toy-agentic-framework-frontend.component.ts
import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {catchError, interval, Observable, of, Subscription, switchMap, takeWhile} from 'rxjs';
import {AgentApiService, SearchResultObject} from '../../../services/api/toy-agentic-framework-api.services';
import { TaskStatusResponse } from '../../../services/api/toy-agentic-framework-api.services';
import { RenderLLMResponsePipe } from '../../../services/mathjax/markdown.pipe';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

// Define a simple structure for a message
interface ChatMessage {
  type: 'user' | 'agent' | 'system';
  content: string;
  renderedContent?: SafeHtml; // The final, rendered HTML
  sources?: SearchResultObject[];
}

const DEBUG_PARSER = true;

@Component({
  selector: 'app-toy-agentic-framework-frontend',
  imports: [CommonModule, FormsModule, MatIcon], // Ensure FormsModule is imported
  templateUrl: './toy-agentic-framework-frontend.component.html',
  styleUrl: './toy-agentic-framework-frontend.component.css'
})
export class ToyAgenticFrameworkFrontendComponent implements OnDestroy, OnInit {
  // Access the chat display area to enable auto-scrolling
  @ViewChild('chatDisplay') private chatDisplayRef!: ElementRef;

  currentPrompt = '';
  isTaskRunning = false;
  pollingSubscription: Subscription | null = null;
  // TODO: Perhaps in the future, I will add WebSocket support. For now, naively poll the server.
  private POLLING_INTERVAL = 200;

  // API service to the backend for this project
  private readonly apiService: AgentApiService  = inject(AgentApiService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly renderPipe = inject(RenderLLMResponsePipe);

  messages: ChatMessage[] = [
    { type: 'system', content: "Hello! I'm the Toy Agentic Framework. Ask me to perform a task (e.g., 'Summarize the global economy')." }
  ];

  ngOnInit() {
    if (DEBUG_PARSER) {
      console.log(`DEBUG_PARSER is set to ${DEBUG_PARSER}. This helps us debug the parser.`);
      const debugMsg: ChatMessage = {
        type: 'agent',
        content: "Certainly! Here are some key equations for commonly used loss functions in machine learning, including cross-entropy loss, mean squared error (MSE), Kullback-Leibler (KL) divergence, and the variational autoencoder (VAE) loss.\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### 1. Cross-Entropy Loss\n" +
          "\n" +
          "For a classification problem with true label \\( y \\) and predicted probability \\( \\hat{y} \\):\n" +
          "\n" +
          "\\[\n" +
          "\\mathcal{L}_{\\text{CE}} = -\\sum_{i} y_i \\log(\\hat{y}_i)\n" +
          "\\]\n" +
          "\n" +
          "- For binary classification:\n" +
          "\\[\n" +
          "\\mathcal{L}_{\\text{BCE}} = - [y \\log(\\hat{y}) + (1 - y) \\log(1 - \\hat{y})]\n" +
          "\\]\n" +
          "[Source 3]\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### 2. Mean Squared Error (MSE) Loss\n" +
          "\n" +
          "Used mainly in regression tasks:\n" +
          "\n" +
          "\\[\n" +
          "\\mathcal{L}_{\\text{MSE}} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2\n" +
          "\\]\n" +
          "\n" +
          "Where:\n" +
          "- \\( y_i \\) = true value,\n" +
          "- \\( \\hat{y}_i \\) = predicted value,\n" +
          "- \\( n \\) = number of samples.\n" +
          "[Source 3]\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### 3. Kullback-Leibler (KL) Divergence\n" +
          "\n" +
          "Given two (discrete) probability distributions \\( P \\) (true) and \\( Q \\) (approximate):\n" +
          "\n" +
          "\\[\n" +
          "D_{\\text{KL}}(P \\| Q) = \\sum_{i} P(i) \\log \\frac{P(i)}{Q(i)}\n" +
          "\\]\n" +
          "[Source 4]\n" +
          "\n" +
          "---\n" +
          "\n" +
          "### 4. Variational Autoencoder (VAE) Loss\n" +
          "\n" +
          "The VAE loss combines a reconstruction term (often cross-entropy or MSE) and a KL-divergence term:\n" +
          "\n" +
          "\\[\n" +
          "\\mathcal{L}_{\\text{VAE}} = \\mathbb{E}_{q(z|x)} [ -\\log p(x|z)] + D_{\\text{KL}}(q(z|x) \\| p(z))\n" +
          "\\]\n" +
          "\n" +
          "Where:\n" +
          "- The first term is the reconstruction loss,\n" +
          "- The second term is the KL divergence between the approximate posterior \\( q(z|x) \\) and the prior \\( p(z) \\).\n" +
          "[Source 1], [Source 2]\n" +
          "\n" +
          "---\n" +
          "\n" +
          "#### References\n" +
          "- [Source 1]: Clear derivation of the VAE KL loss: https://medium.com/@jpark7/finally-a-clear-derivation-of-the-vae-kl-loss-4cb38d2e47b3\n" +
          "- [Source 2]: Weighting KL vs. reconstruction loss in VAEs: https://stats.stackexchange.com/questions/332179/how-to-weight-kld-loss-vs-reconstruction-loss-in-variational-auto-encoder\n" +
          "- [Source 3]: Common loss functions (Cross-Entropy, MSE): https://arxiv.org/html/2504.04242v1\n" +
          "- [Source 4]: KL-divergence formula: https://www.reddit.com/r/MachineLearning/comments/fftpfh/d_in_what_situation_would_one_rather_use/\n" +
          "\n" +
          "Would you like to see detailed explanations or derivations for any of these equations?",
        sources: []
      };
      this.processMessage(debugMsg).then(() => {
        this.messages.push(debugMsg);
      });
    }
  }

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
        next: async (response: TaskStatusResponse | null) => {
          if (!response) {
            // Null response means an HTTP error occurred, logging is done in catchError, just ignore here
            return;
          }

          // Check if the task is finished
          if (response.status === 'Completed') {

            // get the final response from the LLM (or use a default response if the server failed)
            const finalResult: string = response.final_response || "Task completed successfully, but no result was returned.";
            // display this result
            const agentMsg: ChatMessage = {
              type: 'agent',
              content: finalResult,
              sources: response.search_results
            };
            await this.processMessage(agentMsg);
            this.messages.push(agentMsg);
            // this.messages.push({
            //   type: 'agent',
            //   content: `**Task Complete!**\n\n${finalResult}`,
            // });
            if (response.search_results && response.search_results.length > 0) {
              // the response also had a non-empty list of search results, let's display these as well in the chat
              const sourceContent = this.formatSourcesMessage(response.search_results);
              const sourceMsg: ChatMessage = {
                type: 'agent',
                content: sourceContent,
                sources: response.search_results
              };
              // Render it once
              await this.processMessage(sourceMsg);
              this.messages.push(sourceMsg);
              // this.messages.push({
              //   type: 'agent',
              //   content: sourceContent,
              //   sources: response.search_results // Store for future use if needed
              // });
            }

            this.stopTask();
          } else if (response.status === 'Failed') {
            this.messages.push({
              type: 'system',
              content: `Task FAILED. Task ID: ${taskId}`
            });
            this.stopTask();
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
          this.messages.push({
            type: 'system',
            content: `Critical polling error: ${err.message}`
          });
          this.stopTask();
        }
      });
  }

  private stopTask(): void {
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

  /**
   * Helper method to format the sources bubble content
   */
  private formatSourcesMessage(results: SearchResultObject[]): string {
    const header = `This prompt led the agentic framework to search for additional results online. Here are the ${results.length} references used in the above response:<br><br>`;

    const listItems = results.map((result, index) => {
      return `**[Source ${index + 1}]** <a href="${result.link}" target="_blank">${result.title}</a><br>_ ${result.snippet}_`;
    }).join('<br><br>');

    return header + listItems;
  }

    // Helper to extract just the URLs from the message's sources
    getSourceLinks(message: ChatMessage): string[] {
      return message.sources ? message.sources.map(s => s.link) : [];
    }

    getCurrentUrl(): string {
      return window.location.href;
    }
  private async processMessage(msg: ChatMessage): Promise<void> {
    const sourceLinks = msg.sources ? msg.sources.map(s => s.link) : [];
    console.log(`Passing raw content string to parser: \n${msg.content}`);
    msg.renderedContent = await this.renderPipe.transform(
      msg.content,
      sourceLinks,
      window.location.href
    );
    console.log(`Rendered content: \n${msg.renderedContent}`);
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
