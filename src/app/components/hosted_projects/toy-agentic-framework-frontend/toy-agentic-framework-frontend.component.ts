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

const DEBUG_PARSER = false;

// const DEBUG_CONTENT = "Certainly! Here are some key equations for commonly used loss functions in machine learning, including cross-entropy loss, mean squared error (MSE), Kullback-Leibler (KL) divergence, and the variational autoencoder (VAE) loss.\n" +
//     "\n" +
//     "---\n" +
//     "\n" +
//     "### 1. Cross-Entropy Loss\n" +
//     "\n" +
//     "For a classification problem with true label \\( y \\) and predicted probability \\( \\hat{y} \\):\n" +
//     "\n" +
//     "\\[\n" +
//     "\\mathcal{L}_{\\text{CE}} = -\\sum_{i} y_i \\log(\\hat{y}_i)\n" +
//     "\\]\n" +
//     "\n" +
//     "- For binary classification:\n" +
//     "\\[\n" +
//     "\\mathcal{L}_{\\text{BCE}} = - [y \\log(\\hat{y}) + (1 - y) \\log(1 - \\hat{y})]\n" +
//     "\\]\n" +
//     "[Source 3]\n" +
//     "\n" +
//     "---\n" +
//     "\n" +
//     "### 2. Mean Squared Error (MSE) Loss\n" +
//     "\n" +
//     "Used mainly in regression tasks:\n" +
//     "\n" +
//     "\\[\n" +
//     "\\mathcal{L}_{\\text{MSE}} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2\n" +
//     "\\]\n" +
//     "\n" +
//     "Where:\n" +
//     "- \\( y_i \\) = true value,\n" +
//     "- \\( \\hat{y}_i \\) = predicted value,\n" +
//     "- \\( n \\) = number of samples.\n" +
//     "[Source 3]\n" +
//     "\n" +
//     "---\n" +
//     "\n" +
//     "### 3. Kullback-Leibler (KL) Divergence\n" +
//     "\n" +
//     "Given two (discrete) probability distributions \\( P \\) (true) and \\( Q \\) (approximate):\n" +
//     "\n" +
//     "\\[\n" +
//     "D_{\\text{KL}}(P \\| Q) = \\sum_{i} P(i) \\log \\frac{P(i)}{Q(i)}\n" +
//     "\\]\n" +
//     "[Source 4]\n" +
//     "\n" +
//     "---\n" +
//     "\n" +
//     "### 4. Variational Autoencoder (VAE) Loss\n" +
//     "\n" +
//     "The VAE loss combines a reconstruction term (often cross-entropy or MSE) and a KL-divergence term:\n" +
//     "\n" +
//     "\\[\n" +
//     "\\mathcal{L}_{\\text{VAE}} = \\mathbb{E}_{q(z|x)} [ -\\log p(x|z)] + D_{\\text{KL}}(q(z|x) \\| p(z))\n" +
//     "\\]\n" +
//     "\n" +
//     "Where:\n" +
//     "- The first term is the reconstruction loss,\n" +
//     "- The second term is the KL divergence between the approximate posterior \\( q(z|x) \\) and the prior \\( p(z) \\).\n" +
//     "[Source 1], [Source 2]\n" +
//     "\n" +
//     "---\n" +
//     "\n" +
//     "#### References\n" +
//     "- [Source 1]: Clear derivation of the VAE KL loss: https://medium.com/@jpark7/finally-a-clear-derivation-of-the-vae-kl-loss-4cb38d2e47b3\n" +
//     "- [Source 2]: Weighting KL vs. reconstruction loss in VAEs: https://stats.stackexchange.com/questions/332179/how-to-weight-kld-loss-vs-reconstruction-loss-in-variational-auto-encoder\n" +
//     "- [Source 3]: Common loss functions (Cross-Entropy, MSE): https://arxiv.org/html/2504.04242v1\n" +
//     "- [Source 4]: KL-divergence formula: https://www.reddit.com/r/MachineLearning/comments/fftpfh/d_in_what_situation_would_one_rather_use/\n" +
//     "\n" +
//     "Would you like to see detailed explanations or derivations for any of these equations?";
// const DEBUG_SOURCES: SearchResultObject[] = [];

const DEBUG_CONTENT = "A Day in the Life: My Journey as an Electrical and Computer Engineering Student at UIUC\n" +
  "\n" +
  "When I first received my acceptance letter to the University of Illinois Urbana-Champaign's Grainger College of Engineering, I was ecstatic—and more than a little nervous. Now, as I reflect on my third year in the electrical and computer engineering (ECE) program, I can confidently say the experience has been as rewarding and challenging as I hoped.\n" +
  "\n" +
  "A Cutting-Edge Campus Experience\n" +
  "\n" +
  "The heart of my day is the ECE building, an architectural marvel filled with light, collaborative spaces, and, most importantly, state-of-the-art labs. One of my favorite aspects about UIUC is our access to hands-on opportunities—in fact, the ECE building features specially designed lab spaces that allow us to apply theory to real-world projects. Whether it’s working on embedded systems in the open lab or collaborating with classmates on late-night breadboard debugging, the resources available make all the difference [Source 2].\n" +
  "\n" +
  "Balancing Coursework and Life\n" +
  "\n" +
  "A typical week balances rigorous core classes like Signals & Systems and Computer Architecture with electives that let me tailor my path—from power systems to AI applications. Finals week is always intense, with students huddled over books and laptops in every nook of the ECE building and the nearby Grainger Library. But there’s a real sense of camaraderie: group study sessions, TA office hours, and impromptu coffee runs are just part of the fabric here [Source 3].\n" +
  "\n" +
  "Collaboration and Community\n" +
  "\n" +
  "The collaborative spirit at UIUC is one of the program’s defining strengths. I still remember the excitement of my first group project, where I worked alongside peers from all over the world. There’s a mutual respect and drive that pushes everyone to do their best—not just for themselves, but for their team. From hackathons to student organizations, I’ve found opportunities to grow both technically and personally. Meeting Grainger Engineering students like Emily Zhou, who inspire and support each other, is one of the best parts of this journey [Source 1].\n" +
  "\n" +
  "Looking Ahead\n" +
  "\n" +
  "As I dive deeper into research—guided by exceptional professors and mentors—I’m reminded why I chose UIUC. There’s so much yet to learn and endless ways to apply our knowledge to real-world challenges. For any prospective student wondering if ECE at UIUC is the right choice: be ready for hard work, lifelong friendships, and the thrill of discovery. This place truly feels like home for engineers.\n" +
  "\n" +
  "—  \n" +
  "Interested in more student stories? Visit the [Grainger Engineering blog](https://grainger.illinois.edu/news/blog) for more firsthand perspectives [Source 1].";
const DEBUG_SOURCES: SearchResultObject[] = [
  {
    title: "Blog | The Grainger College of Engineering | Illinois",
    link: "https://grainger.illinois.edu/news/blog",
    snippet: "The Electrical and Computer Engineering alumnus calls both the Champaign ... Illinois Grainger Engineering Student Emily Zhou. March 24, 2025. Wondering ...",
  },
  {
    title: "THE BUILDING CAMPAIGN FOR ECE ILLINOIS",
    link: "https://buildingcampaign.ece.illinois.edu/blog/",
    snippet: "Nov 10, 2014 ... Posted on October 27, 2014 by Daniel Dexter. In the new ECE building, a specially designed lab space gives students an opportunity to develop as ..."
  },
  {
    title: "Admissions Blog - University of Illinois Urbana-Champaign: College ...",
    link: "https://blog.admissions.illinois.edu/",
    snippet: "May 6, 2023 ... ... on your own for maybe... May 23, 2023. Students studying for finals week in the Electrical and Computer Engineering building. Admissions ..."
  },
  {
    title: "Meet our Technology-Based Healthcare Research Fellows | Illinois",
    link: "https://blogs.illinois.edu/view/7001/829069930",
    snippet: "Oct 25, 2022 ... blog posts. Meet our ... , a doctoral student in electrical and computer engineering, is working with Illinois advisor Ravishankar (Ravi) K."
  }
];

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
    { type: 'system', content: "Hello! I'm the Toy Agentic Framework. Ask me to perform a task. One prompt I enjoy: <br></br> \"Can you show me a list of equations? For starters, let's look at some equations related to different loss function, e.g., cross-entropy loss, MSE, kull-back divergence, variational auto encoder loss, etc.\"" }
  ];

  ngOnInit() {
    if (DEBUG_PARSER) {
      console.log(`DEBUG_PARSER is set to ${DEBUG_PARSER}. This helps us debug the parser.`);
      const debugMsg: ChatMessage = {
        type: 'agent',
        content: DEBUG_CONTENT,
        sources: DEBUG_SOURCES,
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
          content: `<strong>Task ID:</strong> \`${taskId}\`<br><strong>Status</strong>: \`RUNNING\`<br>Agent started work on your request. Polling status every ${this.POLLING_INTERVAL}ms...`
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
    const header = `This prompt led the agentic framework to search for additional results online. The prompt above may contain addititional resources/links, but here are the ${results.length} main sources it used for context:<br><br>`;

    const listItems = results.map((result, index) => {
      return `**[Source ${index + 1}]** <a href="${result.link}" target="_blank">${result.title}</a><br>_ ${result.snippet}_`;
    }).join('<br><br>');

    return header + listItems;
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
